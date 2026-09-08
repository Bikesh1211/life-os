import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBook extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  subtitle?: string;
  description?: string;
  authorByline?: string;
  coAuthors: string[];
  language?: string;
  isbn?: string;
  genre?: string;
  tags: string[];
  keywords: string[];
  coverUrl?: string;
  bannerImageUrl?: string;
  copyright?: string;
  license?: string;
  publisher?: string;
  edition?: string;
  series?: string;
  readingLevel?: string;
  ageRating?: string;
  status: string;
  isListed: boolean;
  publishAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    authorByline: { type: String },
    coAuthors: { type: [String], default: [] },
    language: { type: String },
    isbn: { type: String },
    genre: { type: String },
    tags: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    coverUrl: { type: String },
    bannerImageUrl: { type: String },
    copyright: { type: String },
    license: { type: String },
    publisher: { type: String },
    edition: { type: String },
    series: { type: String },
    readingLevel: { type: String },
    ageRating: { type: String },
    status: { type: String, default: "draft", index: true },
    isListed: { type: Boolean, default: false },
    publishAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IBookPart extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookPartSchema = new Schema<IBookPart>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export interface IBookChapter extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  partId?: Types.ObjectId;
  title: string;
  content: Record<string, any>;
  order: number;
  wordCount: number;
  aiMeta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BookChapterSchema = new Schema<IBookChapter>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    partId: { type: Schema.Types.ObjectId, ref: "BookPart" },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, required: true },
    wordCount: { type: Number, default: 0 },
    aiMeta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IBookVersion extends Document {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  content: Record<string, any>;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookVersionSchema = new Schema<IBookVersion>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter", required: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IBookCollaborator extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: string;
  role: string;
  invitedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookCollaboratorSchema = new Schema<IBookCollaborator>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    userId: { type: String, required: true },
    role: { type: String, default: "viewer" },
    invitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BookCollaboratorSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export interface IBookComment extends Document {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  userId: string;
  text: string;
  position?: Record<string, any>;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookCommentSchema = new Schema<IBookComment>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter", required: true, index: true },
    userId: { type: String, required: true },
    text: { type: String, required: true },
    position: { type: Schema.Types.Mixed },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IBookReadingProgress extends Document {
  _id: Types.ObjectId;
  userId: string;
  bookId: Types.ObjectId;
  currentChapterId?: Types.ObjectId;
  scrollPosition: number;
  percentageComplete: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookReadingProgressSchema = new Schema<IBookReadingProgress>(
  {
    userId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    currentChapterId: { type: Schema.Types.ObjectId, ref: "BookChapter" },
    scrollPosition: { type: Number, default: 0 },
    percentageComplete: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BookReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export interface IBookBookmark extends Document {
  _id: Types.ObjectId;
  userId: string;
  bookId: Types.ObjectId;
  chapterId?: Types.ObjectId;
  position?: Record<string, any>;
  excerpt?: string;
  label?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookBookmarkSchema = new Schema<IBookBookmark>(
  {
    userId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter" },
    position: { type: Schema.Types.Mixed },
    excerpt: { type: String },
    label: { type: String },
    color: { type: String, default: "blue" },
  },
  { timestamps: true }
);

export interface IBookHighlight extends Document {
  _id: Types.ObjectId;
  userId: string;
  chapterId: Types.ObjectId;
  position?: Record<string, any>;
  text: string;
  color: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookHighlightSchema = new Schema<IBookHighlight>(
  {
    userId: { type: String, required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter", required: true, index: true },
    position: { type: Schema.Types.Mixed },
    text: { type: String, required: true },
    color: { type: String, default: "yellow" },
    note: { type: String },
  },
  { timestamps: true }
);

export interface IBookCharacter extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  traits: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookCharacterSchema = new Schema<IBookCharacter>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    traits: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IBookResearchNote extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  title: string;
  content?: string;
  source?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BookResearchNoteSchema = new Schema<IBookResearchNote>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String },
    source: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface IBookChapterCharacter extends Document {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  characterId: Types.ObjectId;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookChapterCharacterSchema = new Schema<IBookChapterCharacter>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter", required: true, index: true },
    characterId: { type: Schema.Types.ObjectId, ref: "BookCharacter", required: true, index: true },
    role: { type: String },
  },
  { timestamps: true }
);

export interface IBookChapterResearchNote extends Document {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  researchNoteId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookChapterResearchNoteSchema = new Schema<IBookChapterResearchNote>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter", required: true, index: true },
    researchNoteId: { type: Schema.Types.ObjectId, ref: "BookResearchNote", required: true, index: true },
  },
  { timestamps: true }
);

export interface IBookWritingSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  bookId: Types.ObjectId;
  chapterId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationSeconds?: number;
  wordsAdded: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookWritingSessionSchema = new Schema<IBookWritingSession>(
  {
    userId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "BookChapter" },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationSeconds: { type: Number },
    wordsAdded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BookModel =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
export const BookPartModel =
  mongoose.models.BookPart || mongoose.model<IBookPart>("BookPart", BookPartSchema);
export const BookChapterModel =
  mongoose.models.BookChapter || mongoose.model<IBookChapter>("BookChapter", BookChapterSchema);
export const BookVersionModel =
  mongoose.models.BookVersion || mongoose.model<IBookVersion>("BookVersion", BookVersionSchema);
export const BookCollaboratorModel =
  mongoose.models.BookCollaborator || mongoose.model<IBookCollaborator>("BookCollaborator", BookCollaboratorSchema);
export const BookCommentModel =
  mongoose.models.BookComment || mongoose.model<IBookComment>("BookComment", BookCommentSchema);
export const BookReadingProgressModel =
  mongoose.models.BookReadingProgress || mongoose.model<IBookReadingProgress>("BookReadingProgress", BookReadingProgressSchema);
export const BookBookmarkModel =
  mongoose.models.BookBookmark || mongoose.model<IBookBookmark>("BookBookmark", BookBookmarkSchema);
export const BookHighlightModel =
  mongoose.models.BookHighlight || mongoose.model<IBookHighlight>("BookHighlight", BookHighlightSchema);
export const BookCharacterModel =
  mongoose.models.BookCharacter || mongoose.model<IBookCharacter>("BookCharacter", BookCharacterSchema);
export const BookResearchNoteModel =
  mongoose.models.BookResearchNote || mongoose.model<IBookResearchNote>("BookResearchNote", BookResearchNoteSchema);
export const BookChapterCharacterModel =
  mongoose.models.BookChapterCharacter || mongoose.model<IBookChapterCharacter>("BookChapterCharacter", BookChapterCharacterSchema);
export const BookChapterResearchNoteModel =
  mongoose.models.BookChapterResearchNote || mongoose.model<IBookChapterResearchNote>("BookChapterResearchNote", BookChapterResearchNoteSchema);
export const BookWritingSessionModel =
  mongoose.models.BookWritingSession || mongoose.model<IBookWritingSession>("BookWritingSession", BookWritingSessionSchema);
