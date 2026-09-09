import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IHabit extends Document {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  frequency: string;
  frequencyType: string;
  frequencyInterval?: number;
  frequencyWeekdays?: number[];
  frequencyMonthDay?: number;
  timesPerDay: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitCompletion extends Document {
  habitId: Types.ObjectId;
  userId: string;
  completedDate: Date;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitAnalytics extends Document {
  habitId: Types.ObjectId;
  userId: string;
  date: string;
  totalCompletions: number;
  streakDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    frequency: { type: String, default: "daily" },
    frequencyType: { type: String, default: "daily" },
    frequencyInterval: { type: Number },
    frequencyWeekdays: { type: [Number] },
    frequencyMonthDay: { type: Number },
    timesPerDay: { type: Number, default: 1 },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    completedDate: { type: Date, required: true, index: true },
    note: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const HabitAnalyticsSchema = new Schema<IHabitAnalytics>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: { type: String, required: true },
    date: { type: String, required: true },
    totalCompletions: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HabitAnalyticsSchema.index({ habitId: 1, date: 1 }, { unique: true });

export const Habit: Model<IHabit> =
  mongoose.models.Habit ||
  mongoose.model<IHabit>("Habit", HabitSchema);

export const HabitCompletion: Model<IHabitCompletion> =
  mongoose.models.HabitCompletion ||
  mongoose.model<IHabitCompletion>("HabitCompletion", HabitCompletionSchema);

export const HabitAnalytics: Model<IHabitAnalytics> =
  mongoose.models.HabitAnalytics ||
  mongoose.model<IHabitAnalytics>("HabitAnalytics", HabitAnalyticsSchema);
