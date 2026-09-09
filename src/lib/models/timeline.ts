import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimelineEvent extends Document {
  userId: string;
  title: string;
  description?: string;
  eventDate: Date;
  category: string;
  importance: string;
  recurrence: string;
  color?: string;
  icon?: string;
  isPinned: boolean;
  activityType?: string;
  tags: string[];
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  mood?: number;
  energy?: number;
  location?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    eventDate: { type: Date, required: true, index: true },
    category: { type: String, required: true, default: "personal" },
    importance: { type: String, required: true, default: "medium" },
    recurrence: { type: String, required: true, default: "none" },
    color: { type: String },
    icon: { type: String },
    isPinned: { type: Boolean, default: false },
    activityType: { type: String },
    tags: { type: [String], default: [] },
    startTime: { type: String },
    endTime: { type: String },
    durationMinutes: { type: Number },
    mood: { type: Number },
    energy: { type: Number },
    location: { type: String },
    linkedEntityId: { type: String },
    linkedEntityType: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

TimelineEventSchema.index({ userId: 1, eventDate: 1 });

export const TimelineEvent: Model<ITimelineEvent> =
  mongoose.models.TimelineEvent ||
  mongoose.model<ITimelineEvent>("TimelineEvent", TimelineEventSchema);
