import { z } from "zod";
import { cache } from "react";
import * as repo from "./repository";
import { awardXp } from "@/modules/gamification";

// ── Constants ──

const DIMENSION_KEYS = [
  "happiness", "stress", "anxiety", "motivation",
  "energy", "confidence", "focus", "mentalFatigue",
] as const;

const WELLNESS_TYPES = ["grooming", "hygiene", "self-care", "confidence"] as const;

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
  notes: z.string().max(2000).optional(),
});

export const updateSleepRecordSchema = createSleepRecordSchema.partial();

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

export const analyticsFilterSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.enum(["week", "month", "quarter", "year"]).optional(),
});

export type CreateMoodLogParams = z.infer<typeof createMoodLogSchema>;
export type CreateSleepRecordParams = z.infer<typeof createSleepRecordSchema>;
export type CreateHydrationEntryParams = z.infer<typeof createHydrationEntrySchema>;
export type CreateConfidenceCheckinParams = z.infer<typeof createConfidenceCheckinSchema>;
export type CreateHabitEnrichmentParams = z.infer<typeof createHabitEnrichmentSchema>;
export type AnalyticsFilterParams = z.infer<typeof analyticsFilterSchema>;

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
  if (validated.notes !== undefined) updateData.notes = validated.notes;
  return repo.updateSleepRecord(id, userId, updateData);
}

export const getSleepRecords = cache(async (userId: string, filters: AnalyticsFilterParams = {}) => {
  const { dateFrom, dateTo } = getDateRange(filters);
  return repo.getSleepRecords(userId, { dateFrom, dateTo });
});

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
