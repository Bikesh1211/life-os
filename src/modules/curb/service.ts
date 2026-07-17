import { z } from "zod";
import dayjs from "dayjs";
import * as repo from "./repository";

/* ── Constants ── */

export const DEFAULT_CATEGORIES = [
  { name: "Digital", icon: "device-digital", color: "#3b82f6", sortOrder: 0 },
  { name: "Health", icon: "heart", color: "#ef4444", sortOrder: 1 },
  { name: "Productivity", icon: "target", color: "#f59e0b", sortOrder: 2 },
  { name: "Mental", icon: "brain", color: "#8b5cf6", sortOrder: 3 },
  { name: "Personal", icon: "user", color: "#10b981", sortOrder: 4 },
] as const;

export const DEFAULT_HABITS: Array<{
  name: string;
  icon: string;
  categoryName: string;
  limitType: "daily" | "weekly" | "monthly" | "zero";
  limitValue: number;
  color: string;
}> = [
  { name: "Social Media", icon: "device-mobile", categoryName: "Digital", limitType: "daily", limitValue: 3, color: "#3b82f6" },
  { name: "YouTube Shorts", icon: "video", categoryName: "Digital", limitType: "daily", limitValue: 2, color: "#6366f1" },
  { name: "Gaming", icon: "device-gamepad", categoryName: "Digital", limitType: "daily", limitValue: 1, color: "#8b5cf6" },
  { name: "Porn", icon: "eye-off", categoryName: "Digital", limitType: "zero", limitValue: 0, color: "#ef4444" },
  { name: "Doomscrolling", icon: "news", categoryName: "Digital", limitType: "daily", limitValue: 1, color: "#f43f5e" },
  { name: "Smoking", icon: "smoking", categoryName: "Health", limitType: "daily", limitValue: 2, color: "#ef4444" },
  { name: "Alcohol", icon: "glass", categoryName: "Health", limitType: "weekly", limitValue: 2, color: "#f97316" },
  { name: "Junk Food", icon: "burger", categoryName: "Health", limitType: "weekly", limitValue: 2, color: "#eab308" },
  { name: "Sugary Drinks", icon: "bottle", categoryName: "Health", limitType: "daily", limitValue: 1, color: "#84cc16" },
  { name: "Energy Drinks", icon: "bolt", categoryName: "Health", limitType: "weekly", limitValue: 1, color: "#22c55e" },
  { name: "Procrastination", icon: "clock", categoryName: "Productivity", limitType: "daily", limitValue: 3, color: "#f59e0b" },
  { name: "Skipping Work", icon: "briefcase", categoryName: "Productivity", limitType: "zero", limitValue: 0, color: "#d97706" },
  { name: "Late Wake Up", icon: "sunrise", categoryName: "Productivity", limitType: "daily", limitValue: 1, color: "#fbbf24" },
  { name: "Overthinking", icon: "brain", categoryName: "Mental", limitType: "daily", limitValue: 3, color: "#8b5cf6" },
  { name: "Negative Thinking", icon: "mood-sad", categoryName: "Mental", limitType: "daily", limitValue: 3, color: "#a855f7" },
  { name: "Swearing", icon: "message-exclamation", categoryName: "Personal", limitType: "daily", limitValue: 5, color: "#10b981" },
  { name: "Nail Biting", icon: "hand", categoryName: "Personal", limitType: "zero", limitValue: 0, color: "#34d399" },
  { name: "Impulse Buying", icon: "shopping-cart", categoryName: "Personal", limitType: "weekly", limitValue: 1, color: "#06b6d4" },
  { name: "Angry Outburst", icon: "flame", categoryName: "Mental", limitType: "weekly", limitValue: 1, color: "#dc2626" },
];

export const TRIGGER_OPTIONS = [
  "Stress", "Boredom", "Anxiety", "Friends", "After Work",
  "Late Night", "Morning", "Study Break", "Social Event",
] as const;

export const MOOD_OPTIONS = [
  "Happy", "Sad", "Stress", "Tired", "Excited", "Lonely", "Bored", "Angry",
] as const;

