import { connectToDatabase } from "@/lib/mongodb";
import {
  WellnessMoodLog,
  WellnessSleepRecord,
  WellnessUserPreference,
  WellnessHydrationEntry,
  WellnessConfidenceCheckin,
  WellnessHabitEnrichment,
  WellnessWeightEntry,
  WellnessWorkoutEntry,
  WellnessStepEntry,
  WellnessCalorieEntry,
  WellnessBloodPressureEntry,
  WellnessHeartRateEntry,
  WellnessMedicineReminder,
  WellnessMedicineLog,
  WellnessUserGoal,
  WellnessAchievement,
} from "@/lib/models/wellness";

// ── Helpers ──

function toDoc(doc: any) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function toDocs(docs: any[]) {
  return docs.map(toDoc);
}

// ── Types ──

export type WellnessMoodLog = {
  id: string;
  userId: string;
  loggedAt: Date;
  happiness: number;
  stress: number;
  anxiety: number;
  motivation: number;
  energy: number;
  confidence: number;
  focus: number;
  mentalFatigue: number;
  notes?: string;
  tags: string[];
  emoji?: string;
  voiceNoteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessSleepRecord = {
  id: string;
  userId: string;
  bedtime: Date;
  wakeTime: Date;
  quality?: number;
  interruptions: number;
  sleepLatencyMinutes?: number;
  moodAfterWaking?: string;
  energyLevel?: number;
  importSource?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessHydrationEntry = {
  id: string;
  userId: string;
  date: Date;
  amountMl: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessConfidenceCheckin = {
  id: string;
  userId: string;
  date: Date;
  score: number;
  selfEsteem?: number;
  socialComfort?: number;
  publicSpeakingConfidence?: number;
  appearanceSatisfaction?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessHabitEnrichment = {
  id: string;
  userId: string;
  habitId: string;
  wellnessType: string;
  subcategory?: string;
  lastCompletedDate?: Date;
  nextDueDate?: Date;
  reminderDaysBefore: number;
  seasonalMonths?: number[];
  estimatedCost?: number;
  notes?: string;
  groomingCategory?: string;
  icon?: string;
  color?: string;
  preferredTime?: string;
  estimatedDurationMinutes?: number;
  sortOrder: number;
  isArchived: boolean;
  reminderConfig?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessHabitEnrichmentInsert = Partial<WellnessHabitEnrichment>;

export type CreateMoodLogInput = {
  userId: string;
  loggedAt?: Date;
  happiness: number;
  stress: number;
  anxiety: number;
  motivation: number;
  energy: number;
  confidence: number;
  focus: number;
  mentalFatigue: number;
  notes?: string;
  tags?: string[];
  emoji?: string;
  voiceNoteUrl?: string;
};

export type CreateSleepRecordInput = {
  userId: string;
  bedtime: Date;
  wakeTime: Date;
  quality?: number;
  interruptions?: number;
  sleepLatencyMinutes?: number;
  moodAfterWaking?: string;
  energyLevel?: number;
  importSource?: string;
  notes?: string;
};

export type CreateHydrationEntryInput = {
  userId: string;
  date: Date;
  amountMl: number;
  loggedAt?: Date;
};

export type CreateConfidenceCheckinInput = {
  userId: string;
  date: Date;
  score: number;
  selfEsteem?: number;
  socialComfort?: number;
  publicSpeakingConfidence?: number;
  appearanceSatisfaction?: number;
  notes?: string;
};

export type CreateHabitEnrichmentInput = {
  userId: string;
  habitId: string;
  wellnessType: string;
  subcategory?: string;
  lastCompletedDate?: Date;
  nextDueDate?: Date;
  reminderDaysBefore?: number;
  seasonalMonths?: number[];
  estimatedCost?: number;
  notes?: string;
  groomingCategory?: string;
  icon?: string;
  color?: string;
  preferredTime?: string;
  estimatedDurationMinutes?: number;
  sortOrder?: number;
  isArchived?: boolean;
  reminderConfig?: Record<string, unknown>;
};

export type WellnessWeightEntry = {
  id: string;
  userId: string;
  weightKg: number;
  bodyFatPercentage?: number;
  musclePercentage?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessWorkoutEntry = {
  id: string;
  userId: string;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessStepEntry = {
  id: string;
  userId: string;
  steps: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessCalorieEntry = {
  id: string;
  userId: string;
  mealType: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessBloodPressureEntry = {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessHeartRateEntry = {
  id: string;
  userId: string;
  bpm: number;
  type?: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessMedicineReminder = {
  id: string;
  userId: string;
  name: string;
  dosage?: string;
  frequency: string;
  times: string[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessMedicineLog = {
  id: string;
  userId: string;
  reminderId?: string;
  name: string;
  dosage?: string;
  takenAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessUserGoal = {
  id: string;
  userId: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WellnessAchievement = {
  id: string;
  userId: string;
  achievementType: string;
  title: string;
  description?: string;
  achievedAt: Date;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateWeightEntryInput = {
  userId: string;
  weightKg: number;
  bodyFatPercentage?: number;
  musclePercentage?: number;
  date: Date;
  notes?: string;
};

export type CreateWorkoutEntryInput = {
  userId: string;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  notes?: string;
  date: Date;
};

export type CreateStepEntryInput = {
  userId: string;
  steps: number;
  date: Date;
};

export type CreateCalorieEntryInput = {
  userId: string;
  mealType: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  date: Date;
};

export type CreateBloodPressureEntryInput = {
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: Date;
  notes?: string;
};

export type CreateHeartRateEntryInput = {
  userId: string;
  bpm: number;
  type?: string;
  date: Date;
  notes?: string;
};

export type CreateMedicineReminderInput = {
  userId: string;
  name: string;
  dosage?: string;
  frequency: string;
  times: string[];
  isActive?: boolean;
  notes?: string;
};

export type CreateMedicineLogInput = {
  userId: string;
  reminderId?: string;
  name: string;
  dosage?: string;
  takenAt?: Date;
  notes?: string;
};

export type CreateUserGoalInput = {
  userId: string;
  goalType: string;
  targetValue: number;
  currentValue?: number;
  unit?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
};

export type CreateAchievementInput = {
  userId: string;
  achievementType: string;
  title: string;
  description?: string;
  achievedAt?: Date;
  icon?: string;
};

// ── Mood Logs ──

export async function createMoodLog(input: CreateMoodLogInput) {
  await connectToDatabase();
  const doc = await WellnessMoodLog.create(input);
  return toDoc(doc);
}

export async function getMoodLogById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessMoodLog.findOne({ _id: id, userId }).lean();
  return toDoc(doc);
}

export async function getMoodLogs(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.loggedAt = { ...filter.loggedAt, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.loggedAt = { ...filter.loggedAt, $lte: new Date(opts.dateTo) };

  const docs = await WellnessMoodLog.find(filter)
    .sort({ loggedAt: -1 })
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 50)
    .lean();
  return toDocs(docs);
}

export async function getMoodAverages(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  await connectToDatabase();
  const [result] = await WellnessMoodLog.aggregate([
    {
      $match: {
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
      },
    },
    {
      $group: {
        _id: null,
        avgHappiness: { $avg: "$happiness" },
        avgStress: { $avg: "$stress" },
        avgAnxiety: { $avg: "$anxiety" },
        avgMotivation: { $avg: "$motivation" },
        avgEnergy: { $avg: "$energy" },
        avgConfidence: { $avg: "$confidence" },
        avgFocus: { $avg: "$focus" },
        avgMentalFatigue: { $avg: "$mentalFatigue" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result
    ? {
        avgHappiness: result.avgHappiness,
        avgStress: result.avgStress,
        avgAnxiety: result.avgAnxiety,
        avgMotivation: result.avgMotivation,
        avgEnergy: result.avgEnergy,
        avgConfidence: result.avgConfidence,
        avgFocus: result.avgFocus,
        avgMentalFatigue: result.avgMentalFatigue,
        count: result.count,
      }
    : null;
}

// ── Sleep Records ──

export async function createSleepRecord(input: CreateSleepRecordInput) {
  await connectToDatabase();
  const doc = await WellnessSleepRecord.create(input);
  return toDoc(doc);
}

export async function getSleepRecordById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessSleepRecord.findOne({ _id: id, userId }).lean();
  return toDoc(doc);
}

export async function getSleepRecords(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.bedtime = { ...filter.bedtime, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.bedtime = { ...filter.bedtime, $lte: new Date(opts.dateTo) };

  const docs = await WellnessSleepRecord.find(filter)
    .sort({ bedtime: -1 })
    .limit(opts.limit ?? 30)
    .lean();
  return toDocs(docs);
}

export async function updateSleepRecord(
  id: string,
  userId: string,
  input: Partial<CreateSleepRecordInput>,
) {
  await connectToDatabase();
  const doc = await WellnessSleepRecord.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function deleteSleepRecord(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessSleepRecord.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

export async function getSleepRecordsByDateRange(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  await connectToDatabase();
  const docs = await WellnessSleepRecord.find({
    userId,
    bedtime: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
  })
    .sort({ bedtime: -1 })
    .lean();
  return toDocs(docs);
}

export async function getSleepStatistics(userId: string) {
  await connectToDatabase();
  const [result] = await WellnessSleepRecord.aggregate([
    { $match: { userId } },
    {
      $project: {
        sleepSeconds: { $subtract: ["$wakeTime", "$bedtime"] },
        quality: 1,
        bedtime: 1,
        wakeTime: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalSleepSeconds: { $sum: "$sleepSeconds" },
        totalNights: { $sum: 1 },
        longestSleepSeconds: { $max: "$sleepSeconds" },
        shortestSleepSeconds: { $min: "$sleepSeconds" },
        avgBedtimeHour: {
          $avg: {
            $add: [
              { $hour: "$bedtime" },
              { $divide: [{ $minute: "$bedtime" }, 60] },
            ],
          },
        },
        avgWakeTimeHour: {
          $avg: {
            $add: [
              { $hour: "$wakeTime" },
              { $divide: [{ $minute: "$wakeTime" }, 60] },
            ],
          },
        },
        avgQuality: { $avg: "$quality" },
      },
    },
  ]);

  if (!result) return null;

  return {
    totalSleptHours: (result.totalSleepSeconds / 3600).toFixed(1),
    totalNights: result.totalNights,
    longestSleepHours: (result.longestSleepSeconds / 3600).toFixed(1),
    shortestSleepHours: (result.shortestSleepSeconds / 3600).toFixed(1),
    avgBedtimeHour: result.avgBedtimeHour.toFixed(1),
    avgWakeTimeHour: result.avgWakeTimeHour.toFixed(1),
    avgQuality: result.avgQuality.toFixed(1),
  };
}

export async function getSleepDailyTotals(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  await connectToDatabase();
  const results = await WellnessSleepRecord.aggregate([
    {
      $match: {
        userId,
        bedtime: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$bedtime" } },
        sleepSeconds: { $subtract: ["$wakeTime", "$bedtime"] },
        quality: 1,
        bedtime: 1,
        wakeTime: 1,
      },
    },
    {
      $group: {
        _id: "$date",
        totalHours: { $sum: "$sleepSeconds" },
        avgQuality: { $avg: "$quality" },
        count: { $sum: 1 },
        bedtime: { $min: "$bedtime" },
        wakeTime: { $max: "$wakeTime" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r: any) => ({
    date: r._id,
    totalHours: (r.totalHours / 3600).toFixed(1),
    avgQuality: r.avgQuality.toFixed(1),
    count: r.count,
    bedtime: r.bedtime,
    wakeTime: r.wakeTime,
  }));
}

export async function getSleepBestDay(userId: string) {
  await connectToDatabase();
  const results = await WellnessSleepRecord.aggregate([
    { $match: { userId } },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$bedtime" } },
        sleepSeconds: { $subtract: ["$wakeTime", "$bedtime"] },
        quality: 1,
      },
    },
    {
      $group: {
        _id: "$date",
        totalHours: { $sum: "$sleepSeconds" },
        avgQuality: { $avg: "$quality" },
      },
    },
    { $sort: { avgQuality: -1 } },
    { $limit: 1 },
  ]);

  if (!results[0]) return null;
  return {
    date: results[0]._id,
    totalHours: (results[0].totalHours / 3600).toFixed(1),
    avgQuality: results[0].avgQuality.toFixed(1),
  };
}

export async function getSleepWorstDay(userId: string) {
  await connectToDatabase();
  const results = await WellnessSleepRecord.aggregate([
    { $match: { userId } },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$bedtime" } },
        sleepSeconds: { $subtract: ["$wakeTime", "$bedtime"] },
        quality: 1,
      },
    },
    {
      $group: {
        _id: "$date",
        totalHours: { $sum: "$sleepSeconds" },
        avgQuality: { $avg: "$quality" },
      },
    },
    { $sort: { avgQuality: 1 } },
    { $limit: 1 },
  ]);

  if (!results[0]) return null;
  return {
    date: results[0]._id,
    totalHours: (results[0].totalHours / 3600).toFixed(1),
    avgQuality: results[0].avgQuality.toFixed(1),
  };
}

// ── User Preferences ──

export async function upsertUserPreference(
  userId: string,
  input: Partial<CreateUserGoalInput> & Record<string, any>,
) {
  await connectToDatabase();
  const doc = await WellnessUserPreference.findOneAndUpdate(
    { userId },
    { $set: { ...input, userId, updatedAt: new Date() } },
    { new: true, upsert: true },
  ).lean();
  return toDoc(doc);
}

export async function getUserPreference(userId: string) {
  await connectToDatabase();
  const doc = await WellnessUserPreference.findOne({ userId }).lean();
  return toDoc(doc);
}

// ── Hydration Entries ──

export async function createHydrationEntry(input: CreateHydrationEntryInput) {
  await connectToDatabase();
  const doc = await WellnessHydrationEntry.create(input);
  return toDoc(doc);
}

export async function getHydrationEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessHydrationEntry.find(filter)
    .sort({ loggedAt: -1 })
    .lean();
  return toDocs(docs);
}

export async function getHydrationDailyTotal(userId: string, date: string) {
  await connectToDatabase();
  const [result] = await WellnessHydrationEntry.aggregate([
    { $match: { userId, date: new Date(date) } },
    { $group: { _id: null, total: { $sum: "$amountMl" } } },
  ]);
  return result?.total ?? 0;
}

export async function deleteHydrationEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessHydrationEntry.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Confidence Check-ins (one per day) ──

export async function upsertConfidenceCheckin(input: CreateConfidenceCheckinInput) {
  await connectToDatabase();
  const doc = await WellnessConfidenceCheckin.findOneAndUpdate(
    { userId: input.userId, date: input.date },
    {
      $set: {
        score: input.score,
        selfEsteem: input.selfEsteem,
        socialComfort: input.socialComfort,
        publicSpeakingConfidence: input.publicSpeakingConfidence,
        appearanceSatisfaction: input.appearanceSatisfaction,
        notes: input.notes,
      },
    },
    { new: true, upsert: true },
  ).lean();
  return toDoc(doc);
}

export async function getConfidenceCheckin(userId: string, date: string) {
  await connectToDatabase();
  const doc = await WellnessConfidenceCheckin.findOne({
    userId,
    date: new Date(date),
  }).lean();
  return toDoc(doc);
}

export async function getConfidenceCheckins(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessConfidenceCheckin.find(filter)
    .sort({ date: -1 })
    .limit(opts.limit ?? 30)
    .lean();
  return toDocs(docs);
}

// ── Wellness Habit Enrichment ──

export async function createHabitEnrichment(input: CreateHabitEnrichmentInput) {
  await connectToDatabase();
  const doc = await WellnessHabitEnrichment.create(input);
  return toDoc(doc);
}

export async function getHabitEnrichment(habitId: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessHabitEnrichment.findOne({ habitId, userId }).lean();
  return toDoc(doc);
}

export async function getHabitEnrichments(userId: string, wellnessType?: string) {
  await connectToDatabase();
  const filter: any = { userId };
  if (wellnessType) filter.wellnessType = wellnessType;

  const docs = await WellnessHabitEnrichment.find(filter)
    .sort({ nextDueDate: 1 })
    .lean();
  return toDocs(docs);
}

export async function updateHabitEnrichment(
  id: string,
  userId: string,
  input: Partial<CreateHabitEnrichmentInput>,
) {
  await connectToDatabase();
  const doc = await WellnessHabitEnrichment.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function deleteHabitEnrichment(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessHabitEnrichment.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

export async function getOverdueEnrichments(userId: string) {
  await connectToDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const docs = await WellnessHabitEnrichment.find({
    userId,
    nextDueDate: { $lte: new Date(today) },
  })
    .sort({ nextDueDate: 1 })
    .lean();
  return toDocs(docs);
}

// ── Weight Entries ──

export async function createWeightEntry(input: CreateWeightEntryInput) {
  await connectToDatabase();
  const doc = await WellnessWeightEntry.create(input);
  return toDoc(doc);
}

export async function getWeightEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessWeightEntry.find(filter)
    .sort({ date: -1 })
    .limit(opts.limit ?? 50)
    .lean();
  return toDocs(docs);
}

export async function deleteWeightEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessWeightEntry.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Workout Entries ──

export async function createWorkoutEntry(input: CreateWorkoutEntryInput) {
  await connectToDatabase();
  const doc = await WellnessWorkoutEntry.create(input);
  return toDoc(doc);
}

export async function getWorkoutEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; type?: string; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };
  if (opts.type) filter.workoutType = opts.type;

  const docs = await WellnessWorkoutEntry.find(filter)
    .sort({ date: -1 })
    .limit(opts.limit ?? 50)
    .lean();
  return toDocs(docs);
}

export async function deleteWorkoutEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessWorkoutEntry.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Step Entries ──

export async function upsertStepEntry(input: CreateStepEntryInput) {
  await connectToDatabase();
  const doc = await WellnessStepEntry.findOneAndUpdate(
    { userId: input.userId, date: input.date },
    { $set: { steps: input.steps } },
    { new: true, upsert: true },
  ).lean();
  return toDoc(doc);
}

export async function getStepEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessStepEntry.find(filter)
    .sort({ date: -1 })
    .lean();
  return toDocs(docs);
}

// ── Calorie Entries ──

export async function createCalorieEntry(input: CreateCalorieEntryInput) {
  await connectToDatabase();
  const doc = await WellnessCalorieEntry.create(input);
  return toDoc(doc);
}

export async function getCalorieEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessCalorieEntry.find(filter)
    .sort({ date: -1 })
    .lean();
  return toDocs(docs);
}

export async function getCalorieDailyTotal(userId: string, date: string) {
  await connectToDatabase();
  const [result] = await WellnessCalorieEntry.aggregate([
    { $match: { userId, date: new Date(date) } },
    { $group: { _id: null, total: { $sum: "$calories" } } },
  ]);
  return result?.total ?? 0;
}

export async function deleteCalorieEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessCalorieEntry.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Blood Pressure Entries ──

export async function createBloodPressureEntry(input: CreateBloodPressureEntryInput) {
  await connectToDatabase();
  const doc = await WellnessBloodPressureEntry.create(input);
  return toDoc(doc);
}

export async function getBloodPressureEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessBloodPressureEntry.find(filter)
    .sort({ date: -1 })
    .limit(opts.limit ?? 30)
    .lean();
  return toDocs(docs);
}

// ── Heart Rate Entries ──

export async function upsertHeartRateEntry(input: CreateHeartRateEntryInput) {
  await connectToDatabase();
  const doc = await WellnessHeartRateEntry.findOneAndUpdate(
    { userId: input.userId, date: input.date },
    { $set: { bpm: input.bpm, type: input.type, notes: input.notes } },
    { new: true, upsert: true },
  ).lean();
  return toDoc(doc);
}

export async function getHeartRateEntries(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.date = { ...filter.date, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.date = { ...filter.date, $lte: new Date(opts.dateTo) };

  const docs = await WellnessHeartRateEntry.find(filter)
    .sort({ date: -1 })
    .lean();
  return toDocs(docs);
}

// ── Medicine Reminders ──

export async function createMedicineReminder(input: CreateMedicineReminderInput) {
  await connectToDatabase();
  const doc = await WellnessMedicineReminder.create(input);
  return toDoc(doc);
}

export async function getMedicineReminders(userId: string) {
  await connectToDatabase();
  const docs = await WellnessMedicineReminder.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return toDocs(docs);
}

export async function getActiveMedicineReminders(userId: string) {
  await connectToDatabase();
  const docs = await WellnessMedicineReminder.find({ userId, isActive: true })
    .sort({ createdAt: 1 })
    .lean();
  return toDocs(docs);
}

export async function updateMedicineReminder(
  id: string,
  userId: string,
  input: Partial<CreateMedicineReminderInput>,
) {
  await connectToDatabase();
  const doc = await WellnessMedicineReminder.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function deleteMedicineReminder(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessMedicineReminder.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Medicine Logs ──

export async function createMedicineLog(input: CreateMedicineLogInput) {
  await connectToDatabase();
  const doc = await WellnessMedicineLog.create(input);
  return toDoc(doc);
}

export async function getMedicineLogs(
  userId: string,
  opts: { dateFrom?: string; dateTo?: string; medicineId?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.dateFrom) filter.takenAt = { ...filter.takenAt, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.takenAt = { ...filter.takenAt, $lte: new Date(opts.dateTo) };
  if (opts.medicineId) filter.reminderId = opts.medicineId;

  const docs = await WellnessMedicineLog.find(filter)
    .sort({ takenAt: -1 })
    .lean();
  return toDocs(docs);
}

// ── User Goals ──

export async function createUserGoal(input: CreateUserGoalInput) {
  await connectToDatabase();
  const doc = await WellnessUserGoal.create(input);
  return toDoc(doc);
}

export async function getUserGoals(userId: string) {
  await connectToDatabase();
  const docs = await WellnessUserGoal.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return toDocs(docs);
}

export async function updateUserGoal(
  id: string,
  userId: string,
  input: Partial<CreateUserGoalInput>,
) {
  await connectToDatabase();
  const doc = await WellnessUserGoal.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function deleteUserGoal(id: string, userId: string) {
  await connectToDatabase();
  const doc = await WellnessUserGoal.findOneAndDelete({ _id: id, userId });
  return toDoc(doc);
}

// ── Achievements ──

export async function createAchievement(input: CreateAchievementInput) {
  await connectToDatabase();
  const existing = await WellnessAchievement.findOne({
    userId: input.userId,
    achievementType: input.achievementType,
  }).lean();
  if (existing) return toDoc(existing);

  const doc = await WellnessAchievement.create(input);
  return toDoc(doc);
}

export async function getAchievements(userId: string) {
  await connectToDatabase();
  const docs = await WellnessAchievement.find({ userId })
    .sort({ achievedAt: -1 })
    .lean();
  return toDocs(docs);
}
