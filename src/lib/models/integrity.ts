import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIntegrityCommitment extends Document {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  difficulty: string;
  estimatedTime?: number;
  dueDate?: Date;
  dueTime?: string;
  startDate?: Date;
  tags: string[];
  color?: string;
  icon?: string;
  evidenceRequired: boolean;
  location?: string;
  repeatRule: string;
  reminderMinutesBefore?: number;
  status: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  completedAt?: Date;
  failedAt?: Date;
  missedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrityCommitmentSchema = new Schema<IIntegrityCommitment>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    priority: { type: String },
    difficulty: { type: String, default: "medium" },
    estimatedTime: { type: Number },
    dueDate: { type: Date, index: true },
    dueTime: { type: String },
    startDate: { type: Date },
    tags: { type: [String], default: [] },
    color: { type: String },
    icon: { type: String },
    evidenceRequired: { type: Boolean, default: false },
    location: { type: String },
    repeatRule: { type: String, default: "none" },
    reminderMinutesBefore: { type: Number },
    status: { type: String, default: "pending", index: true },
    linkedEntityType: { type: String },
    linkedEntityId: { type: String },
    completedAt: { type: Date },
    failedAt: { type: Date },
    missedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

IntegrityCommitmentSchema.index({ userId: 1, status: 1 });
IntegrityCommitmentSchema.index({ userId: 1, dueDate: 1 });

export interface IIntegrityCommitmentEvent extends Document {
  commitmentId: Types.ObjectId;
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrityCommitmentEventSchema = new Schema<IIntegrityCommitmentEvent>(
  {
    commitmentId: { type: Schema.Types.ObjectId, ref: "IntegrityCommitment", required: true, index: true },
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

IntegrityCommitmentEventSchema.index({ userId: 1, timestamp: 1 });

export interface IIntegrityDailyCheckin extends Document {
  userId: string;
  date: Date;
  blockers?: string;
  improvementNotes?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrityDailyCheckinSchema = new Schema<IIntegrityDailyCheckin>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    blockers: { type: String },
    improvementNotes: { type: String },
    summary: { type: String },
  },
  { timestamps: true }
);

IntegrityDailyCheckinSchema.index({ userId: 1, date: 1 }, { unique: true });

export interface IIntegrityDailySnapshot extends Document {
  userId: string;
  date: Date;
  score: number;
  streak: number;
  level?: string;
  subScores: Record<string, unknown>;
  commitmentRate: number;
  allCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrityDailySnapshotSchema = new Schema<IIntegrityDailySnapshot>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true },
    streak: { type: Number, default: 0 },
    level: { type: String },
    subScores: { type: Schema.Types.Mixed, default: {} },
    commitmentRate: { type: Number, default: 0 },
    allCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

IntegrityDailySnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

export const IntegrityCommitment =
  mongoose.models.IntegrityCommitment || mongoose.model<IIntegrityCommitment>("IntegrityCommitment", IntegrityCommitmentSchema);
export const IntegrityCommitmentEvent =
  mongoose.models.IntegrityCommitmentEvent || mongoose.model<IIntegrityCommitmentEvent>("IntegrityCommitmentEvent", IntegrityCommitmentEventSchema);
export const IntegrityDailyCheckin =
  mongoose.models.IntegrityDailyCheckin || mongoose.model<IIntegrityDailyCheckin>("IntegrityDailyCheckin", IntegrityDailyCheckinSchema);
export const IntegrityDailySnapshot =
  mongoose.models.IntegrityDailySnapshot || mongoose.model<IIntegrityDailySnapshot>("IntegrityDailySnapshot", IntegrityDailySnapshotSchema);
