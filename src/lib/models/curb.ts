import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICurbCategory extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CurbCategorySchema = new Schema<ICurbCategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface ICurbHabit extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  icon?: string;
  categoryId: Types.ObjectId;
  limitType: string;
  limitValue: number;
  color?: string;
  sortOrder: number;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CurbHabitSchema = new Schema<ICurbHabit>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "CurbCategory", required: true, index: true },
    limitType: { type: String, default: "daily" },
    limitValue: { type: Number, default: 0 },
    color: { type: String },
    sortOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface ICurbLog extends Document {
  _id: Types.ObjectId;
  userId: string;
  habitId: Types.ObjectId;
  loggedAt: Date;
  trigger?: string;
  mood?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CurbLogSchema = new Schema<ICurbLog>(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: "CurbHabit", required: true, index: true },
    loggedAt: { type: Date, default: Date.now },
    trigger: { type: String },
    mood: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

CurbLogSchema.index({ habitId: 1, loggedAt: -1 });

export const CurbCategoryModel =
  mongoose.models.CurbCategory || mongoose.model<ICurbCategory>("CurbCategory", CurbCategorySchema);
export const CurbHabitModel =
  mongoose.models.CurbHabit || mongoose.model<ICurbHabit>("CurbHabit", CurbHabitSchema);
export const CurbLogModel =
  mongoose.models.CurbLog || mongoose.model<ICurbLog>("CurbLog", CurbLogSchema);
