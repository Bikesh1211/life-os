import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INote extends Document {
  userId: string;
  title: string;
  content?: string;
  contentJson?: Record<string, unknown>;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  status: string;
  folderId?: Types.ObjectId;
  reminderDate?: Date;
  color?: string;
  priority: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteTag extends Document {
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteFolder extends Document {
  userId: string;
  name: string;
  parentId?: Types.ObjectId;
  color: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteLink extends Document {
  noteId: Types.ObjectId;
  linkedNoteId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String },
    contentJson: { type: Schema.Types.Mixed },
    excerpt: { type: String },
    coverImage: { type: String },
    category: { type: String, default: "personal", index: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    status: { type: String, default: "published" },
    folderId: { type: Schema.Types.ObjectId, ref: "NoteFolder" },
    reminderDate: { type: Date },
    color: { type: String },
    priority: { type: String, default: "medium" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

NoteSchema.index({ tags: 1 });

const NoteTagSchema = new Schema<INoteTag>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "blue" },
  },
  { timestamps: true }
);

const NoteFolderSchema = new Schema<INoteFolder>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "NoteFolder" },
    color: { type: String, default: "blue" },
    icon: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const NoteLinkSchema = new Schema<INoteLink>(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    linkedNoteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

NoteLinkSchema.index({ noteId: 1, linkedNoteId: 1 }, { unique: true });

export const Note: Model<INote> =
  mongoose.models.Note ||
  mongoose.model<INote>("Note", NoteSchema);

export const NoteTag: Model<INoteTag> =
  mongoose.models.NoteTag ||
  mongoose.model<INoteTag>("NoteTag", NoteTagSchema);

export const NoteFolder: Model<INoteFolder> =
  mongoose.models.NoteFolder ||
  mongoose.model<INoteFolder>("NoteFolder", NoteFolderSchema);

export const NoteLink: Model<INoteLink> =
  mongoose.models.NoteLink ||
  mongoose.model<INoteLink>("NoteLink", NoteLinkSchema);
