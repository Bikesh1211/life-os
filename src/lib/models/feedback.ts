import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedbackEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  category: string;
  message: string;
  isAnonymous: boolean;
  pageUrl?: string;
  userAgent?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackEntrySchema = new Schema<IFeedbackEntry>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    message: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    pageUrl: { type: String },
    userAgent: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export const FeedbackEntryModel =
  mongoose.models.FeedbackEntry || mongoose.model<IFeedbackEntry>("FeedbackEntry", FeedbackEntrySchema);
