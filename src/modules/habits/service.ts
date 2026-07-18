import { z } from "zod";
import dayjs from "dayjs";
import { db } from "@/core/database";
import { eq, and, isNull, count, sql } from "drizzle-orm";
import { habits, habitCompletions } from "./schema";
import * as repo from "./repository";
import { createTimelineEvent } from "@/modules/timeline";

export const analyticsFilterSchema = z.object({
  dateFrom: z.string().nullish(),
  dateTo: z.string().nullish(),
  category: z.enum(repo.habitCategories).nullish(),
  period: z.enum(["week", "month", "quarter", "year"]).nullish(),
});

export type AnalyticsFilterParams = z.infer<typeof analyticsFilterSchema>;

function getDateRange(params: AnalyticsFilterParams) {
  if (params.dateFrom && params.dateTo) {
    return { dateFrom: params.dateFrom, dateTo: params.dateTo };
  }
  const end = dayjs();
  let start: dayjs.Dayjs;
  const period = params.period ?? "month";
  if (period === "week") start = end.subtract(7, "day");
  else if (period === "month") start = end.subtract(30, "day");
  else if (period === "quarter") start = end.subtract(90, "day");
  else start = end.subtract(365, "day");
  return { dateFrom: start.format("YYYY-MM-DD"), dateTo: end.format("YYYY-MM-DD") };
}

