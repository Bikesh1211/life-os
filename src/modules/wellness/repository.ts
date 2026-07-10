import { db } from "@/core/database";
import { and, eq, gte, lte, desc, asc, sql, isNull, inArray, sum } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  wellnessMoodLogs,
  wellnessSleepRecords,
  wellnessUserPreferences,
  wellnessHydrationEntries,
  wellnessConfidenceCheckins,
  wellnessHabitEnrichment,
  wellnessWeightEntries,
  wellnessWorkoutEntries,
  wellnessStepEntries,
  wellnessCalorieEntries,
  wellnessBloodPressureEntries,
  wellnessHeartRateEntries,
  wellnessMedicineReminders,
  wellnessMedicineLogs,
  wellnessUserGoals,
  wellnessAchievements,
} from "./schema";

// ── Types ──

export type WellnessMoodLog = typeof wellnessMoodLogs.$inferSelect;
export type WellnessSleepRecord = typeof wellnessSleepRecords.$inferSelect;
export type WellnessHydrationEntry = typeof wellnessHydrationEntries.$inferSelect;
export type WellnessConfidenceCheckin = typeof wellnessConfidenceCheckins.$inferSelect;
export type WellnessHabitEnrichment = typeof wellnessHabitEnrichment.$inferSelect;
export type WellnessHabitEnrichmentInsert = typeof wellnessHabitEnrichment.$inferInsert;

export type CreateMoodLogInput = typeof wellnessMoodLogs.$inferInsert;
export type CreateSleepRecordInput = typeof wellnessSleepRecords.$inferInsert;
export type CreateHydrationEntryInput = typeof wellnessHydrationEntries.$inferInsert;
export type CreateConfidenceCheckinInput = typeof wellnessConfidenceCheckins.$inferInsert;
export type CreateHabitEnrichmentInput = typeof wellnessHabitEnrichment.$inferInsert;
export type WellnessWeightEntry = typeof wellnessWeightEntries.$inferSelect;
export type WellnessWorkoutEntry = typeof wellnessWorkoutEntries.$inferSelect;
export type WellnessStepEntry = typeof wellnessStepEntries.$inferSelect;
export type WellnessCalorieEntry = typeof wellnessCalorieEntries.$inferSelect;
export type WellnessBloodPressureEntry = typeof wellnessBloodPressureEntries.$inferSelect;
export type WellnessHeartRateEntry = typeof wellnessHeartRateEntries.$inferSelect;
export type WellnessMedicineReminder = typeof wellnessMedicineReminders.$inferSelect;
export type WellnessMedicineLog = typeof wellnessMedicineLogs.$inferSelect;
export type WellnessUserGoal = typeof wellnessUserGoals.$inferSelect;
export type WellnessAchievement = typeof wellnessAchievements.$inferSelect;
export type CreateWeightEntryInput = typeof wellnessWeightEntries.$inferInsert;
export type CreateWorkoutEntryInput = typeof wellnessWorkoutEntries.$inferInsert;
export type CreateStepEntryInput = typeof wellnessStepEntries.$inferInsert;
export type CreateCalorieEntryInput = typeof wellnessCalorieEntries.$inferInsert;
export type CreateBloodPressureEntryInput = typeof wellnessBloodPressureEntries.$inferInsert;
export type CreateHeartRateEntryInput = typeof wellnessHeartRateEntries.$inferInsert;
export type CreateMedicineReminderInput = typeof wellnessMedicineReminders.$inferInsert;
export type CreateMedicineLogInput = typeof wellnessMedicineLogs.$inferInsert;
export type CreateUserGoalInput = typeof wellnessUserGoals.$inferInsert;
export type CreateAchievementInput = typeof wellnessAchievements.$inferInsert;

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

