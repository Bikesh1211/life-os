import { db } from "@/core/database";
import {
  timeEntries,
  timeCategories,
  timeActiveTimer,
  timeBudgets,
  timeUserPreferences,
} from "./schema";
import { eq, and, isNull, desc, asc, sql, gte, lte, inArray, ne, or, lt, gt, SQL } from "drizzle-orm";

export type TimeEntry = typeof timeEntries.$inferSelect;
export type CreateTimeEntryInput = typeof timeEntries.$inferInsert;
export type UpdateTimeEntryInput = Partial<Omit<CreateTimeEntryInput, "id" | "userId" | "createdAt">>;

export type TimeCategory = typeof timeCategories.$inferSelect;
export type CreateTimeCategoryInput = typeof timeCategories.$inferInsert;

export type TimeBudget = typeof timeBudgets.$inferSelect;
export type CreateTimeBudgetInput = typeof timeBudgets.$inferInsert;

export type TimeActiveTimer = typeof timeActiveTimer.$inferSelect;
export type TimeUserPreferences = typeof timeUserPreferences.$inferSelect;

// ─── Time Entries ──────────────────────────────────────────────

export async function createEntry(input: CreateTimeEntryInput) {
  const [entry] = await db.insert(timeEntries).values(input).returning();
  return entry;
}

export async function getEntries(
  userId: string,
  opts: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    projectId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {},
) {
  const conditions: SQL[] = [
    eq(timeEntries.userId, userId),
    isNull(timeEntries.deletedAt),
  ];
  if (opts.dateFrom) conditions.push(gte(timeEntries.startTime, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(timeEntries.startTime, new Date(opts.dateTo)));
  if (opts.categoryId) conditions.push(eq(timeEntries.categoryId, opts.categoryId));
  if (opts.projectId) conditions.push(eq(timeEntries.projectId, opts.projectId));
  if (opts.tags?.length) {
    conditions.push(sql`${timeEntries.tags} && ${opts.tags}`);
  }

  return db
    .select()
    .from(timeEntries)
    .where(and(...conditions))
    .orderBy(desc(timeEntries.startTime))
    .limit(opts.limit ?? 200)
    .offset(opts.offset ?? 0);
}

export async function getEntryById(id: string, userId: string) {
  const [entry] = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId), isNull(timeEntries.deletedAt)));
  return entry ?? null;
}

export async function updateEntry(id: string, userId: string, input: UpdateTimeEntryInput) {
  const [entry] = await db
    .update(timeEntries)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId), isNull(timeEntries.deletedAt)))
    .returning();
  return entry ?? null;
}

export async function deleteEntry(id: string, userId: string) {
  const [entry] = await db
    .update(timeEntries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId), isNull(timeEntries.deletedAt)))
    .returning();
  return entry ?? null;
}

export async function getOverlappingEntries(
  userId: string,
  startTime: Date,
  endTime: Date | null,
  excludeId?: string,
) {
  const conditions: SQL[] = [
    eq(timeEntries.userId, userId),
    isNull(timeEntries.deletedAt),
    lt(timeEntries.startTime, endTime ?? new Date("2100-01-01")),
    sql`(${isNull(timeEntries.endTime)} OR ${gt(timeEntries.endTime, startTime)})`,
  ];
  if (excludeId) conditions.push(ne(timeEntries.id, excludeId));
  return db.select().from(timeEntries).where(and(...conditions)).limit(5);
}

export async function getEntriesByDateRange(userId: string, dateFrom: Date, dateTo: Date) {
  return db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
        gte(timeEntries.startTime, dateFrom),
        lte(timeEntries.startTime, dateTo),
      ),
    )
    .orderBy(asc(timeEntries.startTime));
}

// ─── Categories ────────────────────────────────────────────────

export async function createCategory(input: CreateTimeCategoryInput) {
  const [cat] = await db.insert(timeCategories).values(input).returning();
  return cat;
}

export async function getCategories(userId: string) {
  return db
    .select()
    .from(timeCategories)
    .where(and(eq(timeCategories.userId, userId)))
    .orderBy(asc(timeCategories.sortOrder), asc(timeCategories.name));
}

export async function updateCategory(id: string, userId: string, input: Partial<CreateTimeCategoryInput>) {
  const [cat] = await db
    .update(timeCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(timeCategories.id, id), eq(timeCategories.userId, userId)))
    .returning();
  return cat ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  const [cat] = await db
    .delete(timeCategories)
    .where(and(eq(timeCategories.id, id), eq(timeCategories.userId, userId)))
    .returning();
  return cat ?? null;
}

// ─── Active Timer ──────────────────────────────────────────────

export async function upsertActiveTimer(input: typeof timeActiveTimer.$inferInsert) {
  const [timer] = await db
    .insert(timeActiveTimer)
    .values(input)
    .onConflictDoUpdate({
      target: timeActiveTimer.userId,
      set: {
        entryId: input.entryId,
        startTime: input.startTime,
        elapsedBeforePause: input.elapsedBeforePause ?? 0,
        isPaused: input.isPaused ?? false,
        updatedAt: new Date(),
      },
    })
    .returning();
  return timer;
}

