import { db } from "@/core/database";
import { and, eq, gte, lte, sql, count, desc, asc, isNull } from "drizzle-orm";
import { curbCategories, curbHabits, curbLogs } from "./schema";

export type CurbCategory = typeof curbCategories.$inferSelect;
export type CreateCategoryInput = typeof curbCategories.$inferInsert;

export type CurbHabit = typeof curbHabits.$inferSelect;
export type CreateHabitInput = typeof curbHabits.$inferInsert;

export type CurbLog = typeof curbLogs.$inferSelect;
export type CreateLogInput = typeof curbLogs.$inferInsert;

/* ── Categories ── */

export async function getCategories(userId: string) {
  return db
    .select()
    .from(curbCategories)
    .where(eq(curbCategories.userId, userId))
    .orderBy(asc(curbCategories.sortOrder));
}

export async function getCategoryById(id: string, userId: string) {
  return db
    .select()
    .from(curbCategories)
    .where(and(eq(curbCategories.id, id), eq(curbCategories.userId, userId)))
    .then((r) => r[0] ?? null);
}

export async function createCategory(input: CreateCategoryInput) {
  const [category] = await db.insert(curbCategories).values(input).returning();
  return category;
}

export async function updateCategory(id: string, userId: string, input: Partial<CreateCategoryInput>) {
  const [category] = await db
    .update(curbCategories)
    .set(input)
    .where(and(eq(curbCategories.id, id), eq(curbCategories.userId, userId)))
    .returning();
  return category ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  const [category] = await db
    .delete(curbCategories)
    .where(and(eq(curbCategories.id, id), eq(curbCategories.userId, userId)))
    .returning();
  return category ?? null;
}

/* ── Habits ── */

export async function getHabits(userId: string, opts: { categoryId?: string; includeArchived?: boolean } = {}) {
  const conditions = [eq(curbHabits.userId, userId), isNull(curbHabits.deletedAt)];
  if (opts.categoryId) conditions.push(eq(curbHabits.categoryId, opts.categoryId));
  if (!opts.includeArchived) conditions.push(eq(curbHabits.isArchived, false));
  return db
    .select()
    .from(curbHabits)
    .where(and(...conditions))
    .orderBy(asc(curbHabits.sortOrder));
}

export async function getHabitById(id: string, userId: string) {
  return db
    .select()
    .from(curbHabits)
    .where(and(eq(curbHabits.id, id), eq(curbHabits.userId, userId)))
    .then((r) => r[0] ?? null);
}

export async function createHabit(input: CreateHabitInput) {
  const [habit] = await db.insert(curbHabits).values(input).returning();
  return habit;
}

export async function updateHabit(id: string, userId: string, input: Partial<CreateHabitInput>) {
  const [habit] = await db
    .update(curbHabits)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(curbHabits.id, id), eq(curbHabits.userId, userId)))
    .returning();
  return habit ?? null;
}

export async function softDeleteHabit(id: string, userId: string) {
  const [habit] = await db
    .update(curbHabits)
    .set({ deletedAt: new Date() })
    .where(and(eq(curbHabits.id, id), eq(curbHabits.userId, userId)))
    .returning();
  return habit ?? null;
}

export async function getHabitCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(curbHabits)
    .where(and(eq(curbHabits.userId, userId), isNull(curbHabits.deletedAt), eq(curbHabits.isArchived, false)));
  return Number(result?.count ?? 0);
}

/* ── Logs ── */

export async function createLog(input: CreateLogInput) {
  const [log] = await db.insert(curbLogs).values(input).returning();
  return log;
}

export async function getLastLog(habitId: string, userId: string) {
  return db
    .select()
    .from(curbLogs)
    .where(and(eq(curbLogs.habitId, habitId), eq(curbLogs.userId, userId)))
    .orderBy(desc(curbLogs.loggedAt))
    .limit(1)
    .then((r) => r[0] ?? null);
}

export async function deleteLog(id: string, userId: string) {
  const [log] = await db
    .delete(curbLogs)
    .where(and(eq(curbLogs.id, id), eq(curbLogs.userId, userId)))
    .returning();
  return log ?? null;
}

export async function getLogsForHabit(habitId: string, userId: string, dateFrom?: string, dateTo?: string) {
  const conditions = [eq(curbLogs.habitId, habitId), eq(curbLogs.userId, userId)];
  if (dateFrom) conditions.push(gte(curbLogs.loggedAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")));
  return db.select().from(curbLogs).where(and(...conditions)).orderBy(desc(curbLogs.loggedAt));
}

export async function getLogsForDateRange(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select()
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .orderBy(desc(curbLogs.loggedAt));
}

export async function getTodayLogs(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return getLogsForDateRange(userId, today, today);
}

export async function getTodayCount(habitId: string, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [result] = await db
    .select({ count: count() })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.habitId, habitId),
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(today)),
        lte(curbLogs.loggedAt, new Date(today + "T23:59:59.999Z")),
      ),
    );
  return Number(result?.count ?? 0);
}

export async function getPeriodCount(habitId: string, userId: string, dateFrom: string, dateTo: string) {
  const [result] = await db
    .select({ count: count() })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.habitId, habitId),
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
      ),
    );
  return Number(result?.count ?? 0);
}

export async function getHabitLogsWithCounts(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select({
      habitId: curbLogs.habitId,
      count: count(),
    })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .groupBy(curbLogs.habitId);
}

/* ── Analytics ── */

export async function getDailyCounts(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select({
      date: sql<string>`DATE(${curbLogs.loggedAt})`,
      count: count(),
    })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .groupBy(sql`DATE(${curbLogs.loggedAt})`)
    .orderBy(asc(sql`DATE(${curbLogs.loggedAt})`));
}

export async function getTriggerDistribution(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select({
      trigger: curbLogs.trigger,
      count: count(),
    })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
        sql`${curbLogs.trigger} IS NOT NULL`,
      ),
    )
    .groupBy(curbLogs.trigger)
    .orderBy(desc(count()));
}

export async function getMoodDistribution(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select({
      mood: curbLogs.mood,
      count: count(),
    })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
        sql`${curbLogs.mood} IS NOT NULL`,
      ),
    )
    .groupBy(curbLogs.mood)
    .orderBy(desc(count()));
}

export async function getHourlyDistribution(habitId: string, userId: string, dateFrom: string, dateTo: string) {
  return db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${curbLogs.loggedAt})`,
      count: count(),
    })
    .from(curbLogs)
    .where(
      and(
        eq(curbLogs.habitId, habitId),
        eq(curbLogs.userId, userId),
        gte(curbLogs.loggedAt, new Date(dateFrom)),
        lte(curbLogs.loggedAt, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .groupBy(sql`EXTRACT(HOUR FROM ${curbLogs.loggedAt})`)
    .orderBy(asc(sql`EXTRACT(HOUR FROM ${curbLogs.loggedAt})`));
}

export async function getHabitStreakDates(userId: string, habitId: string) {
  const rows = await db
    .select({
      date: sql<string>`DISTINCT DATE(${curbLogs.loggedAt})`,
    })
    .from(curbLogs)
    .where(and(eq(curbLogs.habitId, habitId), eq(curbLogs.userId, userId)))
    .orderBy(desc(sql`DATE(${curbLogs.loggedAt})`));
  return rows.map((r) => r.date);
}