export async function getSleepRecordsByDateRange(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  return db
    .select()
    .from(wellnessSleepRecords)
    .where(
      and(
        eq(wellnessSleepRecords.userId, userId),
        gte(wellnessSleepRecords.bedtime, new Date(dateFrom)),
        lte(wellnessSleepRecords.bedtime, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .orderBy(desc(wellnessSleepRecords.bedtime));
}

export async function getSleepStatistics(userId: string) {
  const result = await db
    .select({
      totalSleptHours: sql<string>`coalesce(round(extract(epoch from sum(${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime})) / 3600, 1)::text, '0')`,
      totalNights: sql<number>`count(*)`,
      longestSleepHours: sql<string>`coalesce(round(max(extract(epoch from ${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime}) / 3600)::numeric, 1)::text, '0')`,
      shortestSleepHours: sql<string>`coalesce(round(min(extract(epoch from ${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime}) / 3600)::numeric, 1)::text, '0')`,
      avgBedtimeHour: sql<string>`coalesce(round(avg(extract(hour from ${wellnessSleepRecords.bedtime}) + extract(minute from ${wellnessSleepRecords.bedtime}) / 60)::numeric, 1)::text, '0')`,
      avgWakeTimeHour: sql<string>`coalesce(round(avg(extract(hour from ${wellnessSleepRecords.wakeTime}) + extract(minute from ${wellnessSleepRecords.wakeTime}) / 60)::numeric, 1)::text, '0')`,
      avgQuality: sql<string>`coalesce(round(avg(${wellnessSleepRecords.quality})::numeric, 1)::text, '0')`,
    })
    .from(wellnessSleepRecords)
    .where(eq(wellnessSleepRecords.userId, userId));

  return result ?? null;
}

export async function getSleepDailyTotals(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  return db
    .select({
      date: sql<string>`${wellnessSleepRecords.bedtime}::date`,
      totalHours: sql<string>`coalesce(round(sum(extract(epoch from ${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime}) / 3600)::numeric, 1)::text, '0')`,
      avgQuality: sql<string>`coalesce(round(avg(${wellnessSleepRecords.quality})::numeric, 1)::text, '0')`,
      count: sql<number>`count(*)`,
      bedtime: sql<string>`min(${wellnessSleepRecords.bedtime})`,
      wakeTime: sql<string>`max(${wellnessSleepRecords.wakeTime})`,
    })
    .from(wellnessSleepRecords)
    .where(
      and(
        eq(wellnessSleepRecords.userId, userId),
        gte(wellnessSleepRecords.bedtime, new Date(dateFrom)),
        lte(wellnessSleepRecords.bedtime, new Date(dateTo + "T23:59:59.999Z")),
      ),
    )
    .groupBy(sql`${wellnessSleepRecords.bedtime}::date`)
    .orderBy(sql`${wellnessSleepRecords.bedtime}::date`);
}

export async function getSleepBestDay(userId: string) {
  const [result] = await db
    .select({
      date: sql<string>`${wellnessSleepRecords.bedtime}::date`,
      totalHours: sql<string>`coalesce(round(sum(extract(epoch from ${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime}) / 3600)::numeric, 1)::text, '0')`,
      avgQuality: sql<string>`coalesce(round(avg(${wellnessSleepRecords.quality})::numeric, 1)::text, '0')`,
    })
    .from(wellnessSleepRecords)
    .where(eq(wellnessSleepRecords.userId, userId))
    .groupBy(sql`${wellnessSleepRecords.bedtime}::date`)
    .orderBy(sql`avg(${wellnessSleepRecords.quality}) desc nulls last`)
    .limit(1);
  return result ?? null;
}

export async function getSleepWorstDay(userId: string) {
  const [result] = await db
    .select({
      date: sql<string>`${wellnessSleepRecords.bedtime}::date`,
      totalHours: sql<string>`coalesce(round(sum(extract(epoch from ${wellnessSleepRecords.wakeTime} - ${wellnessSleepRecords.bedtime}) / 3600)::numeric, 1)::text, '0')`,
      avgQuality: sql<string>`coalesce(round(avg(${wellnessSleepRecords.quality})::numeric, 1)::text, '0')`,
    })
    .from(wellnessSleepRecords)
    .where(eq(wellnessSleepRecords.userId, userId))
    .groupBy(sql`${wellnessSleepRecords.bedtime}::date`)
    .orderBy(sql`avg(${wellnessSleepRecords.quality}) asc`)
    .limit(1);
  return result ?? null;
}

// ── User Preferences ──

export async function upsertUserPreference(
  userId: string,
  input: Partial<typeof wellnessUserPreferences.$inferInsert>,
) {
  const [pref] = await db
    .insert(wellnessUserPreferences)
    .values({ userId, ...input })
    .onConflictDoUpdate({
      target: [wellnessUserPreferences.userId],
      set: { ...input, updatedAt: new Date() },
    })
    .returning();
  return pref;
}

export async function getUserPreference(userId: string) {
  const [pref] = await db
    .select()
    .from(wellnessUserPreferences)
    .where(eq(wellnessUserPreferences.userId, userId))
    .limit(1);
  return pref ?? null;
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

// ── Weight Entries ──

export async function createWeightEntry(input: CreateWeightEntryInput) {
  const [entry] = await db.insert(wellnessWeightEntries).values(input).returning();
  return entry;
}

export async function getWeightEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessWeightEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessWeightEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessWeightEntries.date, opts.dateTo));
  return db
    .select()
    .from(wellnessWeightEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessWeightEntries.date))
    .limit(opts.limit ?? 50);
}