export function calculateStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const unique = [...new Set(dates)].sort().reverse();
  let current = 1;
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < unique.length; i++) {
    const diff = dayjs(unique[i - 1]).diff(dayjs(unique[i]), "day");
    if (diff === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  if (unique.length > 0) {
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    if (unique[0] !== today && unique[0] !== yesterday) {
      current = 0;
    } else {
      current = streak;
    }
  }

  return { current, longest };
}

function computeConsistency(completionDates: string[], dateFrom: string, dateTo: string): number {
  const totalDays = dayjs(dateTo).diff(dayjs(dateFrom), "day") + 1;
  if (totalDays <= 0) return 0;
  const completedDays = new Set(completionDates).size;
  return Math.round((completedDays / totalDays) * 100);
}

export async function getDashboard(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const previousDateFrom = dayjs(dateFrom).subtract(
    dayjs(dateTo).diff(dayjs(dateFrom), "day"),
    "day",
  ).format("YYYY-MM-DD");

  const [
    stats,
    completionRate,
    previousRate,
    habitsWithCompletions,
    dailyTrend,
    categoryDist,
    habitCount,
  ] = await Promise.all([
    repo.getOverallStats(userId),
    repo.getCompletionRate(userId, dateFrom, dateTo),
    repo.getCompletionRate(userId, previousDateFrom, dateFrom),
    repo.getHabitsWithCompletions(userId, dateFrom, dateTo),
    repo.getDailyCompletionTrend(userId, dateFrom, dateTo),
    repo.getCategoryDistribution(userId, dateFrom, dateTo),
    repo.getHabitCount(userId),
  ]);

  let allDates: string[] = [];
  let consistencySum = 0;
  const streakResults: Array<{ habitId: string; title: string; current: number; longest: number }> = [];

  for (const habit of habitsWithCompletions) {
    allDates = allDates.concat(habit.completionDates);
    const streak = calculateStreak(habit.completionDates);
    streakResults.push({
      habitId: habit.id,
      title: habit.title,
      current: streak.current,
      longest: streak.longest,
    });
    consistencySum += computeConsistency(habit.completionDates, dateFrom, dateTo);
  }

  const overallStreak = calculateStreak(allDates);
  const avgConsistency = habitsWithCompletions.length > 0
    ? Math.round(consistencySum / habitsWithCompletions.length)
    : 0;

  const rateChange = previousRate.rate > 0
    ? Math.round(completionRate.rate - previousRate.rate)
    : 0;

  const bestStreak = streakResults.reduce(
    (best, s) => (s.longest > best.longest ? s : best),
    { habitId: "", title: "", current: 0, longest: 0 },
  );

  return {
    totalHabits: stats.totalHabits,
    activeHabits: stats.activeHabits,
    completedToday: stats.completedToday,
    completionRate: completionRate.rate,
    rateChange,
    currentStreak: overallStreak.current,
    longestStreak: overallStreak.longest,
    bestStreakHabit: bestStreak.title || null,
    consistencyScore: avgConsistency,
    totalCompletions: completionRate.totalCompleted,
    missedHabits: Math.max(0, completionRate.totalExpected - completionRate.totalCompleted),
    streakResults,
    dailyTrend,
    categoryDistribution: categoryDist,
  };
}

export async function getStreaks(userId: string) {
  const habits = await repo.getHabits(userId);
  const results = await Promise.all(
    habits.map(async (habit) => {
      const dates = await repo.getCompletionDates(userId, habit.id);
      const streak = calculateStreak(dates);
      const allCompletions = await repo.getCompletions(userId, {
        habitId: habit.id,
      });
      const brokenStreaks: Array<{ from: string; to: string; length: number }> = [];
      const sorted = [...new Set(dates)].sort();
      for (let i = 1; i < sorted.length; i++) {
        const diff = dayjs(sorted[i]).diff(dayjs(sorted[i - 1]), "day");
        if (diff > 1) {
          brokenStreaks.push({
            from: sorted[i - 1],
            to: sorted[i],
            length: diff - 1,
          });
        }
      }
      return {
        habitId: habit.id,
        title: habit.title,
        current: streak.current,
        longest: streak.longest,
        totalCompletions: allCompletions.length,
        brokenStreaks,
      };
    }),
  );
  return results;
}

export async function getCompletionTrends(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const [daily, byHabit] = await Promise.all([
    repo.getDailyCompletionTrend(userId, dateFrom, dateTo),
    repo.getCompletionRatesByHabit(userId, dateFrom, dateTo),
  ]);
  return { dailyTrend: daily, habitPerformance: byHabit };
}

export async function getHeatmap(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  return repo.getHeatmapData(userId, dateFrom, dateTo);
}

export async function getRankings(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const rates = await repo.getCompletionRatesByHabit(userId, dateFrom, dateTo);

  const consistency = await repo.getHabitsWithCompletions(userId, dateFrom, dateTo);
  const withConsistency = rates.map((r) => {
    const habit = consistency.find((h) => h.id === r.habitId);
    const score = habit ? computeConsistency(habit.completionDates, dateFrom, dateTo) : 0;
    return { ...r, consistencyScore: score };
  });

  const byCompletionRate = [...withConsistency].sort((a, b) => b.rate - a.rate);
  const byConsistency = [...withConsistency].sort((a, b) => b.consistencyScore - a.consistencyScore);

  return {
    byCompletionRate,
    byConsistency,
    topPerformers: byCompletionRate.slice(0, 3),
    needsImprovement: byCompletionRate.filter((h) => h.rate < 50).slice(0, 3),
  };
}

export async function getInsights(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const dashboard = await getDashboard(userId, params);
  const trends = await getCompletionTrends(userId, params);

  const insights: Array<{ type: "positive" | "negative" | "info"; message: string }> = [];

  if (dashboard.completionRate >= 80) {
    insights.push({ type: "positive", message: `Your overall completion rate is ${dashboard.completionRate}% — excellent consistency!` });
  } else if (dashboard.completionRate >= 50) {
    insights.push({ type: "info", message: `Your overall completion rate is ${dashboard.completionRate}%. There's room for improvement.` });
  } else {
    insights.push({ type: "negative", message: `Your completion rate is ${dashboard.completionRate}%. Try reducing your habit count or starting with easier goals.` });
  }

  if (dashboard.currentStreak >= 7) {
    insights.push({ type: "positive", message: `You're on a ${dashboard.currentStreak}-day streak! Keep the momentum going.` });
  } else if (dashboard.currentStreak >= 3) {
    insights.push({ type: "info", message: `Current streak: ${dashboard.currentStreak} days. Can you make it a week?` });
  }

  if (dashboard.bestStreakHabit) {
    insights.push({ type: "positive", message: `Your best habit is "${dashboard.bestStreakHabit}" with a ${dashboard.longestStreak}-day streak.` });
  }

  if (dashboard.consistencyScore >= 70) {
    insights.push({ type: "positive", message: `Consistency score: ${dashboard.consistencyScore}%. You're building strong routines.` });
  } else {
    insights.push({ type: "info", message: `Consistency score: ${dashboard.consistencyScore}%. Try to be more regular with your habits.` });
  }

  const top3 = trends.habitPerformance.slice(0, 3);
  if (top3.length >= 2) {
    const best = top3[0];
    const worst = top3[top3.length - 1];
    if (best.rate > worst.rate) {
      insights.push({
        type: "info",
        message: `"${best.title}" (${best.rate}%) performs ${Math.round((best.rate - worst.rate) / (worst.rate || 1) * 100)}% better than "${worst.title}" (${worst.rate}%).`,
      });
    }
  }

  if (dashboard.rateChange > 5) {
    insights.push({ type: "positive", message: `Your completion rate improved ${dashboard.rateChange}% compared to the previous period.` });
  } else if (dashboard.rateChange < -5) {
    insights.push({ type: "negative", message: `Your completion rate dropped ${Math.abs(dashboard.rateChange)}% compared to the previous period.` });
  }

  const dailyCompletions = dashboard.dailyTrend;
  if (dailyCompletions.length > 0) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = new Array(7).fill(0);
    const dayTotals = new Array(7).fill(0);
    for (const d of dailyCompletions) {
      const day = new Date(d.date).getDay();
      dayTotals[day]++;
      dayCounts[day] += d.count;
    }
    let bestDay = 0;
    let worstDay = 0;
    for (let i = 0; i < 7; i++) {
      if (dayTotals[i] > 0 && dayCounts[i] > dayCounts[bestDay]) bestDay = i;
      if (dayTotals[i] > 0 && dayCounts[i] < dayCounts[worstDay]) worstDay = i;
    }
    if (dayTotals[bestDay] > 0) {
      insights.push({ type: "info", message: `You're most productive on ${dayNames[bestDay]}s with an average of ${Math.round(dayCounts[bestDay] / dayTotals[bestDay])} completions.` });
    }
    if (dayTotals[worstDay] > 0 && bestDay !== worstDay) {
      insights.push({ type: "info", message: `${dayNames[worstDay]} is your least productive day. Try scheduling lighter habits.` });
    }
  }

  return insights;
}