/* ── Zod Schemas ── */

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  limitType: z.enum(["daily", "weekly", "monthly", "zero"]).default("daily"),
  limitValue: z.number().int().min(0).default(0),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateHabitSchema = createHabitSchema.partial();

export const createLogSchema = z.object({
  habitId: z.string().uuid(),
  loggedAt: z.string().datetime().optional(),
  trigger: z.string().max(50).nullable().optional(),
  mood: z.string().max(50).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const analyticsFilterSchema = z.object({
  dateFrom: z.string().nullish(),
  dateTo: z.string().nullish(),
  period: z.enum(["week", "month", "quarter", "year"]).nullish(),
});

export type AnalyticsFilterParams = z.infer<typeof analyticsFilterSchema>;

/* ── Helpers ── */

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

function getTodayStr() {
  return dayjs().format("YYYY-MM-DD");
}

/* ── Seeding ── */

export async function ensureDefaults(userId: string) {
  const existing = await repo.getCategories(userId);
  if (existing.length > 0) return;

  const categoryMap = new Map<string, string>();

  for (const cat of DEFAULT_CATEGORIES) {
    const created = await repo.createCategory({ userId, ...cat });
    categoryMap.set(cat.name, created.id);
  }

  for (const habit of DEFAULT_HABITS) {
    const categoryId = categoryMap.get(habit.categoryName);
    if (!categoryId) continue;
    await repo.createHabit({
      userId,
      name: habit.name,
      icon: habit.icon,
      categoryId,
      limitType: habit.limitType,
      limitValue: habit.limitValue,
      color: habit.color,
      sortOrder: 0,
    });
  }
}

/* ── Categories ── */

export async function getCategories(userId: string) {
  return repo.getCategories(userId);
}

export async function createCategory(userId: string, input: unknown) {
  const data = createCategorySchema.parse(input);
  return repo.createCategory({ ...data, userId });
}

export async function updateCategory(categoryId: string, userId: string, input: unknown) {
  const data = updateCategorySchema.parse(input);
  return repo.updateCategory(categoryId, userId, data);
}

export async function deleteCategory(categoryId: string, userId: string) {
  return repo.deleteCategory(categoryId, userId);
}

/* ── Habits ── */

export async function getHabits(userId: string, opts?: { categoryId?: string; includeArchived?: boolean }) {
  return repo.getHabits(userId, opts);
}

export async function getHabitById(habitId: string, userId: string) {
  return repo.getHabitById(habitId, userId);
}

export async function createHabit(userId: string, input: unknown) {
  const data = createHabitSchema.parse(input);
  return repo.createHabit({ ...data, userId });
}

export async function updateHabit(habitId: string, userId: string, input: unknown) {
  const data = updateHabitSchema.parse(input);
  return repo.updateHabit(habitId, userId, data);
}

export async function archiveHabit(habitId: string, userId: string) {
  return repo.updateHabit(habitId, userId, { isArchived: true });
}

export async function unarchiveHabit(habitId: string, userId: string) {
  return repo.updateHabit(habitId, userId, { isArchived: false });
}

export async function deleteHabit(habitId: string, userId: string) {
  return repo.softDeleteHabit(habitId, userId);
}

/* ── Logs (Increment / Undo) ── */

export async function incrementLog(userId: string, input: unknown) {
  const data = createLogSchema.parse(input);
  const log = await repo.createLog({
    userId,
    habitId: data.habitId,
    loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    trigger: data.trigger ?? null,
    mood: data.mood ?? null,
    note: data.note ?? null,
  });
  return log;
}

export async function undoLastLog(habitId: string, userId: string) {
  const lastLog = await repo.getLastLog(habitId, userId);
  if (!lastLog) return null;
  const fiveSecondsAgo = Date.now() - 5000;
  if (new Date(lastLog.loggedAt).getTime() < fiveSecondsAgo) return null;
  await repo.deleteLog(lastLog.id, userId);
  return lastLog;
}

export async function decrementLastLog(habitId: string, userId: string) {
  const lastLog = await repo.getLastLog(habitId, userId);
  if (!lastLog) return null;
  await repo.deleteLog(lastLog.id, userId);
  return lastLog;
}

/* ── Dashboard ── */

export async function getDashboard(userId: string) {
  const today = getTodayStr();
  const thirtyDaysAgo = dayjs().subtract(30, "day").format("YYYY-MM-DD");
  const sevenDaysAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD");

  const [habits, todayLogs, dailyCounts30d, habitsWithCounts7d, habitsWithCounts30d] = await Promise.all([
    repo.getHabits(userId),
    repo.getTodayLogs(userId),
    repo.getDailyCounts(userId, thirtyDaysAgo, today),
    repo.getHabitLogsWithCounts(userId, sevenDaysAgo, today),
    repo.getHabitLogsWithCounts(userId, thirtyDaysAgo, today),
  ]);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const todayTotal = todayLogs.length;

  const habitCountsToday = new Map<string, number>();
  for (const log of todayLogs) {
    habitCountsToday.set(log.habitId, (habitCountsToday.get(log.habitId) ?? 0) + 1);
  }

  let highestHabit = { name: "", count: 0 };
  let lowestHabit = { name: "", count: Infinity };
  for (const habit of activeHabits) {
    const count = habitCountsToday.get(habit.id) ?? 0;
    if (count > highestHabit.count) highestHabit = { name: habit.name, count };
    if (count < lowestHabit.count) lowestHabit = { name: habit.name, count };
  }
  if (lowestHabit.count === Infinity) lowestHabit = { name: "", count: 0 };

  const streakDates = await Promise.all(
    activeHabits.map((h) => repo.getHabitStreakDates(userId, h.id)),
  );
  const allDates = [...new Set(streakDates.flat())].sort().reverse();
  const cleanStreak = calculateCleanStreak(allDates);

  const recoveryProgress = habitsWithCounts30d.length > 0
    ? calculateRecoveryProgress(habitsWithCounts30d, habitsWithCounts7d)
    : 0;

  const riskScore = calculateRiskScore(habitsWithCounts30d, habitsWithCounts7d, todayTotal, cleanStreak.current);

  const weekCount = habitsWithCounts7d.reduce((sum, h) => sum + h.count, 0);
  const dailyAverage30d = dailyCounts30d.length > 0
    ? Math.round(dailyCounts30d.reduce((s, d) => s + d.count, 0) / dailyCounts30d.length)
    : 0;

  const previous30dTotal = dailyCounts30d.reduce((s, d) => s + d.count, 0);
  const todayRatio = dailyAverage30d > 0 ? todayTotal / dailyAverage30d : 0;

  return {
    todayTotal,
    highestHabit: highestHabit.count > 0 ? highestHabit : null,
    lowestHabit: lowestHabit.count > 0 ? lowestHabit : null,
    activeHabitCount: activeHabits.length,
    cleanStreak: cleanStreak.current,
    longestCleanStreak: cleanStreak.longest,
    recoveryProgress,
    riskScore,
    dailyAverage30d,
    weekTotal: weekCount,
    todayRatio,
  };
}

/* ── Calendar ── */

export async function getCalendarData(userId: string, year: number, month: number) {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const dateFrom = start.format("YYYY-MM-DD");
  const dateTo = start.endOf("month").format("YYYY-MM-DD");

  const dailyCounts = await repo.getDailyCounts(userId, dateFrom, dateTo);
  const countMap = new Map(dailyCounts.map((d) => [d.date, d.count]));
  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);

  const days: Array<{ date: string; count: number; intensity: number }> = [];
  const daysInMonth = start.daysInMonth();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = start.date(i).format("YYYY-MM-DD");
    const count = countMap.get(date) ?? 0;
    const intensity = maxCount > 0 ? count / maxCount : 0;
    days.push({ date, count, intensity });
  }

  return { year, month, days, total: dailyCounts.reduce((s, d) => s + d.count, 0) };
}