export async function deleteWeightEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(wellnessWeightEntries)
    .where(and(eq(wellnessWeightEntries.id, id), eq(wellnessWeightEntries.userId, userId)))
    .returning();
  return entry ?? null;
}

// ── Workout Entries ──

export async function createWorkoutEntry(input: CreateWorkoutEntryInput) {
  const [entry] = await db.insert(wellnessWorkoutEntries).values(input).returning();
  return entry;
}

export async function getWorkoutEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; type?: string; limit?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessWorkoutEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessWorkoutEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessWorkoutEntries.date, opts.dateTo));
  if (opts.type) conditions.push(eq(wellnessWorkoutEntries.workoutType, opts.type));
  return db
    .select()
    .from(wellnessWorkoutEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessWorkoutEntries.date))
    .limit(opts.limit ?? 50);
}

export async function deleteWorkoutEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(wellnessWorkoutEntries)
    .where(and(eq(wellnessWorkoutEntries.id, id), eq(wellnessWorkoutEntries.userId, userId)))
    .returning();
  return entry ?? null;
}

// ── Step Entries ──

export async function upsertStepEntry(input: CreateStepEntryInput) {
  const [entry] = await db
    .insert(wellnessStepEntries)
    .values(input)
    .onConflictDoUpdate({
      target: [wellnessStepEntries.userId, wellnessStepEntries.date],
      set: { steps: input.steps },
    })
    .returning();
  return entry;
}

export async function getStepEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  const conditions: SQL[] = [eq(wellnessStepEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessStepEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessStepEntries.date, opts.dateTo));
  return db
    .select()
    .from(wellnessStepEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessStepEntries.date));
}

// ── Calorie Entries ──

export async function createCalorieEntry(input: CreateCalorieEntryInput) {
  const [entry] = await db.insert(wellnessCalorieEntries).values(input).returning();
  return entry;
}

export async function getCalorieEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  const conditions: SQL[] = [eq(wellnessCalorieEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessCalorieEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessCalorieEntries.date, opts.dateTo));
  return db
    .select()
    .from(wellnessCalorieEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessCalorieEntries.date));
}

