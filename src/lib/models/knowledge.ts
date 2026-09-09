import mongoose, { Schema, Document, Types } from "mongoose";

// ─── KnowledgeEntry ──────────────────────────────────────────────────────────

export interface IKnowledgeEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  subject: string;
  subcategory?: string;
  dateLearned: Date;
  summary?: string;
  detailedNotes?: string;
  keyTakeaways?: string;
  examples?: string;
  resources?: string;
  targetLevel?: number;
  projects: string[];
  tags: string[];
  difficultyLevel: string;
  learningSource?: string;
  resourceUrl?: string;
  masteryLevel: number;
  confidenceScore: number;
  timeSpent?: number;
  reviewStatus: string;
  lastReviewedAt?: Date;
  nextActions?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeEntrySchema = new Schema<IKnowledgeEntry>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    subcategory: { type: String },
    dateLearned: { type: Date, required: true },
    summary: { type: String },
    detailedNotes: { type: String },
    keyTakeaways: { type: String },
    examples: { type: String },
    resources: { type: String },
    targetLevel: { type: Number },
    projects: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    difficultyLevel: { type: String, default: "beginner" },
    learningSource: { type: String },
    resourceUrl: { type: String },
    masteryLevel: { type: Number, default: 1 },
    confidenceScore: { type: Number, default: 1 },
    timeSpent: { type: Number },
    reviewStatus: { type: String, default: "not_reviewed" },
    lastReviewedAt: { type: Date },
    nextActions: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

KnowledgeEntrySchema.index({ userId: 1, dateLearned: -1 });
KnowledgeEntrySchema.index({ userId: 1, reviewStatus: 1 });
KnowledgeEntrySchema.index({ tags: 1 });

// ─── KnowledgeEntryLink ──────────────────────────────────────────────────────

export interface IKnowledgeEntryLink extends Document {
  _id: Types.ObjectId;
  entryId: Types.ObjectId;
  linkedEntryId: Types.ObjectId;
  relationshipType: string;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeEntryLinkSchema = new Schema<IKnowledgeEntryLink>(
  {
    entryId: { type: Schema.Types.ObjectId, ref: "KnowledgeEntry", required: true, index: true },
    linkedEntryId: { type: Schema.Types.ObjectId, ref: "KnowledgeEntry", required: true, index: true },
    relationshipType: { type: String, default: "related_to" },
  },
  { timestamps: true }
);

KnowledgeEntryLinkSchema.index({ entryId: 1, linkedEntryId: 1 }, { unique: true });

// ─── Exports ─────────────────────────────────────────────────────────────────

export const KnowledgeEntryModel =
  mongoose.models.KnowledgeEntry ||
  mongoose.model<IKnowledgeEntry>("KnowledgeEntry", KnowledgeEntrySchema);

export const KnowledgeEntryLinkModel =
  mongoose.models.KnowledgeEntryLink ||
  mongoose.model<IKnowledgeEntryLink>("KnowledgeEntryLink", KnowledgeEntryLinkSchema);
