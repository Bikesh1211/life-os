import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICountdownEvent extends Document {
  userId: string;
  title: string;
  description?: string;
  category: string;
  eventDate: Date;
  eventTime?: string;
  timezone?: string;
  location?: string;
  organizer?: string;
  coverImage?: string;
  bannerImage?: string;
  color?: string;
  icon?: string;
  notes?: string;
  isFavorited: boolean;
  isArchived: boolean;
  recurrence: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const CountdownEventSchema = new Schema<ICountdownEvent>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, default: "personal" },
    eventDate: { type: Date, required: true, index: true },
    eventTime: { type: String },
    timezone: { type: String },
    location: { type: String },
    organizer: { type: String },
    coverImage: { type: String },
    bannerImage: { type: String },
    color: { type: String },
    icon: { type: String },
    notes: { type: String },
    isFavorited: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    recurrence: { type: String, default: "none" },
    status: { type: String, default: "pending", index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface ICountdownChecklistItem extends Document {
  eventId: Types.ObjectId;
  text: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CountdownChecklistItemSchema = new Schema<ICountdownChecklistItem>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "CountdownEvent", required: true, index: true },
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface ICountdownReminder extends Document {
  eventId: Types.ObjectId;
  reminderAt: Date;
  offset: string;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountdownReminderSchema = new Schema<ICountdownReminder>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "CountdownEvent", required: true, index: true },
    reminderAt: { type: Date, required: true },
    offset: { type: String, required: true },
    isSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ICountdownMemory extends Document {
  eventId: Types.ObjectId;
  photos: string[];
  reflection?: string;
  rating?: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountdownMemorySchema = new Schema<ICountdownMemory>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "CountdownEvent", required: true, index: true },
    photos: { type: [String], default: [] },
    reflection: { type: String },
    rating: { type: Number },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CountdownEvent =
  mongoose.models.CountdownEvent || mongoose.model<ICountdownEvent>("CountdownEvent", CountdownEventSchema);
export const CountdownChecklistItem =
  mongoose.models.CountdownChecklistItem || mongoose.model<ICountdownChecklistItem>("CountdownChecklistItem", CountdownChecklistItemSchema);
export const CountdownReminder =
  mongoose.models.CountdownReminder || mongoose.model<ICountdownReminder>("CountdownReminder", CountdownReminderSchema);
export const CountdownMemory =
  mongoose.models.CountdownMemory || mongoose.model<ICountdownMemory>("CountdownMemory", CountdownMemorySchema);
