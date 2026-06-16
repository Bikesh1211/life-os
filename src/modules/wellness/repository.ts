import { db } from "@/core/database";
import { and, eq, gte, lte, desc, asc, sql, isNull } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  wellnessMoodLogs,
  wellnessSleepRecords,
  wellnessHydrationEntries,
  wellnessConfidenceCheckins,
  wellnessHabitEnrichment,
} from "./schema";

// ── Types ──

export type WellnessMoodLog = typeof wellnessMoodLogs.$inferSelect;
export type WellnessSleepRecord = typeof wellnessSleepRecords.$inferSelect;
export type WellnessHydrationEntry = typeof wellnessHydrationEntries.$inferSelect;
export type WellnessConfidenceCheckin = typeof wellnessConfidenceCheckins.$inferSelect;
export type WellnessHabitEnrichment = typeof wellnessHabitEnrichment.$inferSelect;

export type CreateMoodLogInput = typeof wellnessMoodLogs.$inferInsert;
export type CreateSleepRecordInput = typeof wellnessSleepRecords.$inferInsert;
export type CreateHydrationEntryInput = typeof wellnessHydrationEntries.$inferInsert;
export type CreateConfidenceCheckinInput = typeof wellnessConfidenceCheckins.$inferInsert;
export type CreateHabitEnrichmentInput = typeof wellnessHabitEnrichment.$inferInsert;

// ── Mood Logs ──

export async function createMoodLog(input: CreateMoodLogInput) {
  const [log] = await db.insert(wellnessMoodLogs).values(input).returning();
  return log;
}

export async function getMoodLogById(id: string, userId: string) {
  const [log] = await db
    .select()
    .from(wellnessMoodLogs)
    .where(and(eq(wellnessMoodLogs.id, id), eq(wellnessMoodLogs.userId, userId)))
    .limit(1);
  return log ?? null;
}

export async function getMoodLogs(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessMoodLogs.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessMoodLogs.loggedAt, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(wellnessMoodLogs.loggedAt, new Date(opts.dateTo)));

  return db
    .select()
    .from(wellnessMoodLogs)
    .where(and(...conditions))
    .orderBy(desc(wellnessMoodLogs.loggedAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
}

export async function getMoodAverages(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const [result] = await db
    .select({
      avgHappiness: sql<number>`avg(${wellnessMoodLogs.happiness})`,
      avgStress: sql<number>`avg(${wellnessMoodLogs.stress})`,
      avgAnxiety: sql<number>`avg(${wellnessMoodLogs.anxiety})`,
      avgMotivation: sql<number>`avg(${wellnessMoodLogs.motivation})`,
      avgEnergy: sql<number>`avg(${wellnessMoodLogs.energy})`,
      avgConfidence: sql<number>`avg(${wellnessMoodLogs.confidence})`,
      avgFocus: sql<number>`avg(${wellnessMoodLogs.focus})`,
      avgMentalFatigue: sql<number>`avg(${wellnessMoodLogs.mentalFatigue})`,
      count: sql<number>`count(*)`,
    })
    .from(wellnessMoodLogs)
    .where(
      and(
        eq(wellnessMoodLogs.userId, userId),
        gte(wellnessMoodLogs.loggedAt, new Date(dateFrom)),
        lte(wellnessMoodLogs.loggedAt, new Date(dateTo)),
      ),
    );

  return result;
}

// ── Sleep Records ──

export async function createSleepRecord(input: CreateSleepRecordInput) {
  const [record] = await db.insert(wellnessSleepRecords).values(input).returning();
  return record;
}

export async function getSleepRecordById(id: string, userId: string) {
  const [record] = await db
    .select()
    .from(wellnessSleepRecords)
    .where(and(eq(wellnessSleepRecords.id, id), eq(wellnessSleepRecords.userId, userId)))
    .limit(1);
  return record ?? null;
}

export async function getSleepRecords(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessSleepRecords.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessSleepRecords.bedtime, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(wellnessSleepRecords.bedtime, new Date(opts.dateTo)));

  return db
    .select()
    .from(wellnessSleepRecords)
    .where(and(...conditions))
    .orderBy(desc(wellnessSleepRecords.bedtime))
    .limit(opts.limit ?? 30);
}

export async function updateSleepRecord(
  id: string,
  userId: string,
  input: Partial<CreateSleepRecordInput>,
) {
  const [record] = await db
    .update(wellnessSleepRecords)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(wellnessSleepRecords.id, id), eq(wellnessSleepRecords.userId, userId)))
    .returning();
  return record ?? null;
}

export async function deleteSleepRecord(id: string, userId: string) {
  const [record] = await db
    .delete(wellnessSleepRecords)
    .where(and(eq(wellnessSleepRecords.id, id), eq(wellnessSleepRecords.userId, userId)))
    .returning();
  return record ?? null;
}

