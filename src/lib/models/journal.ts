import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJournalEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  content?: string;
  mood?: string;
  tags: string[];
  reflectionScore?: number;
  isPinned: boolean;
  isPrivate: boolean;
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String },
    mood: { type: String, enum: ["happy", "sad", "neutral", "anxious", "stressed", "motivated", "excited"] },
    tags: { type: [String], default: [] },
    reflectionScore: { type: Number, min: 1, max: 10 },
    isPinned: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: true },
    eventDate: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

JournalEntrySchema.index({ userId: 1, deletedAt: 1 });
JournalEntrySchema.index({ userId: 1, mood: 1 });
JournalEntrySchema.index({ userId: 1, eventDate: -1 });
JournalEntrySchema.index({ tags: 1 });

export interface IJournalInsight extends Document {
  _id: Types.ObjectId;
  userId: string;
  journalEntryId: Types.ObjectId;
  summary?: string;
  sentimentScore?: number;
  keywords: string[];
  aiReflection?: string;
  createdAt: Date;
}

const JournalInsightSchema = new Schema<IJournalInsight>(
  {
    userId: { type: String, required: true, index: true },
    journalEntryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    summary: { type: String },
    sentimentScore: { type: Number },
    keywords: { type: [String], default: [] },
    aiReflection: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export interface IJournalVersion extends Document {
  _id: Types.ObjectId;
  entryId: Types.ObjectId;
  content: string;
  title: string;
  wordCount: number;
  note?: string;
  createdAt: Date;
}

const JournalVersionSchema = new Schema<IJournalVersion>(
  {
    entryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    content: { type: String, required: true },
    title: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export interface IJournalBookmark extends Document {
  _id: Types.ObjectId;
  userId: string;
  entryId: Types.ObjectId;
  position: any;
  excerpt?: string;
  label?: string;
  color: string;
  createdAt: Date;
}

const JournalBookmarkSchema = new Schema<IJournalBookmark>(
  {
    userId: { type: String, required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    position: { type: Schema.Types.Mixed, required: true },
    excerpt: { type: String },
    label: { type: String },
    color: { type: String, default: "yellow" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export interface IJournalHighlight extends Document {
  _id: Types.ObjectId;
  userId: string;
  entryId: Types.ObjectId;
  position: any;
  text: string;
  color: string;
  note?: string;
  createdAt: Date;
}

const JournalHighlightSchema = new Schema<IJournalHighlight>(
  {
    userId: { type: String, required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    position: { type: Schema.Types.Mixed, required: true },
    text: { type: String, required: true },
    color: { type: String, default: "yellow" },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export interface IJournalWritingSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  entryId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  wordsAdded: number;
  createdAt: Date;
}

const JournalWritingSessionSchema = new Schema<IJournalWritingSession>(
  {
    userId: { type: String, required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    wordsAdded: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const JournalEntryModel =
  mongoose.models.JournalEntry || mongoose.model<IJournalEntry>("JournalEntry", JournalEntrySchema);
export const JournalInsightModel =
  mongoose.models.JournalInsight || mongoose.model<IJournalInsight>("JournalInsight", JournalInsightSchema);
export const JournalVersionModel =
  mongoose.models.JournalVersion || mongoose.model<IJournalVersion>("JournalVersion", JournalVersionSchema);
export const JournalBookmarkModel =
  mongoose.models.JournalBookmark || mongoose.model<IJournalBookmark>("JournalBookmark", JournalBookmarkSchema);
export const JournalHighlightModel =
  mongoose.models.JournalHighlight || mongoose.model<IJournalHighlight>("JournalHighlight", JournalHighlightSchema);
export const JournalWritingSessionModel =
  mongoose.models.JournalWritingSession ||
  mongoose.model<IJournalWritingSession>("JournalWritingSession", JournalWritingSessionSchema);
