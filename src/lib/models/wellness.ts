import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWellnessMoodLog extends Document {
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
}

const WellnessMoodLogSchema = new Schema<IWellnessMoodLog>(
  {
    userId: { type: String, required: true, index: true },
    loggedAt: { type: Date, default: Date.now },
    happiness: { type: Number, required: true },
    stress: { type: Number, required: true },
    anxiety: { type: Number, required: true },
    motivation: { type: Number, required: true },
    energy: { type: Number, required: true },
    confidence: { type: Number, required: true },
    focus: { type: Number, required: true },
    mentalFatigue: { type: Number, required: true },
    notes: { type: String },
    tags: { type: [String], default: [] },
    emoji: { type: String },
    voiceNoteUrl: { type: String },
  },
  { timestamps: true }
);

export interface IWellnessSleepRecord extends Document {
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
}

const WellnessSleepRecordSchema = new Schema<IWellnessSleepRecord>(
  {
    userId: { type: String, required: true, index: true },
    bedtime: { type: Date, required: true },
    wakeTime: { type: Date, required: true },
    quality: { type: Number },
    interruptions: { type: Number, default: 0 },
    sleepLatencyMinutes: { type: Number },
    moodAfterWaking: { type: String },
    energyLevel: { type: Number },
    importSource: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IWellnessUserPreference extends Document {
  userId: string;
  sleepGoalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessUserPreferenceSchema = new Schema<IWellnessUserPreference>(
  {
    userId: { type: String, required: true, unique: true },
    sleepGoalHours: { type: Number, default: 8 },
  },
  { timestamps: true }
);

export interface IWellnessHydrationEntry extends Document {
  userId: string;
  date: Date;
  amountMl: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessHydrationEntrySchema = new Schema<IWellnessHydrationEntry>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    amountMl: { type: Number, required: true },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WellnessHydrationEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessConfidenceCheckin extends Document {
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
}

const WellnessConfidenceCheckinSchema = new Schema<IWellnessConfidenceCheckin>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true },
    selfEsteem: { type: Number },
    socialComfort: { type: Number },
    publicSpeakingConfidence: { type: Number },
    appearanceSatisfaction: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

WellnessConfidenceCheckinSchema.index({ userId: 1, date: 1 }, { unique: true });

export interface IWellnessHabitEnrichment extends Document {
  userId: string;
  habitId: Types.ObjectId;
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
}

const WellnessHabitEnrichmentSchema = new Schema<IWellnessHabitEnrichment>(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, required: true, unique: true },
    wellnessType: { type: String, required: true, index: true },
    subcategory: { type: String },
    lastCompletedDate: { type: Date },
    nextDueDate: { type: Date, index: true },
    reminderDaysBefore: { type: Number, default: 3 },
    seasonalMonths: { type: [Number] },
    estimatedCost: { type: Number },
    notes: { type: String },
    groomingCategory: { type: String, index: true },
    icon: { type: String },
    color: { type: String },
    preferredTime: { type: String },
    estimatedDurationMinutes: { type: Number },
    sortOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    reminderConfig: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IWellnessWeightEntry extends Document {
  userId: string;
  weightKg: number;
  bodyFatPercentage?: number;
  musclePercentage?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessWeightEntrySchema = new Schema<IWellnessWeightEntry>(
  {
    userId: { type: String, required: true, index: true },
    weightKg: { type: Number, required: true },
    bodyFatPercentage: { type: Number },
    musclePercentage: { type: Number },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

WellnessWeightEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessWorkoutEntry extends Document {
  userId: string;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessWorkoutEntrySchema = new Schema<IWellnessWorkoutEntry>(
  {
    userId: { type: String, required: true, index: true },
    workoutType: { type: String, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number },
    distanceKm: { type: Number },
    notes: { type: String },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

WellnessWorkoutEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessStepEntry extends Document {
  userId: string;
  steps: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessStepEntrySchema = new Schema<IWellnessStepEntry>(
  {
    userId: { type: String, required: true, index: true },
    steps: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

WellnessStepEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export interface IWellnessCalorieEntry extends Document {
  userId: string;
  mealType: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessCalorieEntrySchema = new Schema<IWellnessCalorieEntry>(
  {
    userId: { type: String, required: true, index: true },
    mealType: { type: String, required: true },
    calories: { type: Number, required: true },
    proteinG: { type: Number },
    carbsG: { type: Number },
    fatG: { type: Number },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

WellnessCalorieEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessBloodPressureEntry extends Document {
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessBloodPressureEntrySchema = new Schema<IWellnessBloodPressureEntry>(
  {
    userId: { type: String, required: true, index: true },
    systolic: { type: Number, required: true },
    diastolic: { type: Number, required: true },
    pulse: { type: Number },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

WellnessBloodPressureEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessHeartRateEntry extends Document {
  userId: string;
  bpm: number;
  type?: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessHeartRateEntrySchema = new Schema<IWellnessHeartRateEntry>(
  {
    userId: { type: String, required: true, index: true },
    bpm: { type: Number, required: true },
    type: { type: String },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

WellnessHeartRateEntrySchema.index({ userId: 1, date: 1 });

export interface IWellnessMedicineReminder extends Document {
  userId: string;
  name: string;
  dosage?: string;
  frequency: string;
  times: string[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessMedicineReminderSchema = new Schema<IWellnessMedicineReminder>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String, required: true },
    times: { type: [String], required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IWellnessMedicineLog extends Document {
  userId: string;
  reminderId?: Types.ObjectId;
  name: string;
  dosage?: string;
  takenAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessMedicineLogSchema = new Schema<IWellnessMedicineLog>(
  {
    userId: { type: String, required: true, index: true },
    reminderId: { type: Schema.Types.ObjectId, ref: "WellnessMedicineReminder", index: true },
    name: { type: String, required: true },
    dosage: { type: String },
    takenAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IWellnessUserGoal extends Document {
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
}

const WellnessUserGoalSchema = new Schema<IWellnessUserGoal>(
  {
    userId: { type: String, required: true, index: true },
    goalType: { type: String, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IWellnessAchievement extends Document {
  userId: string;
  achievementType: string;
  title: string;
  description?: string;
  achievedAt: Date;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessAchievementSchema = new Schema<IWellnessAchievement>(
  {
    userId: { type: String, required: true, index: true },
    achievementType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    achievedAt: { type: Date, default: Date.now },
    icon: { type: String },
  },
  { timestamps: true }
);

export const WellnessMoodLog =
  mongoose.models.WellnessMoodLog || mongoose.model<IWellnessMoodLog>("WellnessMoodLog", WellnessMoodLogSchema);
export const WellnessSleepRecord =
  mongoose.models.WellnessSleepRecord || mongoose.model<IWellnessSleepRecord>("WellnessSleepRecord", WellnessSleepRecordSchema);
export const WellnessUserPreference =
  mongoose.models.WellnessUserPreference || mongoose.model<IWellnessUserPreference>("WellnessUserPreference", WellnessUserPreferenceSchema);
export const WellnessHydrationEntry =
  mongoose.models.WellnessHydrationEntry || mongoose.model<IWellnessHydrationEntry>("WellnessHydrationEntry", WellnessHydrationEntrySchema);
export const WellnessConfidenceCheckin =
  mongoose.models.WellnessConfidenceCheckin || mongoose.model<IWellnessConfidenceCheckin>("WellnessConfidenceCheckin", WellnessConfidenceCheckinSchema);
export const WellnessHabitEnrichment =
  mongoose.models.WellnessHabitEnrichment || mongoose.model<IWellnessHabitEnrichment>("WellnessHabitEnrichment", WellnessHabitEnrichmentSchema);
export const WellnessWeightEntry =
  mongoose.models.WellnessWeightEntry || mongoose.model<IWellnessWeightEntry>("WellnessWeightEntry", WellnessWeightEntrySchema);
export const WellnessWorkoutEntry =
  mongoose.models.WellnessWorkoutEntry || mongoose.model<IWellnessWorkoutEntry>("WellnessWorkoutEntry", WellnessWorkoutEntrySchema);
export const WellnessStepEntry =
  mongoose.models.WellnessStepEntry || mongoose.model<IWellnessStepEntry>("WellnessStepEntry", WellnessStepEntrySchema);
export const WellnessCalorieEntry =
  mongoose.models.WellnessCalorieEntry || mongoose.model<IWellnessCalorieEntry>("WellnessCalorieEntry", WellnessCalorieEntrySchema);
export const WellnessBloodPressureEntry =
  mongoose.models.WellnessBloodPressureEntry || mongoose.model<IWellnessBloodPressureEntry>("WellnessBloodPressureEntry", WellnessBloodPressureEntrySchema);
export const WellnessHeartRateEntry =
  mongoose.models.WellnessHeartRateEntry || mongoose.model<IWellnessHeartRateEntry>("WellnessHeartRateEntry", WellnessHeartRateEntrySchema);
export const WellnessMedicineReminder =
  mongoose.models.WellnessMedicineReminder || mongoose.model<IWellnessMedicineReminder>("WellnessMedicineReminder", WellnessMedicineReminderSchema);
export const WellnessMedicineLog =
  mongoose.models.WellnessMedicineLog || mongoose.model<IWellnessMedicineLog>("WellnessMedicineLog", WellnessMedicineLogSchema);
export const WellnessUserGoal =
  mongoose.models.WellnessUserGoal || mongoose.model<IWellnessUserGoal>("WellnessUserGoal", WellnessUserGoalSchema);
export const WellnessAchievement =
  mongoose.models.WellnessAchievement || mongoose.model<IWellnessAchievement>("WellnessAchievement", WellnessAchievementSchema);