export async function getActiveTimer(userId: string) {
  const [timer] = await db
    .select()
    .from(timeActiveTimer)
    .where(eq(timeActiveTimer.userId, userId));
  return timer ?? null;
}

export async function deleteActiveTimer(userId: string) {
  const [timer] = await db
    .delete(timeActiveTimer)
    .where(eq(timeActiveTimer.userId, userId))
    .returning();
  return timer ?? null;
}

// ─── Budgets ───────────────────────────────────────────────────

export async function createBudget(input: CreateTimeBudgetInput) {
  const [budget] = await db.insert(timeBudgets).values(input).returning();
  return budget;
}

export async function getBudgets(userId: string) {
  return db
    .select()
    .from(timeBudgets)
    .where(eq(timeBudgets.userId, userId));
}

export async function updateBudget(id: string, userId: string, input: Partial<CreateTimeBudgetInput>) {
  const [budget] = await db
    .update(timeBudgets)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(timeBudgets.id, id), eq(timeBudgets.userId, userId)))
    .returning();
  return budget ?? null;
}

export async function deleteBudget(id: string, userId: string) {
  const [budget] = await db
    .delete(timeBudgets)
    .where(and(eq(timeBudgets.id, id), eq(timeBudgets.userId, userId)))
    .returning();
  return budget ?? null;
}

// ─── User Preferences ─────────────────────────────────────────

export async function upsertPreferences(userId: string, prefs: Partial<TimeUserPreferences>) {
  const [result] = await db
    .insert(timeUserPreferences)
    .values({ userId, widgetVisibility: prefs.widgetVisibility ?? {} })
    .onConflictDoUpdate({
      target: timeUserPreferences.userId,
      set: { widgetVisibility: prefs.widgetVisibility ?? sql`${timeUserPreferences.widgetVisibility}`, updatedAt: new Date() },
    })
    .returning();
  return result;
}

export async function getPreferences(userId: string) {
  const [prefs] = await db
    .select()
    .from(timeUserPreferences)
    .where(eq(timeUserPreferences.userId, userId));
  return prefs ?? null;
}

// ─── Aggregation Queries ───────────────────────────────────────

export async function getDashboardMetrics(userId: string, dateFrom: Date, dateTo: Date) {
  const rows = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)`,
      sessionCount: sql<number>`count(*)`,
      avgDuration: sql<number>`coalesce(round(avg(${timeEntries.durationMinutes})), 0)`,
      maxDuration: sql<number>`coalesce(max(${timeEntries.durationMinutes}), 0)`,
      minDuration: sql<number>`coalesce(min(${timeEntries.durationMinutes}), 0)`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
        gte(timeEntries.startTime, dateFrom),
        lte(timeEntries.startTime, dateTo),
      ),
    );
  return rows[0];
}

export async function getTimeByCategory(userId: string, dateFrom: Date, dateTo: Date) {
  return db
    .select({
      categoryId: timeEntries.categoryId,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)`,
      sessionCount: sql<number>`count(*)`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
        gte(timeEntries.startTime, dateFrom),
        lte(timeEntries.startTime, dateTo),
        sql`${timeEntries.durationMinutes} is not null`,
      ),
    )
    .groupBy(timeEntries.categoryId)
    .orderBy(desc(sql`coalesce(sum(${timeEntries.durationMinutes}), 0)`));
}

export async function getTimeByProject(userId: string, dateFrom: Date, dateTo: Date) {
  return db
    .select({
      projectId: timeEntries.projectId,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)`,
      sessionCount: sql<number>`count(*)`,
      avgDuration: sql<number>`coalesce(round(avg(${timeEntries.durationMinutes})), 0)`,
      lastActivity: sql<Date>`max(${timeEntries.startTime})`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
        gte(timeEntries.startTime, dateFrom),
        lte(timeEntries.startTime, dateTo),
        sql`${timeEntries.durationMinutes} is not null`,
        sql`${timeEntries.projectId} is not null`,
      ),
    )
    .groupBy(timeEntries.projectId)
    .orderBy(desc(sql`coalesce(sum(${timeEntries.durationMinutes}), 0)`));
}

export async function getTimeByDay(userId: string, dateFrom: Date, dateTo: Date) {
  return db
    .select({
      date: sql<string>`${timeEntries.startTime}::date`,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)`,
      sessionCount: sql<number>`count(*)`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
        gte(timeEntries.startTime, dateFrom),
        lte(timeEntries.startTime, dateTo),
        sql`${timeEntries.durationMinutes} is not null`,
      ),
    )
    .groupBy(sql`${timeEntries.startTime}::date`)
    .orderBy(asc(sql`${timeEntries.startTime}::date`));
}

export async function getTrackingDates(userId: string) {
  const rows = await db
    .select({
      date: sql<string>`distinct ${timeEntries.startTime}::date`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.deletedAt),
      ),
    )
    .orderBy(desc(sql`${timeEntries.startTime}::date`));
  return rows.map((r) => r.date);
}

export async function getTotalStats(userId: string) {
  const rows = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)`,
      totalSessions: sql<number>`count(*)`,
    })
    .from(timeEntries)
    .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.deletedAt)));
  return rows[0];
}
