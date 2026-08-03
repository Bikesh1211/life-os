import { z } from "zod";
import { cache } from "react";
import { and, eq, gte, lte, inArray, count } from "drizzle-orm";
import * as repo from "./repository";
import { awardXp } from "@/modules/gamification";
import { createTimelineEvent } from "@/modules/timeline";

// ── Constants ──

const DIMENSION_KEYS = [
  "happiness", "stress", "anxiety", "motivation",
  "energy", "confidence", "focus", "mentalFatigue",
] as const;

const WELLNESS_TYPES = ["grooming", "hygiene", "self-care", "confidence"] as const;

export const GROOMING_CATEGORIES = [
  "hair-care",
  "face-care",
  "skin-care",
  "dental-care",
  "body-care",
  "personal-hygiene",
  "clothing-care",
  "custom",
] as const;

export type GroomingCategory = (typeof GROOMING_CATEGORIES)[number];

const DEFAULT_HYDRATION_GOAL_ML = 2500;

// ── Validation Schemas ──

export const createMoodLogSchema = z.object({
  happiness: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  anxiety: z.number().int().min(1).max(10),
  motivation: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  confidence: z.number().int().min(1).max(10),
  focus: z.number().int().min(1).max(10),
  mentalFatigue: z.number().int().min(1).max(10),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  emoji: z.string().max(10).optional(),
  voiceNoteUrl: z.string().max(2000).optional(),
});

export const createSleepRecordSchema = z.object({
  bedtime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  quality: z.number().int().min(1).max(10).optional(),
  interruptions: z.number().int().min(0).default(0),
  sleepLatencyMinutes: z.number().int().min(0).max(480).optional(),
  moodAfterWaking: z.string().max(50).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateSleepRecordSchema = createSleepRecordSchema.partial();

export const sleepGoalSchema = z.object({
  sleepGoalHours: z.number().int().min(1).max(24),
});

export const createHydrationEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountMl: z.number().int().min(1).max(5000),
});

export const createConfidenceCheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  score: z.number().int().min(1).max(10),
  selfEsteem: z.number().int().min(1).max(10).optional(),
  socialComfort: z.number().int().min(1).max(10).optional(),
  publicSpeakingConfidence: z.number().int().min(1).max(10).optional(),
  appearanceSatisfaction: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export const createHabitEnrichmentSchema = z.object({
  habitId: z.string().uuid(),
  wellnessType: z.enum(WELLNESS_TYPES),
  subcategory: z.string().max(100).optional(),
  lastCompletedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reminderDaysBefore: z.number().int().min(0).max(30).default(3),
  seasonalMonths: z.array(z.number().int().min(1).max(12)).optional(),
  estimatedCost: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateHabitEnrichmentSchema = createHabitEnrichmentSchema.partial();

export const createGroomingEnrichmentSchema = z.object({
  habitId: z.string().uuid(),
  groomingCategory: z.enum(GROOMING_CATEGORIES).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(480).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isArchived: z.boolean().optional(),
  reminderConfig: z.object({
    enabled: z.boolean().optional(),
    times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).optional(),
    snoozable: z.boolean().optional(),
  }).optional(),
  notes: z.string().max(2000).optional(),
  estimatedCost: z.number().min(0).optional(),
});

export const updateGroomingEnrichmentSchema = createGroomingEnrichmentSchema.partial();

export const completeGroomingSchema = z.object({
  habitId: z.string().uuid(),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(2000).optional(),
  metadata: z.object({
    mood: z.number().int().min(1).max(10).optional(),
    energy: z.number().int().min(1).max(10).optional(),
    cleanliness: z.number().int().min(1).max(10).optional(),
    confidence: z.number().int().min(1).max(10).optional(),
    rating: z.number().int().min(1).max(10).optional(),
    photoUrls: z.array(z.string().url()).optional(),
  }).optional(),
});

export const analyticsFilterSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.enum(["week", "month", "quarter", "year"]).optional(),
});

export const createWeightEntrySchema = z.object({
  weightKg: z.number().min(20).max(500),
  bodyFatPercentage: z.number().min(1).max(70).optional(),
  musclePercentage: z.number().min(1).max(90).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(2000).optional(),
});

