import { db } from "@/core/database";
import { and, eq, gte, lte, sql, count, desc, asc, isNull } from "drizzle-orm";
import { habits, habitCompletions, habitCategoryEnum } from "./schema";

export type Habit = typeof habits.$inferSelect;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type CreateHabitInput = typeof habits.$inferInsert;
export type CreateCompletionInput = typeof habitCompletions.$inferInsert;

export const habitCategories = habitCategoryEnum.enumValues;

export async function getHabits(userId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)))
    .orderBy(asc(habits.createdAt));
}

export async function getHabitById(id: string, userId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .then((r) => r[0] ?? null);
}

export async function createCompletion(input: CreateCompletionInput) {
  const [completion] = await db.insert(habitCompletions).values(input).returning();
  return completion;
}

export async function getCompletions(
  userId: string,
  opts: { habitId?: string; dateFrom?: string; dateTo?: string } = {},
) {
  const conditions = [eq(habitCompletions.userId, userId)];
  if (opts.habitId) conditions.push(eq(habitCompletions.habitId, opts.habitId));
  if (opts.dateFrom) conditions.push(gte(habitCompletions.completedDate, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(habitCompletions.completedDate, opts.dateTo));
  return db.select().from(habitCompletions).where(and(...conditions)).orderBy(desc(habitCompletions.completedDate));
}

export async function getOverallStats(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [habitCount, activeCount, todayCompletions, previousCompletions] = await Promise.all([
    db.select({ count: count() }).from(habits).where(and(eq(habits.userId, userId), isNull(habits.deletedAt))),
    db
      .select({ count: count() })
      .from(habits)
      .where(and(eq(habits.userId, userId), isNull(habits.deletedAt))),
    db
      .select({ count: count() })
      .from(habitCompletions)
      .where(and(eq(habitCompletions.userId, userId), eq(habitCompletions.completedDate, today))),
    db
      .select({ count: count() })
      .from(habitCompletions)
      .where(and(eq(habitCompletions.userId, userId), eq(habitCompletions.completedDate, thirtyDaysAgo))),
  ]);

  return {
    totalHabits: Number(habitCount[0]?.count ?? 0),
    activeHabits: Number(activeCount[0]?.count ?? 0),
    completedToday: Number(todayCompletions[0]?.count ?? 0),
    previousCompletedToday: Number(previousCompletions[0]?.count ?? 0),
  };
}

export async function getCompletionRate(userId: string, dateFrom: string, dateTo: string) {
  const activeHabits = await db
    .select({ id: habits.id, frequency: habits.frequency })
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)));

  if (activeHabits.length === 0) return { rate: 0, totalExpected: 0, totalCompleted: 0 };

  const completions = await db
    .select({
      habitId: habitCompletions.habitId,
      count: count(),
    })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.userId, userId), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .groupBy(habitCompletions.habitId);

  const daysInRange = Math.max(1, Math.round(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000
  ));

  const completionMap = new Map(completions.map((c) => [c.habitId, Number(c.count)]));
  let totalCompleted = 0;
  let totalExpected = 0;

  for (const habit of activeHabits) {
    const completed = completionMap.get(habit.id) ?? 0;
    totalCompleted += completed;
    if (habit.frequency === "daily") totalExpected += daysInRange;
    else if (habit.frequency === "weekly") totalExpected += Math.max(1, Math.round(daysInRange / 7));
    else if (habit.frequency === "monthly") totalExpected += Math.max(1, Math.round(daysInRange / 30));
  }

  return {
    rate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0,
    totalCompleted,
    totalExpected,
  };
}

export async function getCompletionRatesByHabit(userId: string, dateFrom: string, dateTo: string) {
  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)));

  const completions = await db
    .select({
      habitId: habitCompletions.habitId,
      count: count(),
    })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.userId, userId), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .groupBy(habitCompletions.habitId);

  const completionMap = new Map(completions.map((c) => [c.habitId, Number(c.count)]));
  const daysInRange = Math.max(1, Math.round(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000
  ));

  return activeHabits.map((habit) => {
    const completed = completionMap.get(habit.id) ?? 0;
    let expected = 0;
    if (habit.frequency === "daily") expected = daysInRange;
    else if (habit.frequency === "weekly") expected = Math.max(1, Math.round(daysInRange / 7));
    else if (habit.frequency === "monthly") expected = Math.max(1, Math.round(daysInRange / 30));

    return {
      habitId: habit.id,
      title: habit.title,
      category: habit.category,
      frequency: habit.frequency,
      completed,
      expected,
      rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    };
  }).sort((a, b) => b.rate - a.rate);
}

export async function getDailyCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      date: habitCompletions.completedDate,
      count: count(),
    })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.userId, userId), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .groupBy(habitCompletions.completedDate)
    .orderBy(asc(habitCompletions.completedDate));

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

export async function getCategoryDistribution(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      category: habits.category,
      completed: count(habitCompletions.id),
    })
    .from(habits)
    .leftJoin(habitCompletions, eq(habits.id, habitCompletions.habitId))
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .groupBy(habits.category);

  return rows.map((r) => ({ category: r.category ?? "uncategorized", completed: Number(r.completed) }));
}

export async function getHeatmapData(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      date: habitCompletions.completedDate,
      count: count(),
    })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.userId, userId), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .groupBy(habitCompletions.completedDate);

  const map = new Map(rows.map((r) => [r.date, Number(r.count)]));
  const result: Array<{ date: string; count: number }> = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

export async function getCompletionDates(userId: string, habitId?: string) {
  const conditions = [eq(habitCompletions.userId, userId)];
  if (habitId) conditions.push(eq(habitCompletions.habitId, habitId));
  const rows = await db
    .select({ date: habitCompletions.completedDate })
    .from(habitCompletions)
    .where(and(...conditions))
    .orderBy(asc(habitCompletions.completedDate));
  return rows.map((r) => r.date);
}

export async function getHabitsWithCompletions(userId: string, dateFrom: string, dateTo: string) {
  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)));

  const completions = await db
    .select({
      habitId: habitCompletions.habitId,
      date: habitCompletions.completedDate,
    })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.userId, userId), gte(habitCompletions.completedDate, dateFrom), lte(habitCompletions.completedDate, dateTo)))
    .orderBy(asc(habitCompletions.completedDate));

  const grouped = new Map<string, string[]>();
  for (const c of completions) {
    const arr = grouped.get(c.habitId) ?? [];
    arr.push(c.date);
    grouped.set(c.habitId, arr);
  }

  return activeHabits.map((h) => ({
    ...h,
    completionDates: grouped.get(h.id) ?? [],
  }));
}

export async function getHabitCount(userId: string) {
  return db
    .select({ count: count() })
    .from(habits)
    .where(and(eq(habits.userId, userId), isNull(habits.deletedAt)))
    .then((r) => Number(r[0]?.count ?? 0));
}