/* ── Timeline ── */

export async function getTimeline(userId: string, date: string) {
  const logs = await repo.getLogsForDateRange(userId, date, date);
  const habits = await repo.getHabits(userId, { includeArchived: true });
  const habitMap = new Map(habits.map((h) => [h.id, h]));

  return logs.map((log) => {
    const habit = habitMap.get(log.habitId);
    return {
      id: log.id,
      habitId: log.habitId,
      habitName: habit?.name ?? "Unknown",
      habitIcon: habit?.icon ?? null,
      habitColor: habit?.color ?? null,
      loggedAt: log.loggedAt,
      trigger: log.trigger,
      mood: log.mood,
      note: log.note,
    };
  });
}

/* ── Streaks ── */

function calculateCleanStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const unique = [...new Set(dates)].sort().reverse();

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const todayHasLog = unique[0] === today;
  const yesterdayHasLog = unique[0] === yesterday;

  let longest = 0;
  let streak = 1;

  for (let i = 1; i < unique.length; i++) {
    const diff = dayjs(unique[i - 1]).diff(dayjs(unique[i]), "day");
    if (diff === 1) {
      streak++;
    } else {
      if (streak > longest) longest = streak;
      streak = 1;
    }
  }
  if (streak > longest) longest = streak;

  let current = 0;
  if (todayHasLog) {
    current = 1;
    for (let i = 1; i < unique.length; i++) {
      const diff = dayjs(unique[i - 1]).diff(dayjs(unique[i]), "day");
      if (diff === 1) current++;
      else break;
    }
  } else if (yesterdayHasLog) {
    current = 1;
    for (let i = 1; i < unique.length - 1; i++) {
      const diff = dayjs(unique[i]).diff(dayjs(unique[i + 1]), "day");
      if (diff === 1) current++;
      else break;
    }
  }

  const daysWithout = dayjs().diff(dayjs(unique[0]), "day");
  return { current: daysWithout, longest };
}