export const createWorkoutEntrySchema = z.object({
  workoutType: z.string().min(1).max(100),
  durationMinutes: z.number().int().min(1).max(1440),
  caloriesBurned: z.number().int().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createStepEntrySchema = z.object({
  steps: z.number().int().min(0).max(1000000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createCalorieEntrySchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createBpEntrySchema = z.object({
  systolic: z.number().int().min(60).max(300),
  diastolic: z.number().int().min(30).max(200),
  pulse: z.number().int().min(20).max(300).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(2000).optional(),
});

export const createHrEntrySchema = z.object({
  resting: z.number().int().min(20).max(300).optional(),
  average: z.number().int().min(20).max(300).optional(),
  max: z.number().int().min(20).max(300).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createMedicineReminderSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(200),
  frequency: z.enum(["daily", "weekly", "custom"]),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateMedicineReminderSchema = createMedicineReminderSchema.partial();

export const createMedicineLogSchema = z.object({
  medicineId: z.string().uuid(),
  status: z.enum(["taken", "skipped", "snoozed"]),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createUserGoalSchema = z.object({
  goalType: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0).optional(),
  unit: z.string().min(1).max(50),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
});

export const updateUserGoalSchema = createUserGoalSchema.partial();

export const bmiCalculateSchema = z.object({
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(10).max(500),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export type CreateMoodLogParams = z.infer<typeof createMoodLogSchema>;
export type CreateSleepRecordParams = z.infer<typeof createSleepRecordSchema>;
export type CreateHydrationEntryParams = z.infer<typeof createHydrationEntrySchema>;
export type CreateConfidenceCheckinParams = z.infer<typeof createConfidenceCheckinSchema>;
export type CreateHabitEnrichmentParams = z.infer<typeof createHabitEnrichmentSchema>;
export type CreateWeightEntryParams = z.infer<typeof createWeightEntrySchema>;
export type CreateWorkoutEntryParams = z.infer<typeof createWorkoutEntrySchema>;
export type CreateStepEntryParams = z.infer<typeof createStepEntrySchema>;
export type CreateCalorieEntryParams = z.infer<typeof createCalorieEntrySchema>;
export type CreateBpEntryParams = z.infer<typeof createBpEntrySchema>;
export type CreateHrEntryParams = z.infer<typeof createHrEntrySchema>;
export type CreateMedicineReminderParams = z.infer<typeof createMedicineReminderSchema>;
export type CreateMedicineLogParams = z.infer<typeof createMedicineLogSchema>;
export type CreateUserGoalParams = z.infer<typeof createUserGoalSchema>;
export type BmiCalculateParams = z.infer<typeof bmiCalculateSchema>;
export type AnalyticsFilterParams = z.infer<typeof analyticsFilterSchema>;
export type CreateGroomingEnrichmentParams = z.infer<typeof createGroomingEnrichmentSchema>;
export type UpdateGroomingEnrichmentParams = z.infer<typeof updateGroomingEnrichmentSchema>;
export type CompleteGroomingParams = z.infer<typeof completeGroomingSchema>;

// ── Helpers ──

function getDateRange(params: AnalyticsFilterParams) {
  if (params.dateFrom && params.dateTo) {
    return { dateFrom: params.dateFrom, dateTo: params.dateTo };
  }
  const end = new Date();
  let start: Date;
  const period = params.period ?? "month";
  if (period === "week") start = new Date(end.getTime() - 7 * 86400000);
  else if (period === "month") start = new Date(end.getTime() - 30 * 86400000);
  else if (period === "quarter") start = new Date(end.getTime() - 90 * 86400000);
  else start = new Date(end.getTime() - 365 * 86400000);
  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Mood Logs ──

export async function createMoodLog(userId: string, params: CreateMoodLogParams) {
  const validated = createMoodLogSchema.parse(params);
  const log = await repo.createMoodLog({ userId, ...validated });

  try {
    await awardXp(userId, "mood_logged", log.id, "Mood check-in logged", 2);
  } catch { }

  try {
    const avg = Math.round(
      (log.happiness +
        (11 - log.stress) +
        (11 - log.anxiety) +
        log.motivation +
        log.energy +
        log.confidence +
        log.focus +
        (11 - log.mentalFatigue)) /
        8,
    );
    await createTimelineEvent(userId, {
      title: `Mood check-in: ${avg}/10`,
      description: validated.notes?.slice(0, 200),
      eventDate: log.createdAt.toISOString(),
      category: "health",
      importance: "medium",
      activityType: "mood_log",
      linkedEntityId: log.id,
      linkedEntityType: "mood",
      mood: avg,
    });
  } catch {}

  return log;
}

export const getMoodLogs = cache(async (userId: string, filters: AnalyticsFilterParams = {}) => {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getMoodLogs(userId, { dateFrom, dateTo });
});

// ── Sleep Records ──

export async function createSleepRecord(userId: string, params: CreateSleepRecordParams) {
  const validated = createSleepRecordSchema.parse(params);
  const record = await repo.createSleepRecord({
    userId,
    bedtime: new Date(validated.bedtime),
    wakeTime: new Date(validated.wakeTime),
    quality: validated.quality,
    interruptions: validated.interruptions,
    sleepLatencyMinutes: validated.sleepLatencyMinutes,
    moodAfterWaking: validated.moodAfterWaking,
    energyLevel: validated.energyLevel,
    notes: validated.notes,
  });

  try {
    await awardXp(userId, "sleep_logged", record.id, "Sleep session logged", 3);
  } catch { }

  return record;
}

export async function updateSleepRecord(
  id: string,
  userId: string,
  params: z.infer<typeof updateSleepRecordSchema>,
) {
  const validated = updateSleepRecordSchema.parse(params);
  const updateData: Record<string, unknown> = {};
  if (validated.bedtime !== undefined) updateData.bedtime = new Date(validated.bedtime);
  if (validated.wakeTime !== undefined) updateData.wakeTime = new Date(validated.wakeTime);
  if (validated.quality !== undefined) updateData.quality = validated.quality;
  if (validated.interruptions !== undefined) updateData.interruptions = validated.interruptions;
  if (validated.sleepLatencyMinutes !== undefined) updateData.sleepLatencyMinutes = validated.sleepLatencyMinutes;
  if (validated.moodAfterWaking !== undefined) updateData.moodAfterWaking = validated.moodAfterWaking;
  if (validated.energyLevel !== undefined) updateData.energyLevel = validated.energyLevel;
  if (validated.notes !== undefined) updateData.notes = validated.notes;
  return repo.updateSleepRecord(id, userId, updateData);
}

export const getSleepRecords = cache(async (userId: string, filters: AnalyticsFilterParams = {}) => {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getSleepRecords(userId, { dateFrom, dateTo });
});

// ── Sleep Dashboard ──

export async function getSleepDashboard(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [
    todaysRecords,
    weeklyRecords,
    monthlyRecords,
    stats,
    preference,
  ] = await Promise.all([
    repo.getSleepRecordsByDateRange(userId, todayStart, todayEnd),
    repo.getSleepRecordsByDateRange(userId, weekAgo, todayEnd),
    repo.getSleepRecordsByDateRange(userId, monthAgo, todayEnd),
    repo.getSleepStatistics(userId),
    repo.getUserPreference(userId),
  ]);

  const sleepGoalHours = preference?.sleepGoalHours ?? 8;
  const statsRow = stats?.[0] ?? null;

  const mainSleep = todaysRecords.length > 0
    ? todaysRecords.reduce((longest, r) => {
        const dur = r.wakeTime.getTime() - r.bedtime.getTime();
        const longDur = longest.wakeTime.getTime() - longest.bedtime.getTime();
        return dur > longDur ? r : longest;
      }, todaysRecords[0])
    : null;

  const totalSleepMs = todaysRecords.reduce((sum, r) => sum + (r.wakeTime.getTime() - r.bedtime.getTime()), 0);
  const totalSleepHours = Math.round((totalSleepMs / 3600000) * 100) / 100;

  const goalPercentage = Math.min(100, Math.round((totalSleepHours / sleepGoalHours) * 100));
  const remainingHours = Math.max(0, sleepGoalHours - totalSleepHours);

  const sleepQuality = mainSleep?.quality ?? null;

  // Weekly stats
  const weekHours = weeklyRecords.reduce((sum, r) => sum + (r.wakeTime.getTime() - r.bedtime.getTime()), 0) / 3600000;
  const avgSleepThisWeek = weeklyRecords.length > 0 ? Math.round((weekHours / weeklyRecords.length) * 10) / 10 : 0;

  // Monthly stats
  const monthHours = monthlyRecords.reduce((sum, r) => sum + (r.wakeTime.getTime() - r.bedtime.getTime()), 0) / 3600000;
  const avgSleepThisMonth = monthlyRecords.length > 0 ? Math.round((monthHours / monthlyRecords.length) * 10) / 10 : 0;

  // Streak
  const streak = await getSleepStreak(userId, sleepGoalHours);

  return {
    totalSleepHours,
    totalSleepMinutes: Math.round(totalSleepHours * 60),
    bedTime: mainSleep?.bedtime ?? null,
    wakeTime: mainSleep?.wakeTime ?? null,
    sleepQuality: sleepQuality ? sleepQuality * 10 : null,
    goalPercentage,
    remainingHours: Math.round(remainingHours * 10) / 10,
    sleepGoalHours,
    avgSleepThisWeek,
    avgSleepThisMonth,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    totalNights: statsRow?.totalNights ?? 0,
    mainSleepId: mainSleep?.id ?? null,
  };
}

export async function getSleepStreak(userId: string, sleepGoalHours: number) {
  const windowStart = new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10);
  const allRecords = await repo.getSleepRecordsByDateRange(
    userId,
    windowStart,
    new Date().toISOString().slice(0, 10) + "T23:59:59.999Z",
  );

  const dailyTotals = new Map<string, number>();
  for (const r of allRecords) {
    const dateKey = r.bedtime.toISOString().slice(0, 10);
    const hours = (r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000;
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + hours);
  }

  const sortedDates = [...dailyTotals.entries()]
    .filter(([_, hours]) => hours >= sleepGoalHours)
    .map(([date]) => date)
    .sort()
    .reverse();

  let current = 0;
  let longest = 0;
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 && sortedDates[i] === today) {
      current = 1;
      streak = 1;
    } else if (i > 0) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diffDays === 1) {
        streak++;
        if (sortedDates[i] <= today) current = streak;
      } else {
        streak = 1;
      }
    }
    longest = Math.max(longest, streak);
  }

  return { current, longest };
}

export async function getSleepAnalytics(userId: string, filters: AnalyticsFilterParams = {}) {
  const { dateFrom, dateTo } = getDateRange(filters);
  const dailyTotals = await repo.getSleepDailyTotals(userId, dateFrom, dateTo);

  return dailyTotals.map((d) => ({
    date: d.date,
    totalHours: parseFloat(d.totalHours),
    avgQuality: d.avgQuality ? parseFloat(d.avgQuality) : null,
    sessionCount: d.count,
    bedtime: d.bedtime,
    wakeTime: d.wakeTime,
  }));
}

export async function getSleepStatistics(userId: string) {
  const statsArr = await repo.getSleepStatistics(userId);
  const stats = statsArr?.[0] ?? null;
  if (!stats || Number(stats.totalNights) === 0) {
    return {
      totalSleptHours: 0,
      totalNights: 0,
      longestSleepHours: 0,
      shortestSleepHours: 0,
      avgBedTime: "--:--",
      avgWakeTime: "--:--",
      avgQuality: 0,
      bestDay: null,
      worstDay: null,
      consistencyScore: 0,
    };
  }

  const [bestDay, worstDay] = await Promise.all([
    repo.getSleepBestDay(userId),
    repo.getSleepWorstDay(userId),
  ]);

  const avgBedHour = parseFloat(stats.avgBedtimeHour);
  const avgWakeHour = parseFloat(stats.avgWakeTimeHour);

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  // Consistency score: coefficient of variation (lower = more consistent)
  const { dateFrom: monthAgo } = getDateRange({ period: "month" });
  const monthlyRecords = await repo.getSleepRecordsByDateRange(
    userId,
    monthAgo,
    new Date().toISOString().slice(0, 10) + "T23:59:59.999Z",
  );

  const durations = monthlyRecords.map((r) => (r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000);
  let consistencyScore = 0;
  if (durations.length > 1) {
    const avg = durations.reduce((s, d) => s + d, 0) / durations.length;
    const stdDev = Math.sqrt(durations.reduce((s, d) => s + (d - avg) ** 2, 0) / durations.length);
    const cv = stdDev / avg;
    consistencyScore = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  } else if (durations.length === 1) {
    consistencyScore = 50;
  }

  return {
    totalSleptHours: parseFloat(stats.totalSleptHours),
    totalNights: stats.totalNights,
    longestSleepHours: parseFloat(stats.longestSleepHours),
    shortestSleepHours: parseFloat(stats.shortestSleepHours),
    avgBedTime: formatHour(avgBedHour),
    avgWakeTime: formatHour(avgWakeHour),
    avgQuality: stats.avgQuality ? parseFloat(stats.avgQuality) : 0,
    bestDay: bestDay
      ? { date: bestDay.date, totalHours: parseFloat(bestDay.totalHours), quality: bestDay.avgQuality ? parseFloat(bestDay.avgQuality) : null }
      : null,
    worstDay: worstDay
      ? { date: worstDay.date, totalHours: parseFloat(worstDay.totalHours), quality: worstDay.avgQuality ? parseFloat(worstDay.avgQuality) : null }
      : null,
    consistencyScore,
  };
}

export async function getSleepInsights(userId: string): Promise<WellnessInsight[]> {
  const today = new Date().toISOString().slice(0, 10);
  const todayEnd = `${today}T23:59:59.999Z`;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  const [weeklyRecords, monthlyRecords, preference] = await Promise.all([
    repo.getSleepRecordsByDateRange(userId, weekAgo, todayEnd),
    repo.getSleepRecordsByDateRange(userId, monthAgo, todayEnd),
    repo.getUserPreference(userId),
  ]);

  const sleepGoal = preference?.sleepGoalHours ?? 8;
  const insights: WellnessInsight[] = [];

  if (weeklyRecords.length === 0) {
    insights.push({
      type: "info",
      message: "Start logging your sleep to get personalized insights.",
      category: "sleep",
    });
    return insights;
  }

  const dailyTotals = new Map<string, { totalMs: number; qualities: number[] }>();
  for (const r of weeklyRecords) {
    const dateKey = r.bedtime.toISOString().slice(0, 10);
    const existing = dailyTotals.get(dateKey) ?? { totalMs: 0, qualities: [] };
    existing.totalMs += r.wakeTime.getTime() - r.bedtime.getTime();
    if (r.quality) existing.qualities.push(r.quality);
    dailyTotals.set(dateKey, existing);
  }

  const sortedDays = [...dailyTotals.entries()].sort(([a], [b]) => a.localeCompare(b));

  // Yesterday comparison
  if (sortedDays.length >= 2) {
    const today = sortedDays[sortedDays.length - 1];
    const yesterday = sortedDays[sortedDays.length - 2];
    const todayHours = today[1].totalMs / 3600000;
    const yesterdayHours = yesterday[1].totalMs / 3600000;
    const diff = todayHours - yesterdayHours;
    if (Math.abs(diff) >= 0.5) {
      insights.push({
        type: diff > 0 ? "positive" : "negative",
        message: `You slept ${Math.abs(diff).toFixed(1)} ${diff > 0 ? "more" : "less"} hours than yesterday.`,
        category: "sleep",
      });
    }
  }

  // Goal streak
  const goalDays = sortedDays.filter(([_, data]) => data.totalMs / 3600000 >= sleepGoal);
  if (goalDays.length >= 6) {
    insights.push({
      type: "positive",
      message: `You've reached your sleep goal (${sleepGoal}h) for ${goalDays.length} consecutive days!`,
      category: "sleep",
    });
  } else if (goalDays.length >= 3) {
    insights.push({
      type: "info",
      message: `You've reached your sleep goal (${sleepGoal}h) for ${goalDays.length} days this week.`,
      category: "sleep",
    });
  }

  // Average bed/wake times
  const bedHours = weeklyRecords.map((r) => r.bedtime.getHours() + r.bedtime.getMinutes() / 60);
  const wakeHours = weeklyRecords.map((r) => r.wakeTime.getHours() + r.wakeTime.getMinutes() / 60);
  const avgBed = bedHours.reduce((s, h) => s + h, 0) / bedHours.length;
  const avgWake = wakeHours.reduce((s, h) => s + h, 0) / wakeHours.length;

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  insights.push({
    type: "info",
    message: `Your average bedtime this week is ${formatHour(avgBed)}.`,
    category: "sleep",
  });

  insights.push({
    type: "info",
    message: `Your average wake-up time this week is ${formatHour(avgWake)}.`,
    category: "sleep",
  });

  // Optimal bedtime analysis: check if quality is better when going to bed early
  const earlyBed = weeklyRecords.filter((r) => r.bedtime.getHours() < 23);
  const lateBed = weeklyRecords.filter((r) => r.bedtime.getHours() >= 23);
  if (earlyBed.length >= 2 && lateBed.length >= 2) {
    const earlyQuality = earlyBed.reduce((s, r) => s + (r.quality ?? 5), 0) / earlyBed.length;
    const lateQuality = lateBed.reduce((s, r) => s + (r.quality ?? 5), 0) / lateBed.length;
    if (earlyQuality > lateQuality + 1) {
      insights.push({
        type: "positive",
        message: "You sleep better when you go to bed before 11 PM.",
        category: "sleep",
      });
    }
  }

  // Sleep debt (below goal days)
  const belowGoalDays = sortedDays.filter(([_, data]) => data.totalMs / 3600000 < sleepGoal);
  if (belowGoalDays.length > 0) {
    const totalDebtHours = belowGoalDays.reduce((debt, [_, data]) => {
      return debt + (sleepGoal - data.totalMs / 3600000);
    }, 0);
    if (totalDebtHours >= 1) {
      insights.push({
        type: "negative",
        message: `You've accumulated ${totalDebtHours.toFixed(1)} hours of sleep debt this week.`,
        category: "sleep",
      });
    }
  }

  // Consistency
  const qualities = weeklyRecords.filter((r) => r.quality).map((r) => r.quality as number);
  if (qualities.length >= 3) {
    const avgQ = qualities.reduce((s, q) => s + q, 0) / qualities.length;
    const allHigh = qualities.every((q) => q >= 7);
    if (allHigh) {
      insights.push({
        type: "positive",
        message: `Excellent consistency this week! Average quality: ${avgQ.toFixed(1)}/10.`,
        category: "sleep",
      });
    }
  }

  // Monthly comparison
  const twoWeekRecords = await repo.getSleepRecordsByDateRange(userId, twoWeeksAgo, todayEnd);
  const twoWeekQualities = twoWeekRecords.filter((r) => r.quality).map((r) => r.quality as number);
  if (twoWeekQualities.length >= 4) {
    const recentQualities = qualities.slice(-3);
    const olderQualities = twoWeekQualities.slice(0, 3);
    if (recentQualities.length >= 2 && olderQualities.length >= 2) {
      const recentAvg = recentQualities.reduce((s, q) => s + q, 0) / recentQualities.length;
      const olderAvg = olderQualities.reduce((s, q) => s + q, 0) / olderQualities.length;
      if (recentAvg > olderAvg + 1) {
        insights.push({
          type: "positive",
          message: "Your sleep quality is improving compared to last week!",
          category: "sleep",
        });
      } else if (recentAvg < olderAvg - 1) {
        insights.push({
          type: "negative",
          message: "Your sleep quality has declined compared to last week.",
          category: "sleep",
        });
      }
    }
  }

  return insights;
}

// ── Sleep Preferences ──

export async function getSleepGoal(userId: string) {
  const pref = await repo.getUserPreference(userId);
  return { sleepGoalHours: pref?.sleepGoalHours ?? 8 };
}

export async function upsertSleepGoal(userId: string, sleepGoalHours: number) {
  const validated = sleepGoalSchema.parse({ sleepGoalHours });
  return repo.upsertUserPreference(userId, validated);
}

// ── Hydration ──

export async function createHydrationEntry(userId: string, params: CreateHydrationEntryParams) {
  const validated = createHydrationEntrySchema.parse(params);
  const entry = await repo.createHydrationEntry({ userId, ...validated });

  try {
    await awardXp(userId, "hydration_logged", entry.id, "Water intake logged", 1);
  } catch { }

  return entry;
}

export const getHydrationEntries = cache(async (userId: string, filters: AnalyticsFilterParams = {}) => {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getHydrationEntries(userId, { dateFrom, dateTo });
});

export async function getHydrationDailyTotal(userId: string, date: string) {
  return repo.getHydrationDailyTotal(userId, date);
}

// ── Confidence Check-ins ──

export async function upsertConfidenceCheckin(userId: string, params: CreateConfidenceCheckinParams) {
  const validated = createConfidenceCheckinSchema.parse(params);
  const checkin = await repo.upsertConfidenceCheckin({ userId, ...validated });

  try {
    await awardXp(userId, "confidence_checkin", checkin.id, "Confidence check-in", 2);
  } catch { }

  return checkin;
}

export const getConfidenceCheckins = cache(async (userId: string, filters: AnalyticsFilterParams = {}) => {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getConfidenceCheckins(userId, { dateFrom, dateTo });
});

// ── Delete wrappers (plain pass-through to repository) ──

export async function deleteSleepRecord(id: string, userId: string) {
  return repo.deleteSleepRecord(id, userId);
}

export async function deleteHydrationEntry(id: string, userId: string) {
  return repo.deleteHydrationEntry(id, userId);
}

export async function deleteHabitEnrichment(id: string, userId: string) {
  return repo.deleteHabitEnrichment(id, userId);
}

// ── Habit Enrichment ──

export async function createHabitEnrichment(userId: string, params: CreateHabitEnrichmentParams) {
  const validated = createHabitEnrichmentSchema.parse(params);
  return repo.createHabitEnrichment({
    userId,
    ...validated,
    estimatedCost: validated.estimatedCost != null ? String(validated.estimatedCost) : undefined,
  });
}

export async function getHabitEnrichments(userId: string, wellnessType?: string) {
  return repo.getHabitEnrichments(userId, wellnessType);
}

export async function updateHabitEnrichment(
  id: string,
  userId: string,
  params: z.infer<typeof updateHabitEnrichmentSchema>,
) {
  const validated = updateHabitEnrichmentSchema.parse(params);
  const updateData: Record<string, unknown> = {};
  if (validated.habitId !== undefined) updateData.habitId = validated.habitId;
  if (validated.wellnessType !== undefined) updateData.wellnessType = validated.wellnessType;
  if (validated.subcategory !== undefined) updateData.subcategory = validated.subcategory;
  if (validated.lastCompletedDate !== undefined) updateData.lastCompletedDate = validated.lastCompletedDate;
  if (validated.nextDueDate !== undefined) updateData.nextDueDate = validated.nextDueDate;
  if (validated.reminderDaysBefore !== undefined) updateData.reminderDaysBefore = validated.reminderDaysBefore;
  if (validated.seasonalMonths !== undefined) updateData.seasonalMonths = validated.seasonalMonths;
  if (validated.estimatedCost !== undefined) updateData.estimatedCost = String(validated.estimatedCost);
  if (validated.notes !== undefined) updateData.notes = validated.notes;
  return repo.updateHabitEnrichment(id, userId, updateData);
}

export async function getOverdueEnrichments(userId: string) {
  return repo.getOverdueEnrichments(userId);
}

// ── Grooming ──

export const GROOMING_DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  groomingCategory: GroomingCategory;
  defaultFrequencyType: "daily" | "every_x_days" | "every_x_weeks" | "specific_weekdays";
  defaultFrequencyInterval?: number;
  defaultFrequencyWeekdays?: number[];
  icon: string;
  color: string;
  preferredTime?: string;
  estimatedDurationMinutes?: number;
  sortOrder: number;
}> = [
  { name: "Bathing", description: "Take a bath or shower", groomingCategory: "body-care", defaultFrequencyType: "daily", icon: "shower", color: "#4FC3F7", preferredTime: "07:00", estimatedDurationMinutes: 15, sortOrder: 1 },
  { name: "Hair Wash", description: "Wash your hair with shampoo", groomingCategory: "hair-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 3, icon: "droplet", color: "#81C784", preferredTime: "09:00", estimatedDurationMinutes: 20, sortOrder: 2 },
  { name: "Face Wash", description: "Wash your face with cleanser", groomingCategory: "face-care", defaultFrequencyType: "daily", icon: "face", color: "#FFB74D", preferredTime: "07:00", estimatedDurationMinutes: 3, sortOrder: 3 },
  { name: "Skincare Routine", description: "Apply skincare products", groomingCategory: "skin-care", defaultFrequencyType: "daily", icon: "sparkles", color: "#F48FB1", preferredTime: "21:00", estimatedDurationMinutes: 10, sortOrder: 4 },
  { name: "Moisturizer", description: "Apply body moisturizer", groomingCategory: "skin-care", defaultFrequencyType: "daily", icon: "droplet", color: "#CE93D8", preferredTime: "07:30", estimatedDurationMinutes: 5, sortOrder: 5 },
  { name: "Sunscreen", description: "Apply sunscreen protection", groomingCategory: "skin-care", defaultFrequencyType: "daily", icon: "sun", color: "#FFD54F", preferredTime: "07:30", estimatedDurationMinutes: 3, sortOrder: 6 },
  { name: "Shampoo", description: "Wash hair with shampoo", groomingCategory: "hair-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 3, icon: "droplet", color: "#4DD0E1", estimatedDurationMinutes: 10, sortOrder: 7 },
  { name: "Conditioner", description: "Apply hair conditioner", groomingCategory: "hair-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 3, icon: "droplet", color: "#E0E0E0", estimatedDurationMinutes: 5, sortOrder: 8 },
  { name: "Hair Oil", description: "Apply oil to hair and scalp", groomingCategory: "hair-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 2, icon: "droplet", color: "#FFB74D", estimatedDurationMinutes: 10, sortOrder: 9 },
  { name: "Hair Cutting", description: "Get a haircut", groomingCategory: "hair-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 30, icon: "scissors", color: "#90A4AE", estimatedDurationMinutes: 30, sortOrder: 10 },
  { name: "Beard Trim", description: "Trim and shape beard", groomingCategory: "face-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "scissors", color: "#A1887F", estimatedDurationMinutes: 10, sortOrder: 11 },
  { name: "Mustache Trim", description: "Trim mustache", groomingCategory: "face-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "scissors", color: "#BCAAA4", estimatedDurationMinutes: 5, sortOrder: 12 },
  { name: "Shaving", description: "Shave face", groomingCategory: "face-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 2, icon: "razor", color: "#B0BEC5", estimatedDurationMinutes: 10, sortOrder: 13 },
  { name: "Nail Cutting", description: "Trim fingernails and toenails", groomingCategory: "personal-hygiene", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "scissors", color: "#FF8A65", estimatedDurationMinutes: 10, sortOrder: 14 },
  { name: "Ear Cleaning", description: "Clean ears safely", groomingCategory: "personal-hygiene", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "ear", color: "#FFCC02", estimatedDurationMinutes: 3, sortOrder: 15 },
  { name: "Nose Hair Trim", description: "Trim nose hair", groomingCategory: "personal-hygiene", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 14, icon: "scissors", color: "#78909C", estimatedDurationMinutes: 2, sortOrder: 16 },
  { name: "Teeth Brushing (Morning)", description: "Brush teeth in the morning", groomingCategory: "dental-care", defaultFrequencyType: "daily", icon: "tooth", color: "#4FC3F7", preferredTime: "07:00", estimatedDurationMinutes: 3, sortOrder: 17 },
  { name: "Teeth Brushing (Night)", description: "Brush teeth before bed", groomingCategory: "dental-care", defaultFrequencyType: "daily", icon: "tooth", color: "#29B6F6", preferredTime: "22:00", estimatedDurationMinutes: 3, sortOrder: 18 },
  { name: "Mouthwash", description: "Rinse with mouthwash", groomingCategory: "dental-care", defaultFrequencyType: "daily", icon: "droplet", color: "#26A69A", preferredTime: "22:00", estimatedDurationMinutes: 1, sortOrder: 19 },
  { name: "Flossing", description: "Floss between teeth", groomingCategory: "dental-care", defaultFrequencyType: "daily", icon: "dots", color: "#80CBC4", preferredTime: "22:00", estimatedDurationMinutes: 2, sortOrder: 20 },
  { name: "Tongue Cleaning", description: "Clean your tongue", groomingCategory: "dental-care", defaultFrequencyType: "daily", icon: "brush", color: "#B2DFDB", preferredTime: "07:00", estimatedDurationMinutes: 1, sortOrder: 21 },
  { name: "Hand Care", description: "Moisturize and care for hands", groomingCategory: "body-care", defaultFrequencyType: "daily", icon: "hand", color: "#FFCC80", estimatedDurationMinutes: 3, sortOrder: 22 },
  { name: "Foot Care", description: "Moisturize and care for feet", groomingCategory: "body-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 2, icon: "foot", color: "#A5D6A7", estimatedDurationMinutes: 5, sortOrder: 23 },
  { name: "Body Lotion", description: "Apply lotion to body", groomingCategory: "skin-care", defaultFrequencyType: "daily", icon: "droplet", color: "#F8BBD0", preferredTime: "07:30", estimatedDurationMinutes: 5, sortOrder: 24 },
  { name: "Lip Balm", description: "Apply lip balm", groomingCategory: "face-care", defaultFrequencyType: "daily", icon: "heart", color: "#EF9A9A", estimatedDurationMinutes: 1, sortOrder: 25 },
  { name: "Perfume / Deodorant", description: "Apply perfume or deodorant", groomingCategory: "personal-hygiene", defaultFrequencyType: "daily", icon: "sparkles", color: "#CE93D8", preferredTime: "07:30", estimatedDurationMinutes: 1, sortOrder: 26 },
  { name: "Exercise Shower", description: "Shower after exercise", groomingCategory: "body-care", defaultFrequencyType: "daily", icon: "shower", color: "#4DD0E1", estimatedDurationMinutes: 10, sortOrder: 27 },
  { name: "Laundry", description: "Wash clothes", groomingCategory: "clothing-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "shirt", color: "#90CAF9", estimatedDurationMinutes: 60, sortOrder: 28 },
  { name: "Change Bedsheet", description: "Change bedsheets", groomingCategory: "clothing-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 14, icon: "bed", color: "#B39DDB", estimatedDurationMinutes: 10, sortOrder: 29 },
  { name: "Change Pillow Cover", description: "Change pillow covers", groomingCategory: "clothing-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "bed", color: "#D1C4E9", estimatedDurationMinutes: 5, sortOrder: 30 },
  { name: "Wash Towels", description: "Wash bath towels", groomingCategory: "clothing-care", defaultFrequencyType: "every_x_days", defaultFrequencyInterval: 7, icon: "shirt", color: "#B3E5FC", estimatedDurationMinutes: 5, sortOrder: 31 },
];

function computeNextDueDate(
  frequencyType: string,
  lastCompletedDate: string | null,
  frequencyInterval?: number | null,
  frequencyWeekdays?: number[] | null,
): string | null {
  const base = lastCompletedDate ?? new Date().toISOString().slice(0, 10);
  const last = new Date(base);
  let next: Date;

  if (frequencyType === "daily") {
    next = new Date(base);
    next.setDate(next.getDate() + 1);
  } else if (frequencyType === "every_x_days" && frequencyInterval) {
    next = new Date(base);
    next.setDate(next.getDate() + frequencyInterval);
  } else if (frequencyType === "every_x_weeks" && frequencyInterval) {
    next = new Date(base);
    next.setDate(next.getDate() + frequencyInterval * 7);
  } else if (frequencyType === "weekly") {
    next = new Date(base);
    next.setDate(next.getDate() + 7);
  } else if (frequencyType === "monthly") {
    next = new Date(base);
    next.setMonth(next.getMonth() + 1);
  } else if (frequencyType === "specific_weekdays" && frequencyWeekdays && frequencyWeekdays.length > 0) {
    next = new Date(base);
    next.setDate(next.getDate() + 1);
    const maxIterations = 14;
    let iterations = 0;
    while (!frequencyWeekdays.includes(next.getDay()) && iterations < maxIterations) {
      next.setDate(next.getDate() + 1);
      iterations++;
    }
  } else {
    next = new Date(base);
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString().slice(0, 10);
}

export async function setupGroomingTemplates(userId: string) {
  const existing = await repo.getHabitEnrichments(userId, "grooming");
  if (existing.length > 0) return { created: false, count: existing.length };

  const { db } = await import("@/core/database");
  const { habits } = await import("@/modules/habits/schema");

  let created = 0;
  for (const template of GROOMING_DEFAULT_TEMPLATES) {
    const [habit] = await db.insert(habits).values({
      userId,
      title: template.name,
      description: template.description,
      category: "health",
      frequency: template.defaultFrequencyType === "daily" ? "daily" : "weekly",
      frequencyType: template.defaultFrequencyType,
      frequencyInterval: template.defaultFrequencyInterval ?? null,
      frequencyWeekdays: template.defaultFrequencyWeekdays ?? null,
      timesPerDay: 1,
    }).returning();

    await repo.createHabitEnrichment({
      userId,
      habitId: habit.id,
      wellnessType: "grooming",
      groomingCategory: template.groomingCategory,
      icon: template.icon,
      color: template.color,
      preferredTime: template.preferredTime ?? null,
      estimatedDurationMinutes: template.estimatedDurationMinutes ?? null,
      sortOrder: template.sortOrder,
      isArchived: false,
      notes: null,
      subcategory: null,
      lastCompletedDate: null,
      nextDueDate: null,
      reminderDaysBefore: 1,
      seasonalMonths: null,
      estimatedCost: null,
      reminderConfig: null,
    });
    created++;
  }

  return { created: true, count: created };
}

export async function completeGroomingActivity(
  userId: string,
  params: CompleteGroomingParams,
) {
  const validated = completeGroomingSchema.parse(params);

  const { db } = await import("@/core/database");
  const { habitCompletions } = await import("@/modules/habits/schema");
  const { habits } = await import("@/modules/habits/schema");
  const { logCompletion } = await import("@/modules/habits");

  const completion = await logCompletion(
    userId,
    validated.habitId,
    validated.completedDate,
    validated.note,
  );

  if (validated.metadata) {
    await db.update(habitCompletions)
      .set({ metadata: validated.metadata as Record<string, unknown> })
      .where(eq(habitCompletions.id, completion.id));
  }

  const enrichment = await repo.getHabitEnrichment(validated.habitId, userId);
  if (enrichment) {
    const [habitRow] = await db.select({
      frequencyType: habits.frequencyType,
      frequencyInterval: habits.frequencyInterval,
      frequencyWeekdays: habits.frequencyWeekdays,
    }).from(habits).where(eq(habits.id, validated.habitId));

    const nextDue = habitRow && enrichment.lastCompletedDate
      ? computeNextDueDate(
          habitRow.frequencyType,
          validated.completedDate,
          habitRow.frequencyInterval,
          habitRow.frequencyWeekdays,
        )
      : null;

    await repo.updateHabitEnrichment(enrichment.id, userId, {
      lastCompletedDate: validated.completedDate,
      nextDueDate: nextDue,
    });
  }

  try {
    await awardXp(
      userId,
      "grooming_completed",
      completion.id,
      `Grooming: ${completion.note ?? "Activity completed"}`,
      10,
    );
  } catch {}

  return completion;
}

export async function getGroomingActivities(userId: string) {
  const enrichments = await repo.getHabitEnrichments(userId, "grooming");
  if (enrichments.length === 0) return [];

  const { db } = await import("@/core/database");
  const { habits, habitCompletions } = await import("@/modules/habits/schema");

  const habitIds = enrichments.map((e) => e.habitId);
  const habitRows = await db
    .select()
    .from(habits)
    .where(inArray(habits.id, habitIds));

  const today = new Date().toISOString().slice(0, 10);
  const todayCompletions = await db
    .select({ habitId: habitCompletions.habitId })
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        eq(habitCompletions.completedDate, today),
        inArray(habitCompletions.habitId, habitIds),
      ),
    );

  const todayCompletedIds = new Set(todayCompletions.map((c) => c.habitId));

  return enrichments
    .map((e) => {
      const habit = habitRows.find((h) => h.id === e.habitId);
      if (!habit) return null;
      return {
        ...e,
        habit: {
          id: habit.id,
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          frequencyType: habit.frequencyType,
          frequencyInterval: habit.frequencyInterval,
          frequencyWeekdays: habit.frequencyWeekdays,
          timesPerDay: habit.timesPerDay,
        },
        isCompletedToday: todayCompletedIds.has(habit.id),
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getGroomingScore(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const enrichments = await repo.getHabitEnrichments(userId, "grooming");

  if (enrichments.length === 0) return 50;
  const overdue = enrichments.filter(
    (e) => e.nextDueDate && e.nextDueDate < today,
  ).length;
  return clamp(100 - (overdue / enrichments.length) * 100, 0, 100);
}

export async function getGroomingDashboardStats(userId: string) {
  const activities = await getGroomingActivities(userId);
  const habitIds = activities.map((a) => a.habitId);
  const { db } = await import("@/core/database");
  const { habitCompletions } = await import("@/modules/habits/schema");

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [todayCount, weekCount, allDates] = await Promise.all([
    habitIds.length > 0
      ? db
          .select({ value: count() })
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.userId, userId),
              eq(habitCompletions.completedDate, today),
              inArray(habitCompletions.habitId, habitIds),
            ),
          )
      : Promise.resolve([{ value: 0 }]),
    habitIds.length > 0
      ? db
          .select({ value: count() })
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.userId, userId),
              gte(habitCompletions.completedDate, weekAgo),
              lte(habitCompletions.completedDate, today),
              inArray(habitCompletions.habitId, habitIds),
            ),
          )
      : Promise.resolve([{ value: 0 }]),
    habitIds.length > 0
      ? db
          .select({ date: habitCompletions.completedDate })
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.userId, userId),
              inArray(habitCompletions.habitId, habitIds),
            ),
          )
          .orderBy(habitCompletions.completedDate)
      : Promise.resolve([]),
  ]);

  const completionDates = allDates.map((r) => r.date);
  const uniqueDates = [...new Set(completionDates)].sort();

  const { calculateStreak } = await import("@/modules/habits");

  const streak = calculateStreak(uniqueDates);

  const overdue = activities.filter(
    (a) => a.nextDueDate && a.nextDueDate < today && !a.isCompletedToday,
  );

  const upcoming = activities.filter(
    (a) =>
      a.nextDueDate &&
      a.nextDueDate >= today &&
      a.nextDueDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) &&
      !a.isCompletedToday,
  );

  return {
    totalActivities: activities.length,
    completedToday: Number(todayCount[0]?.value ?? 0),
    completedThisWeek: Number(weekCount[0]?.value ?? 0),
    overdueCount: overdue.length,
    overdueActivities: overdue,
    upcomingCount: upcoming.length,
    upcomingActivities: upcoming,
    currentStreak: streak.current,
    longestStreak: streak.longest,
  };
}

export async function getGroomingInsights(userId: string) {
  const stats = await getGroomingDashboardStats(userId);
  const activities = await getGroomingActivities(userId);

  const insights: Array<{ type: "positive" | "negative" | "info"; message: string }> = [];

  if (stats.currentStreak >= 7) {
    insights.push({ type: "positive", message: `You've maintained grooming consistency for ${stats.currentStreak} consecutive days!` });
  } else if (stats.currentStreak >= 3) {
    insights.push({ type: "info", message: `Grooming streak: ${stats.currentStreak} days. Try to make it a week!` });
  }

  if (stats.overdueCount > 0) {
    const overdueNames = stats.overdueActivities.slice(0, 3).map((a) => a.habit?.title ?? "Unknown");
    insights.push({ type: "negative", message: `${stats.overdueCount} grooming ${stats.overdueCount === 1 ? "activity is" : "activities are"} overdue: ${overdueNames.join(", ")}` });
  }

  if (stats.completedToday > 0) {
    insights.push({ type: "positive", message: `Great start! You've completed ${stats.completedToday} grooming ${stats.completedToday === 1 ? "activity" : "activities"} today.` });
  }

  const longestStreakHabit = activities.reduce(
    (best, a) => {
      const dates = []; // This would be fetched per-habit in a more detailed implementation
      return best;
    },
    { current: 0, longest: 0, name: "" },
  );

  return insights;
}

// ── Scoring ──

export type WellnessScores = {
  mood: number;
  sleep: number;
  hydration: number;
  grooming: number;
  hygiene: number;
  selfCare: number;
  confidence: number;
  overall: number;
};

export async function computeWellnessScores(userId: string): Promise<WellnessScores> {
  const { dateFrom: monthAgo } = getDateRange({ period: "month" });
  const today = new Date().toISOString().slice(0, 10);

  const [moodAvg, sleepRecords, hydrationTotal, enrichments, confidenceLogs] = await Promise.all([
    repo.getMoodAverages(userId, monthAgo, today),
    repo.getSleepRecords(userId, { dateFrom: monthAgo, dateTo: today }),
    repo.getHydrationDailyTotal(userId, today),
    repo.getHabitEnrichments(userId),
    repo.getConfidenceCheckins(userId, { dateFrom: monthAgo, dateTo: today }),
  ]);

  // Mood Score: average of positive dimensions + inverted negative dimensions
  const moodScore = moodAvg?.count && moodAvg.count > 0
    ? clamp(
        Math.round(
          ((moodAvg.avgHappiness ?? 5) +
            (10 - (moodAvg.avgStress ?? 5)) +
            (10 - (moodAvg.avgAnxiety ?? 5)) +
            (moodAvg.avgMotivation ?? 5) +
            (moodAvg.avgEnergy ?? 5) +
            (moodAvg.avgConfidence ?? 5) +
            (moodAvg.avgFocus ?? 5) +
            (10 - (moodAvg.avgMentalFatigue ?? 5))) /
            8 *
            10,
        ),
        0,
        100,
      )
    : 50;

  // Sleep Score: quality × duration factor × consistency
  let sleepScore = 50;
  if (sleepRecords.length > 0) {
    const avgQuality = sleepRecords.reduce((s, r) => s + (r.quality ?? 5), 0) / sleepRecords.length;
    const durations = sleepRecords.map((r) => (r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000);
    const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;
    const optimalDuration = 7.5;
    const durationFactor = Math.max(0, 1 - Math.abs(avgDuration - optimalDuration) / optimalDuration);
    const sleepVariation = durations.length > 1
      ? 1 - Math.min(1, durations.reduce((sum, d) => sum + Math.abs(d - avgDuration), 0) / (durations.length * avgDuration))
      : 0.5;
    sleepScore = clamp(
      Math.round(avgQuality * durationFactor * 10 * (0.6 + 0.4 * sleepVariation)),
      0,
      100,
    );
  }

  // Hydration Score: percentage of daily goal
  const hydrationScore = clamp(
    Math.round((hydrationTotal / DEFAULT_HYDRATION_GOAL_ML) * 100),
    0,
    100,
  );

  // Grooming & Hygiene & Self-Care Scores: based on enrichment + due-date compliance
  let groomingScore = 50;
  let hygieneScore = 50;
  let selfCareScore = 50;
  const groomingItems = enrichments.filter((e) => e.wellnessType === "grooming");
  const hygieneItems = enrichments.filter((e) => e.wellnessType === "hygiene");
  const selfCareItems = enrichments.filter((e) => e.wellnessType === "self-care");

  if (groomingItems.length > 0) {
    const overdue = groomingItems.filter(
      (e) => e.nextDueDate && e.nextDueDate < today,
    ).length;
    groomingScore = clamp(100 - (overdue / groomingItems.length) * 100, 0, 100);
  }
  if (hygieneItems.length > 0) {
    const overdue = hygieneItems.filter(
      (e) => e.nextDueDate && e.nextDueDate < today,
    ).length;
    hygieneScore = clamp(100 - (overdue / hygieneItems.length) * 100, 0, 100);
  }
  if (selfCareItems.length > 0) {
    const overdue = selfCareItems.filter(
      (e) => e.nextDueDate && e.nextDueDate < today,
    ).length;
    selfCareScore = clamp(100 - (overdue / selfCareItems.length) * 100, 0, 100);
  }

  // Confidence Score: average of recent check-in scores
  let confidenceScore = 50;
  if (confidenceLogs.length > 0) {
    const avgScore = confidenceLogs.reduce((s, c) => s + c.score, 0) / confidenceLogs.length;
    confidenceScore = clamp(Math.round(avgScore * 10), 0, 100);
  }

  // Overall: weighted average
  const overall = Math.round(
    moodScore * 0.2 +
    sleepScore * 0.2 +
    hydrationScore * 0.15 +
    groomingScore * 0.1 +
    hygieneScore * 0.1 +
    selfCareScore * 0.15 +
    confidenceScore * 0.1,
  );

  return {
    mood: moodScore,
    sleep: sleepScore,
    hydration: hydrationScore,
    grooming: groomingScore,
    hygiene: hygieneScore,
    selfCare: selfCareScore,
    confidence: confidenceScore,
    overall: clamp(overall, 0, 100),
  };
}

// ── Insights ──

export type WellnessInsight = {
  type: "positive" | "negative" | "info";
  message: string;
  category: string;
};

export async function getWellnessInsights(userId: string): Promise<WellnessInsight[]> {
  const { dateFrom: monthAgo } = getDateRange({ period: "month" });
  const today = new Date().toISOString().slice(0, 10);
  const { dateFrom: weekAgo } = getDateRange({ period: "week" });

  const [moodRecent, moodMonth, sleepWeek, confidenceMonth, enrichments, hydrationToday] =
    await Promise.all([
      repo.getMoodAverages(userId, weekAgo, today),
      repo.getMoodAverages(userId, monthAgo, today),
      repo.getSleepRecords(userId, { dateFrom: weekAgo, dateTo: today }),
      repo.getConfidenceCheckins(userId, { dateFrom: monthAgo, dateTo: today }),
      repo.getHabitEnrichments(userId),
      repo.getHydrationDailyTotal(userId, today),
    ]);

  const insights: WellnessInsight[] = [];

  // Mood insights
  if (moodRecent && moodRecent.count > 0 && moodMonth && moodMonth.count > 0) {
    if ((moodRecent.avgEnergy ?? 5) > (moodMonth.avgEnergy ?? 5)) {
      insights.push({
        type: "positive",
        message: "Your energy levels are trending upward this week!",
        category: "mood",
      });
    }
    if ((moodRecent.avgStress ?? 5) > 7) {
      insights.push({
        type: "negative",
        message: "Stress levels are high this week. Consider mindfulness or relaxation activities.",
        category: "mood",
      });
    }
    if ((moodRecent.avgMotivation ?? 5) > (moodMonth.avgMotivation ?? 5)) {
      insights.push({
        type: "positive",
        message: "Your motivation improved compared to last month.",
        category: "mood",
      });
    }
  }

  // Sleep insights
  if (sleepWeek.length > 0) {
    const avgQuality = sleepWeek.reduce((s, r) => s + (r.quality ?? 5), 0) / sleepWeek.length;
    const shortNights = sleepWeek.filter(
      (r) => (r.wakeTime.getTime() - r.bedtime.getTime()) / 3600000 < 6,
    ).length;

    if (avgQuality >= 8) {
      insights.push({
        type: "positive",
        message: `Average sleep quality this week: ${avgQuality.toFixed(1)}/10 — great rest!`,
        category: "sleep",
      });
    } else if (avgQuality < 5) {
      insights.push({
        type: "negative",
        message: `Sleep quality averaged ${avgQuality.toFixed(1)}/10 this week. Try winding down earlier.`,
        category: "sleep",
      });
    }
    if (shortNights > 0) {
      insights.push({
        type: "negative",
        message: `You had ${shortNights} night${shortNights > 1 ? "s" : ""} with less than 6 hours of sleep this week.`,
        category: "sleep",
      });
    }
  }

  // Hydration insights
  if (hydrationToday < DEFAULT_HYDRATION_GOAL_ML * 0.5) {
    insights.push({
      type: "negative",
      message: "You're below 50% of your daily hydration goal. Drink up!",
      category: "hydration",
    });
  } else if (hydrationToday >= DEFAULT_HYDRATION_GOAL_ML) {
    insights.push({
      type: "positive",
      message: "You've hit your daily hydration goal!",
      category: "hydration",
    });
  }

  // Grooming/hygiene/self-care insights
  const overdueEnrichments = enrichments.filter(
    (e) => e.nextDueDate && e.nextDueDate < today,
  );
  if (overdueEnrichments.length > 0) {
    const overdueList = overdueEnrichments
      .map((e) => e.subcategory || e.wellnessType)
      .slice(0, 3)
      .join(", ");
    insights.push({
      type: "info",
      message: `${overdueEnrichments.length} wellness ${overdueEnrichments.length === 1 ? "activity is" : "activities are"} overdue: ${overdueList}`,
      category: "grooming",
    });
  }

  // Confidence insights
  if (confidenceMonth.length >= 2) {
    const recent = confidenceMonth.slice(0, 7);
    const avgRecent = recent.reduce((s, c) => s + c.score, 0) / recent.length;
    const older = confidenceMonth.slice(-7);
    const avgOlder = older.reduce((s, c) => s + c.score, 0) / older.length;

    if (avgRecent > avgOlder + 1) {
      insights.push({
        type: "positive",
        message: "Your confidence is trending upward this week!",
        category: "confidence",
      });
    } else if (avgRecent < avgOlder - 1) {
      insights.push({
        type: "negative",
        message: "Your confidence has dipped recently. Self-care may help.",
        category: "confidence",
      });
    }
  }

  // Cross-correlation: sleep quality vs. mood
  if (sleepWeek.length > 0 && moodRecent && moodRecent.count > 0) {
    const avgQuality = sleepWeek.reduce((s, r) => s + (r.quality ?? 5), 0) / sleepWeek.length;
    if (avgQuality >= 7 && (moodRecent.avgEnergy ?? 5) >= 7) {
      insights.push({
        type: "positive",
        message: "Good sleep quality correlates with high energy levels — keep it up!",
        category: "cross",
      });
    }
    if (avgQuality < 5 && (moodRecent.avgStress ?? 5) > 7) {
      insights.push({
        type: "info",
        message: "Poor sleep and high stress are correlated this week. Prioritize rest.",
        category: "cross",
      });
    }
  }

  return insights;
}

// ── Weight Entries ──

export async function createWeightEntry(userId: string, params: CreateWeightEntryParams) {
  const { bodyFatPercentage, musclePercentage, weightKg, ...rest } = createWeightEntrySchema.parse(params);
  return repo.createWeightEntry({
    userId,
    ...rest,
    weightKg: String(weightKg),
    bodyFatPercentage: bodyFatPercentage ? String(bodyFatPercentage) : null,
    musclePercentage: musclePercentage ? String(musclePercentage) : null,
  });
}

export async function getWeightEntries(userId: string, filters: AnalyticsFilterParams = {}) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getWeightEntries(userId, { dateFrom, dateTo });
}

export async function deleteWeightEntry(id: string, userId: string) {
  return repo.deleteWeightEntry(id, userId);
}

// ── Workout Entries ──

export async function createWorkoutEntry(userId: string, params: CreateWorkoutEntryParams) {
  const { distanceKm, ...rest } = createWorkoutEntrySchema.parse(params);
  const entry = await repo.createWorkoutEntry({
    userId,
    ...rest,
    distanceKm: distanceKm ? String(distanceKm) : null,
  });
  try { await awardXp(userId, "workout_logged", entry.id, "Workout logged", 5); } catch { }
  return entry;
}

export async function getWorkoutEntries(
  userId: string,
  filters: AnalyticsFilterParams & { type?: string } = {},
) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getWorkoutEntries(userId, { dateFrom, dateTo, type: filters.type });
}

export async function deleteWorkoutEntry(id: string, userId: string) {
  return repo.deleteWorkoutEntry(id, userId);
}

// ── Step Entries ──

export async function upsertStepEntry(userId: string, params: CreateStepEntryParams) {
  const validated = createStepEntrySchema.parse(params);
  const entry = await repo.upsertStepEntry({ userId, ...validated });
  try { await awardXp(userId, "steps_logged", entry.id, "Steps logged", 1); } catch { }
  return entry;
}

export async function getStepEntries(userId: string, filters: AnalyticsFilterParams = {}) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getStepEntries(userId, { dateFrom, dateTo });
}

// ── Calorie Entries ──

export async function createCalorieEntry(userId: string, params: CreateCalorieEntryParams) {
  const { proteinG, carbsG, fatG, ...rest } = createCalorieEntrySchema.parse(params);
  return repo.createCalorieEntry({
    userId,
    ...rest,
    proteinG: proteinG ? String(proteinG) : null,
    carbsG: carbsG ? String(carbsG) : null,
    fatG: fatG ? String(fatG) : null,
  });
}

export async function getCalorieEntries(userId: string, filters: AnalyticsFilterParams = {}) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getCalorieEntries(userId, { dateFrom, dateTo });
}

// ── Blood Pressure Entries ──

export async function createBloodPressureEntry(userId: string, params: CreateBpEntryParams) {
  const validated = createBpEntrySchema.parse(params);
  return repo.createBloodPressureEntry({ userId, ...validated });
}

export async function getBloodPressureEntries(
  userId: string,
  filters: AnalyticsFilterParams = {},
) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getBloodPressureEntries(userId, { dateFrom, dateTo });
}

// ── Heart Rate Entries ──

export async function upsertHeartRateEntry(userId: string, params: CreateHrEntryParams) {
  const validated = createHrEntrySchema.parse(params);
  return repo.upsertHeartRateEntry({ userId, ...validated });
}

export async function getHeartRateEntries(userId: string, filters: AnalyticsFilterParams = {}) {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getHeartRateEntries(userId, { dateFrom, dateTo });
}

// ── Medicine Reminders ──

export async function createMedicineReminder(userId: string, params: CreateMedicineReminderParams) {
  const validated = createMedicineReminderSchema.parse(params);
  return repo.createMedicineReminder({ userId, ...validated });
}

export async function getMedicineReminders(userId: string) {
  return repo.getMedicineReminders(userId);
}

export async function updateMedicineReminder(
  id: string,
  userId: string,
  params: z.infer<typeof updateMedicineReminderSchema>,
) {
  const validated = updateMedicineReminderSchema.parse(params);
  return repo.updateMedicineReminder(id, userId, validated);
}

export async function deleteMedicineReminder(id: string, userId: string) {
  return repo.deleteMedicineReminder(id, userId);
}

// ── Medicine Logs ──

export async function createMedicineLog(userId: string, params: CreateMedicineLogParams) {
  const validated = createMedicineLogSchema.parse(params);
  return repo.createMedicineLog({ userId, ...validated });
}

export async function getMedicineLogs(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; medicineId?: string } = {},
) {
  return repo.getMedicineLogs(userId, opts);
}

// ── User Goals ──

export async function createUserGoal(userId: string, params: CreateUserGoalParams) {
  const { targetValue, currentValue, ...rest } = createUserGoalSchema.parse(params);
  return repo.createUserGoal({
    userId,
    ...rest,
    targetValue: String(targetValue),
    currentValue: currentValue !== undefined ? String(currentValue) : "0",
  });
}

export async function getUserGoals(userId: string) {
  return repo.getUserGoals(userId);
}

export async function updateUserGoal(
  id: string,
  userId: string,
  params: z.infer<typeof updateUserGoalSchema>,
) {
  const { targetValue, currentValue, ...rest } = updateUserGoalSchema.parse(params);
  return repo.updateUserGoal(id, userId, {
    ...rest,
    ...(targetValue !== undefined ? { targetValue: String(targetValue) } : {}),
    ...(currentValue !== undefined ? { currentValue: String(currentValue) } : {}),
  });
}

export async function deleteUserGoal(id: string, userId: string) {
  return repo.deleteUserGoal(id, userId);
}

// ── Achievements ──

export async function createAchievement(userId: string, achievementType: string, title: string) {
  return repo.createAchievement({ userId, achievementType, title });
}

export async function getAchievements(userId: string) {
  return repo.getAchievements(userId);
}

// ── BMI Calculator ──

export function calculateBmi(heightCm: number, weightKg: number) {
  const bmi = Math.round((weightKg / ((heightCm / 100) * (heightCm / 100))) * 10) / 10;
  let category: string;
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";
  const minHealthy = Math.round(18.5 * ((heightCm / 100) * (heightCm / 100)) * 10) / 10;
  const maxHealthy = Math.round(24.9 * ((heightCm / 100) * (heightCm / 100)) * 10) / 10;
  return { bmi, category, healthyWeightRange: { min: minHealthy, max: maxHealthy } };
}
