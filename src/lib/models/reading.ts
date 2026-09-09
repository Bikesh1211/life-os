import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReadingItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  author?: string;
  type: string;
  status: string;
  currentPage?: number;
  totalPages?: number;
  startDate?: Date;
  endDate?: Date;
  rating?: number;
  review?: string;
  coverUrl?: string;
  url?: string;
  isbn?: string;
  tags: string[];
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingItemSchema = new Schema<IReadingItem>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    author: { type: String },
    type: { type: String, required: true },
    status: { type: String, default: "to_read", index: true },
    currentPage: { type: Number },
    totalPages: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    rating: { type: Number },
    review: { type: String },
    coverUrl: { type: String },
    url: { type: String },
    isbn: { type: String },
    tags: { type: [String], default: [] },
    notes: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IReadingAnnotation extends Document {
  _id: Types.ObjectId;
  userId: string;
  itemId: Types.ObjectId;
  content: string;
  page?: number;
  chapter?: string;
  highlightColor?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingAnnotationSchema = new Schema<IReadingAnnotation>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ReadingItem", required: true, index: true },
    content: { type: String, required: true },
    page: { type: Number },
    chapter: { type: String },
    highlightColor: { type: String },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IReadingNote extends Document {
  _id: Types.ObjectId;
  userId: string;
  itemId: Types.ObjectId;
  title: string;
  content: string;
  chapter?: string;
  page?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingNoteSchema = new Schema<IReadingNote>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ReadingItem", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    chapter: { type: String },
    page: { type: Number },
  },
  { timestamps: true }
);

export interface IReadingSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  itemId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  pagesRead?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingSessionSchema = new Schema<IReadingSession>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ReadingItem", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    pagesRead: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ReadingItemModel =
  mongoose.models.ReadingItem || mongoose.model<IReadingItem>("ReadingItem", ReadingItemSchema);
export const ReadingAnnotationModel =
  mongoose.models.ReadingAnnotation ||
  mongoose.model<IReadingAnnotation>("ReadingAnnotation", ReadingAnnotationSchema);
export const ReadingNoteModel =
  mongoose.models.ReadingNote || mongoose.model<IReadingNote>("ReadingNote", ReadingNoteSchema);
export const ReadingSessionModel =
  mongoose.models.ReadingSession || mongoose.model<IReadingSession>("ReadingSession", ReadingSessionSchema);