export async function logCompletion(
  userId: string,
  habitId: string,
  completedDate: string,
  note?: string,
) {
  const completion = await repo.createCompletion({
    userId,
    habitId,
    completedDate,
    note,
  });

  try {
    const habits = await repo.getHabits(userId);
    const habit = habits.find((h) => h.id === habitId);
    await createTimelineEvent(userId, {
      title: `Habit: ${habit?.title ?? "Completed"}`,
      description: note,
      eventDate: new Date(completedDate + "T12:00:00").toISOString(),
      category: "health",
      importance: "low",
      activityType: "habit",
      linkedEntityId: completion.id,
      linkedEntityType: "habit",
    });
  } catch {}

  return completion;
}

export async function getSummary(userId: string) {
  const today = dayjs().format("YYYY-MM-DD");
  const [habitRows, todayResult] = await Promise.all([
    db.select({ count: count() }).from(habits).where(and(eq(habits.userId, userId), isNull(habits.deletedAt))),
    db
      .select({ count: count() })
      .from(habitCompletions)
      .where(and(eq(habitCompletions.userId, userId), eq(habitCompletions.completedDate, today))),
  ]);

  const habitCount = habitRows[0]?.count ?? 0;
  const completedToday = Number(todayResult[0]?.count ?? 0);

  const allDates = await repo.getCompletionDates(userId);
  const overallStreak = calculateStreak(allDates);

  const totalExpectedResult = await db
    .select({
      daily: sql<number>`count(*) filter (where ${habits.frequency} = 'daily')`,
      weekly: sql<number>`count(*) filter (where ${habits.frequency} = 'weekly')`,
      monthly: sql<number>`count(*) filter (where ${habits.frequency} = 'monthly')`,
    })
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)));

  const { daily = 0, weekly = 0, monthly = 0 } = totalExpectedResult[0] ?? {};
  const totalExpected = Number(daily) + Number(weekly) / 7 + Number(monthly) / 30;

  return {
    totalHabits: Number(habitCount ?? 0),
    completedToday,
    pendingToday: Math.max(0, Math.ceil(totalExpected - completedToday)),
    currentStreak: overallStreak.current,
    longestStreak: overallStreak.longest,
  };
}