// ── Hydration Entries ──

export async function createHydrationEntry(input: CreateHydrationEntryInput) {
  const [entry] = await db.insert(wellnessHydrationEntries).values(input).returning();
  return entry;
}

export async function getHydrationEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  const conditions: SQL[] = [eq(wellnessHydrationEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessHydrationEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessHydrationEntries.date, opts.dateTo));

  return db
    .select()
    .from(wellnessHydrationEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessHydrationEntries.loggedAt));
}

export async function getHydrationDailyTotal(userId: string, date: string) {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${wellnessHydrationEntries.amountMl}), 0)` })
    .from(wellnessHydrationEntries)
    .where(
      and(eq(wellnessHydrationEntries.userId, userId), eq(wellnessHydrationEntries.date, date)),
    );
  return result?.total ?? 0;
}

export async function deleteHydrationEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(wellnessHydrationEntries)
    .where(and(eq(wellnessHydrationEntries.id, id), eq(wellnessHydrationEntries.userId, userId)))
    .returning();
  return entry ?? null;
}

// ── Confidence Check-ins (one per day) ──

export async function upsertConfidenceCheckin(input: CreateConfidenceCheckinInput) {
  const [checkin] = await db
    .insert(wellnessConfidenceCheckins)
    .values(input)
    .onConflictDoUpdate({
      target: [wellnessConfidenceCheckins.userId, wellnessConfidenceCheckins.date],
      set: {
        score: input.score,
        selfEsteem: input.selfEsteem,
        socialComfort: input.socialComfort,
        publicSpeakingConfidence: input.publicSpeakingConfidence,
        appearanceSatisfaction: input.appearanceSatisfaction,
        notes: input.notes,
      },
    })
    .returning();
  return checkin;
}

export async function getConfidenceCheckin(userId: string, date: string) {
  const [checkin] = await db
    .select()
    .from(wellnessConfidenceCheckins)
    .where(
      and(eq(wellnessConfidenceCheckins.userId, userId), eq(wellnessConfidenceCheckins.date, date)),
    )
    .limit(1);
  return checkin ?? null;
}

export async function getConfidenceCheckins(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessConfidenceCheckins.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessConfidenceCheckins.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessConfidenceCheckins.date, opts.dateTo));

  return db
    .select()
    .from(wellnessConfidenceCheckins)
    .where(and(...conditions))
    .orderBy(desc(wellnessConfidenceCheckins.date))
    .limit(opts.limit ?? 30);
}

// ── Wellness Habit Enrichment ──

export async function createHabitEnrichment(input: CreateHabitEnrichmentInput) {
  const [enrichment] = await db.insert(wellnessHabitEnrichment).values(input).returning();
  return enrichment;
}

export async function getHabitEnrichment(habitId: string, userId: string) {
  const [enrichment] = await db
    .select()
    .from(wellnessHabitEnrichment)
    .where(
      and(eq(wellnessHabitEnrichment.habitId, habitId), eq(wellnessHabitEnrichment.userId, userId)),
    )
    .limit(1);
  return enrichment ?? null;
}

export async function getHabitEnrichments(userId: string, wellnessType?: string) {
  const conditions: SQL[] = [eq(wellnessHabitEnrichment.userId, userId)];
  if (wellnessType) conditions.push(eq(wellnessHabitEnrichment.wellnessType, wellnessType as any));

  return db
    .select()
    .from(wellnessHabitEnrichment)
    .where(and(...conditions))
    .orderBy(asc(wellnessHabitEnrichment.nextDueDate));
}

export async function updateHabitEnrichment(
  id: string,
  userId: string,
  input: Partial<CreateHabitEnrichmentInput>,
) {
  const [enrichment] = await db
    .update(wellnessHabitEnrichment)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(wellnessHabitEnrichment.id, id), eq(wellnessHabitEnrichment.userId, userId)))
    .returning();
  return enrichment ?? null;
}

export async function deleteHabitEnrichment(id: string, userId: string) {
  const [enrichment] = await db
    .delete(wellnessHabitEnrichment)
    .where(and(eq(wellnessHabitEnrichment.id, id), eq(wellnessHabitEnrichment.userId, userId)))
    .returning();
  return enrichment ?? null;
}

export async function getOverdueEnrichments(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .select()
    .from(wellnessHabitEnrichment)
    .where(
      and(
        eq(wellnessHabitEnrichment.userId, userId),
        lte(wellnessHabitEnrichment.nextDueDate, today),
      ),
    )
    .orderBy(asc(wellnessHabitEnrichment.nextDueDate));
}