function calculateTargetStreak(logDates: string[], limitType: string, limitValue: number, dateFrom: string, dateTo: string) {
  const countsByDate = new Map<string, number>();
  for (const date of logDates) {
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
  }

  let current = 0;
  let longest = 0;
  let streak = 0;

  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  let d = start;
  const dates: string[] = [];

  while (d.isBefore(end) || d.isSame(end, "day")) {
    dates.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }

  for (const date of dates) {
    const count = countsByDate.get(date) ?? 0;

    if (limitType === "zero" ? count === 0 : count <= limitValue) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      current = streak;
      streak = 0;
    }
  }

  current = streak;

  return { current, longest };
}

/* ── Risk Score ── */

function calculateRiskScore(
  counts30d: Array<{ habitId: string; count: number }>,
  counts7d: Array<{ habitId: string; count: number }>,
  todayTotal: number,
  cleanStreakDays: number,
) {
  const avg30dTotal = counts30d.reduce((s, h) => s + h.count, 0) / Math.max(counts30d.length, 1);
  const todayRatio = avg30dTotal > 0 ? todayTotal / avg30dTotal : 0;

  const exceededCount = counts7d.filter((h) => {
    const avg = h.count / 7;
    return avg > 10;
  }).length;

  const streakBreaks = cleanStreakDays === 0 ? 1 : 0;

  return Math.min(100, Math.round(todayRatio * 40 + exceededCount * 30 + streakBreaks * 30));
}

/* ── Recovery Progress ── */

function calculateRecoveryProgress(
  counts30d: Array<{ habitId: string; count: number }>,
  counts7d: Array<{ habitId: string; count: number }>,
) {
  const map7d = new Map(counts7d.map((h) => [h.habitId, h.count]));

  const progressValues: number[] = [];
  for (const h of counts30d) {
    const prevAvg = h.count / 30;
    const currentAvg = (map7d.get(h.habitId) ?? 0) / 7;
    if (prevAvg > 0) {
      const progress = Math.max(0, Math.round(((prevAvg - currentAvg) / prevAvg) * 100));
      progressValues.push(progress);
    }
  }

  if (progressValues.length === 0) return 0;
  return Math.round(progressValues.reduce((s, v) => s + v, 0) / progressValues.length);
}

