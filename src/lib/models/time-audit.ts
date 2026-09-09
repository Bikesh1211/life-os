import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITimeEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  description?: string;
  categoryId?: Types.ObjectId;
  projectId?: string;
  tags?: string[];
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  isBillable: boolean;
  notes?: string;
  timelineEventId?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "TimeCategory", index: true },
    projectId: { type: String },
    tags: { type: [String] },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    isBillable: { type: Boolean, default: false },
    notes: { type: String },
    timelineEventId: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface ITimeCategory extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeCategorySchema = new Schema<ITimeCategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: "clock" },
    color: { type: String, default: "blue" },
    sortOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ITimeActiveTimer extends Document {
  _id: Types.ObjectId;
  userId: string;
  entryId: Types.ObjectId;
  startTime: Date;
  elapsedBeforePause: number;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeActiveTimerSchema = new Schema<ITimeActiveTimer>(
  {
    userId: { type: String, required: true, unique: true },
    entryId: { type: Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    elapsedBeforePause: { type: Number, default: 0 },
    isPaused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ITimeBudget extends Document {
  _id: Types.ObjectId;
  userId: string;
  categoryId: Types.ObjectId;
  period: string;
  targetMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeBudgetSchema = new Schema<ITimeBudget>(
  {
    userId: { type: String, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, required: true, index: true },
    period: { type: String, required: true },
    targetMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export interface ITimeUserPreference extends Document {
  _id: Types.ObjectId;
  userId: string;
  widgetVisibility: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TimeUserPreferenceSchema = new Schema<ITimeUserPreference>(
  {
    userId: { type: String, required: true, unique: true },
    widgetVisibility: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const TimeEntryModel =
  mongoose.models.TimeEntry || mongoose.model<ITimeEntry>("TimeEntry", TimeEntrySchema);
export const TimeCategoryModel =
  mongoose.models.TimeCategory || mongoose.model<ITimeCategory>("TimeCategory", TimeCategorySchema);
export const TimeActiveTimerModel =
  mongoose.models.TimeActiveTimer ||
  mongoose.model<ITimeActiveTimer>("TimeActiveTimer", TimeActiveTimerSchema);
export const TimeBudgetModel =
  mongoose.models.TimeBudget || mongoose.model<ITimeBudget>("TimeBudget", TimeBudgetSchema);
export const TimeUserPreferenceModel =
  mongoose.models.TimeUserPreference ||
  mongoose.model<ITimeUserPreference>("TimeUserPreference", TimeUserPreferenceSchema);