export async function getCalorieDailyTotal(userId: string, date: string) {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${wellnessCalorieEntries.calories}), 0)` })
    .from(wellnessCalorieEntries)
    .where(
      and(eq(wellnessCalorieEntries.userId, userId), eq(wellnessCalorieEntries.date, date)),
    );
  return result?.total ?? 0;
}

export async function deleteCalorieEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(wellnessCalorieEntries)
    .where(and(eq(wellnessCalorieEntries.id, id), eq(wellnessCalorieEntries.userId, userId)))
    .returning();
  return entry ?? null;
}

// ── Blood Pressure Entries ──

export async function createBloodPressureEntry(input: CreateBloodPressureEntryInput) {
  const [entry] = await db.insert(wellnessBloodPressureEntries).values(input).returning();
  return entry;
}

export async function getBloodPressureEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  const conditions: SQL[] = [eq(wellnessBloodPressureEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessBloodPressureEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessBloodPressureEntries.date, opts.dateTo));
  return db
    .select()
    .from(wellnessBloodPressureEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessBloodPressureEntries.date))
    .limit(opts.limit ?? 30);
}

// ── Heart Rate Entries ──

export async function upsertHeartRateEntry(input: CreateHeartRateEntryInput) {
  const [entry] = await db
    .insert(wellnessHeartRateEntries)
    .values(input)
    .onConflictDoUpdate({
      target: [wellnessHeartRateEntries.userId, wellnessHeartRateEntries.date],
      set: {
        resting: input.resting,
        average: input.average,
        max: input.max,
      },
    })
    .returning();
  return entry;
}

export async function getHeartRateEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  const conditions: SQL[] = [eq(wellnessHeartRateEntries.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessHeartRateEntries.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessHeartRateEntries.date, opts.dateTo));
  return db
    .select()
    .from(wellnessHeartRateEntries)
    .where(and(...conditions))
    .orderBy(desc(wellnessHeartRateEntries.date));
}

// ── Medicine Reminders ──

export async function createMedicineReminder(input: CreateMedicineReminderInput) {
  const [reminder] = await db.insert(wellnessMedicineReminders).values(input).returning();
  return reminder;
}

export async function getMedicineReminders(userId: string) {
  return db
    .select()
    .from(wellnessMedicineReminders)
    .where(eq(wellnessMedicineReminders.userId, userId))
    .orderBy(desc(wellnessMedicineReminders.createdAt));
}

export async function getActiveMedicineReminders(userId: string) {
  return db
    .select()
    .from(wellnessMedicineReminders)
    .where(
      and(eq(wellnessMedicineReminders.userId, userId), eq(wellnessMedicineReminders.isActive, true)),
    )
    .orderBy(asc(wellnessMedicineReminders.time));
}

export async function updateMedicineReminder(
  id: string,
  userId: string,
  input: Partial<CreateMedicineReminderInput>,
) {
  const [reminder] = await db
    .update(wellnessMedicineReminders)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(wellnessMedicineReminders.id, id), eq(wellnessMedicineReminders.userId, userId)))
    .returning();
  return reminder ?? null;
}

export async function deleteMedicineReminder(id: string, userId: string) {
  const [reminder] = await db
    .delete(wellnessMedicineReminders)
    .where(and(eq(wellnessMedicineReminders.id, id), eq(wellnessMedicineReminders.userId, userId)))
    .returning();
  return reminder ?? null;
}

// ── Medicine Logs ──

export async function createMedicineLog(input: CreateMedicineLogInput) {
  const [log] = await db.insert(wellnessMedicineLogs).values(input).returning();
  return log;
}

export async function getMedicineLogs(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; medicineId?: string } = {},
) {
  const conditions: SQL[] = [eq(wellnessMedicineLogs.userId, userId)];
  if (opts.dateFrom) conditions.push(gte(wellnessMedicineLogs.date, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(wellnessMedicineLogs.date, opts.dateTo));
  if (opts.medicineId) conditions.push(eq(wellnessMedicineLogs.medicineId, opts.medicineId));
  return db
    .select()
    .from(wellnessMedicineLogs)
    .where(and(...conditions))
    .orderBy(desc(wellnessMedicineLogs.takenAt));
}

// ── User Goals ──

export async function createUserGoal(input: CreateUserGoalInput) {
  const [goal] = await db.insert(wellnessUserGoals).values(input).returning();
  return goal;
}

export async function getUserGoals(userId: string) {
  return db
    .select()
    .from(wellnessUserGoals)
    .where(eq(wellnessUserGoals.userId, userId))
    .orderBy(desc(wellnessUserGoals.createdAt));
}

export async function updateUserGoal(
  id: string,
  userId: string,
  input: Partial<CreateUserGoalInput>,
) {
  const [goal] = await db
    .update(wellnessUserGoals)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(wellnessUserGoals.id, id), eq(wellnessUserGoals.userId, userId)))
    .returning();
  return goal ?? null;
}

export async function deleteUserGoal(id: string, userId: string) {
  const [goal] = await db
    .delete(wellnessUserGoals)
    .where(and(eq(wellnessUserGoals.id, id), eq(wellnessUserGoals.userId, userId)))
    .returning();
  return goal ?? null;
}

// ── Achievements ──

export async function createAchievement(input: CreateAchievementInput) {
  const [achievement] = await db
    .insert(wellnessAchievements)
    .values(input)
    .onConflictDoNothing({
      target: [wellnessAchievements.userId, wellnessAchievements.achievementType],
    })
    .returning();
  return achievement ?? null;
}

export async function getAchievements(userId: string) {
  return db
    .select()
    .from(wellnessAchievements)
    .where(eq(wellnessAchievements.userId, userId))
    .orderBy(desc(wellnessAchievements.unlockedAt));
}