/* ── Analytics ── */

export async function getAnalytics(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const previousDateFrom = dayjs(dateFrom)
    .subtract(dayjs(dateTo).diff(dayjs(dateFrom), "day"), "day")
    .format("YYYY-MM-DD");

  const [dailyCounts, currentHabitCounts, previousHabitCounts, triggerDist, moodDist, habits] = await Promise.all([
    repo.getDailyCounts(userId, dateFrom, dateTo),
    repo.getHabitLogsWithCounts(userId, dateFrom, dateTo),
    repo.getHabitLogsWithCounts(userId, previousDateFrom, dateFrom),
    repo.getTriggerDistribution(userId, dateFrom, dateTo),
    repo.getMoodDistribution(userId, dateFrom, dateTo),
    repo.getHabits(userId),
  ]);

  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const totalCurrent = currentHabitCounts.reduce((s, h) => s + h.count, 0);
  const totalPrevious = previousHabitCounts.reduce((s, h) => s + h.count, 0);
  const days = dailyCounts.length;
  const dailyAverage = days > 0 ? Math.round(totalCurrent / days) : 0;
  const improvement = totalPrevious > 0
    ? Math.round(((totalPrevious - totalCurrent) / totalPrevious) * 100)
    : 0;

  const habitRankings = currentHabitCounts
    .map((h) => ({
      habitId: h.habitId,
      habitName: habitMap.get(h.habitId)?.name ?? "Unknown",
      count: h.count,
      previousCount: previousHabitCounts.find((p) => p.habitId === h.habitId)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const bestDay = dailyCounts.reduce((best, d) => (d.count < best.count ? d : best), dailyCounts[0] ?? { date: "", count: Infinity });
  const worstDay = dailyCounts.reduce((worst, d) => (d.count > worst.count ? d : worst), dailyCounts[0] ?? { date: "", count: 0 });

  return {
    dateFrom,
    dateTo,
    totalCount: totalCurrent,
    dailyAverage,
    improvement,
    regression: Math.max(0, -improvement),
    bestDay: bestDay.count < Infinity ? bestDay : null,
    worstDay: worstDay.count > 0 ? worstDay : null,
    highestHabit: habitRankings[0] ?? null,
    lowestHabit: habitRankings[habitRankings.length - 1] ?? null,
    habitRankings,
    dailyTrend: dailyCounts,
    triggerDistribution: triggerDist,
    moodDistribution: moodDist,
  };
}

export async function getHabitStats(habitId: string, userId: string) {
  const habit = await repo.getHabitById(habitId, userId);
  if (!habit) return null;

  const today = getTodayStr();
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const thisWeekStart = dayjs().startOf("week").format("YYYY-MM-DD");
  const lastWeekStart = dayjs().subtract(1, "week").startOf("week").format("YYYY-MM-DD");
  const lastWeekEnd = dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD");
  const thisMonthStart = dayjs().startOf("month").format("YYYY-MM-DD");
  const lastMonthStart = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
  const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD");
  const thisYearStart = dayjs().startOf("year").format("YYYY-MM-DD");
  const lifetimeStart = "2000-01-01";
  const todayEnd = today;

  const [
    todayCount,
    yesterdayCount,
    thisWeekCount,
    lastWeekCount,
    thisMonthCount,
    lastMonthCount,
    thisYearCount,
    lifetimeCount,
    streakDates,
    hourlyDist,
  ] = await Promise.all([
    repo.getPeriodCount(habitId, userId, today, today),
    repo.getPeriodCount(habitId, userId, yesterday, yesterday),
    repo.getPeriodCount(habitId, userId, thisWeekStart, today),
    repo.getPeriodCount(habitId, userId, lastWeekStart, lastWeekEnd),
    repo.getPeriodCount(habitId, userId, thisMonthStart, today),
    repo.getPeriodCount(habitId, userId, lastMonthStart, lastMonthEnd),
    repo.getPeriodCount(habitId, userId, thisYearStart, today),
    repo.getPeriodCount(habitId, userId, lifetimeStart, today),
    repo.getHabitStreakDates(userId, habitId),
    repo.getHourlyDistribution(habitId, userId, thisMonthStart, today),
  ]);

  const cleanStreak = calculateCleanStreak(streakDates);
  const targetStreak = calculateTargetStreak(streakDates, habit.limitType, habit.limitValue, thisMonthStart, today);

  const mostCommonHour = hourlyDist.length > 0
    ? hourlyDist.reduce((best, h) => (h.count > best.count ? h : best))
    : null;

  return {
    today: todayCount,
    yesterday: yesterdayCount,
    thisWeek: thisWeekCount,
    lastWeek: lastWeekCount,
    thisMonth: thisMonthCount,
    lastMonth: lastMonthCount,
    thisYear: thisYearCount,
    lifetime: lifetimeCount,
    cleanStreak: cleanStreak.current,
    longestCleanStreak: cleanStreak.longest,
    targetStreak: targetStreak.current,
    longestTargetStreak: targetStreak.longest,
    mostCommonHour: mostCommonHour?.hour ?? null,
    hourlyDistribution: hourlyDist,
  };
}

/* ── Insights ── */

export async function getInsights(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);
  const analytics = await getAnalytics(userId, params);

  const insights: Array<{ type: "positive" | "negative" | "info"; message: string }> = [];

  if (analytics.improvement > 20) {
    insights.push({ type: "positive", message: `You've reduced total bad habits by ${analytics.improvement}% this period — great progress!` });
  } else if (analytics.improvement > 5) {
    insights.push({ type: "positive", message: `You've reduced bad habits by ${analytics.improvement}% compared to the previous period.` });
  } else if (analytics.regression > 20) {
    insights.push({ type: "negative", message: `Bad habits increased by ${analytics.regression}% this period. Review what changed.` });
  } else if (analytics.regression > 5) {
    insights.push({ type: "negative", message: `Bad habits slightly increased (${analytics.regression}%) compared to last period.` });
  }

  if (analytics.highestHabit && analytics.highestHabit.count > analytics.dailyAverage) {
    insights.push({
      type: "info",
      message: `"${analytics.highestHabit.habitName}" is your most frequent habit at ${analytics.highestHabit.count} occurrences.`,
    });
  }

  if (analytics.triggerDistribution.length > 0) {
    const topTrigger = analytics.triggerDistribution[0];
    const totalTriggered = analytics.triggerDistribution.reduce((s, t) => s + t.count, 0);
    const pct = Math.round((topTrigger.count / totalTriggered) * 100);
    insights.push({
      type: "info",
      message: `"${topTrigger.trigger}" is associated with ${pct}% of your logs. Stress is your most common trigger.`,
    });
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const d of analytics.dailyTrend) {
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
    insights.push({ type: "info", message: `${dayNames[bestDay]} has the most bad habits averaging ${Math.round(dayCounts[bestDay] / dayTotals[bestDay])} per day.` });
  }
  if (dayTotals[worstDay] > 0 && bestDay !== worstDay) {
    insights.push({ type: "info", message: `${dayNames[worstDay]} has the fewest bad habits averaging ${Math.round(dayCounts[worstDay] / dayTotals[worstDay])} per day.` });
  }

  const [_, triggerDistFull] = await Promise.all([
    repo.getTriggerDistribution(userId, dateFrom, dateTo),
    repo.getHourlyDistribution("", userId, dateFrom, dateTo),
  ]);

  if (analytics.triggerDistribution.length > 1) {
    const secondTrigger = analytics.triggerDistribution[1];
    insights.push({
      type: "info",
      message: `"${secondTrigger.trigger}" is the second most common trigger. Notice when ${secondTrigger.trigger?.toLowerCase()} leads to bad habits.`,
    });
  }

  return insights;
}
