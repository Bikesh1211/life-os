import { connectToDatabase } from "@/lib/mongodb";
import {
  ReadingItemModel,
  ReadingAnnotationModel,
  ReadingNoteModel,
  ReadingSessionModel,
} from "@/lib/models/reading";

// ─── Types ────────────────────────────────────────────────────────

export type ReadingItem = {
  id: string;
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
};

export type ReadingAnnotation = {
  id: string;
  userId: string;
  itemId: string;
  content: string;
  page?: number;
  chapter?: string;
  highlightColor?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingNote = {
  id: string;
  userId: string;
  itemId: string;
  title: string;
  content: string;
  chapter?: string;
  page?: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingSession = {
  id: string;
  userId: string;
  itemId: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  pagesRead?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateItemInput = Partial<Omit<ReadingItem, "id" | "createdAt" | "updatedAt">> & { userId: string; title: string; type: string };
export type CreateAnnotationInput = Partial<Omit<ReadingAnnotation, "id" | "createdAt" | "updatedAt">> & { userId: string; itemId: string; content: string };
export type CreateNoteInput = Partial<Omit<ReadingNote, "id" | "createdAt" | "updatedAt">> & { userId: string; itemId: string; title: string; content: string };
export type CreateSessionInput = Partial<Omit<ReadingSession, "id" | "createdAt" | "updatedAt">> & { userId: string; itemId: string; startTime: Date };

// ─── Helpers ──────────────────────────────────────────────────────

function mapItem(doc: any): ReadingItem {
  return { ...doc, id: doc._id.toString() };
}

function mapAnnotation(doc: any): ReadingAnnotation {
  return { ...doc, id: doc._id.toString() };
}

function mapNote(doc: any): ReadingNote {
  return { ...doc, id: doc._id.toString() };
}

function mapSession(doc: any): ReadingSession {
  return { ...doc, id: doc._id.toString() };
}

// ─── Items ────────────────────────────────────────────────────────

export async function createItem(input: CreateItemInput): Promise<ReadingItem> {
  await connectToDatabase();
  const doc = await ReadingItemModel.create(input);
  return mapItem(doc.toObject());
}

export async function getItemsForUser(
  userId: string,
  opts: {
    type?: string;
    status?: string;
    tags?: string[];
    search?: string;
    favorites?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "createdAt" | "title" | "updatedAt" | "lastOpenedAt" | "rating";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  } = {},
): Promise<ReadingItem[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId, deletedAt: null };
  if (opts.type) filter.type = opts.type;
  if (opts.status) filter.status = opts.status;
  if (opts.favorites) filter.isFavorited = true;
  if (opts.tags && opts.tags.length > 0) {
    filter.tags = { $in: opts.tags };
  }
  if (opts.search) {
    filter.title = { $regex: opts.search, $options: "i" };
  }
  if (opts.dateFrom || opts.dateTo) {
    filter.createdAt = {};
    if (opts.dateFrom) filter.createdAt.$gte = new Date(opts.dateFrom);
    if (opts.dateTo) filter.createdAt.$lte = new Date(opts.dateTo);
  }

  const sortField = opts.sortBy ?? "createdAt";
  const sortOrder = opts.sortOrder === "asc" ? 1 : -1;

  const docs = await ReadingItemModel.find(filter)
    .sort({ isFavorited: -1, [sortField]: sortOrder })
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 100)
    .lean();

  return docs.map(mapItem);
}

export async function getItemById(id: string, userId: string): Promise<ReadingItem | null> {
  await connectToDatabase();
  const doc = await ReadingItemModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return doc ? mapItem(doc) : null;
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>): Promise<ReadingItem | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await ReadingItemModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapItem(doc) : null;
}

export async function deleteItem(id: string, userId: string): Promise<ReadingItem | null> {
  await connectToDatabase();
  const doc = await ReadingItemModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapItem(doc) : null;
}

export async function getDashboardStats(userId: string) {
  await connectToDatabase();

  const items = await ReadingItemModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        count: { $sum: 1 },
        pages: { $sum: { $ifNull: ["$totalPages", 0] } },
        rating: { $avg: { $ifNull: ["$rating", null] } },
      },
    },
  ]);

  const annotations = await ReadingAnnotationModel.countDocuments({ userId });

  const sessionsResult = await ReadingSessionModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalMinutes: {
          $sum: {
            $cond: [
              { $and: ["$startTime", "$endTime"] },
              {
                $divide: [
                  { $subtract: ["$endTime", "$startTime"] },
                  60000,
                ],
              },
              0,
            ],
          },
        },
        pagesRead: { $sum: { $ifNull: ["$pagesRead", 0] } },
      },
    },
  ]);

  const currentlyReading = await ReadingItemModel.countDocuments({
    userId,
    status: "reading",
    deletedAt: null,
  });

  return {
    items: items.map((r: any) => ({
      type: r._id.type,
      status: r._id.status,
      count: r.count,
      pages: r.pages,
      rating: r.rating,
    })),
    annotations,
    sessions: sessionsResult[0] ?? { totalMinutes: 0, pagesRead: 0 },
    currentlyReading,
  };
}

// ─── Annotations ──────────────────────────────────────────────────

export async function createAnnotation(input: CreateAnnotationInput): Promise<ReadingAnnotation> {
  await connectToDatabase();
  const doc = await ReadingAnnotationModel.create(input);
  return mapAnnotation(doc.toObject());
}

export async function getAnnotationsForUser(
  userId: string,
  opts: { readingItemId?: string; type?: string; isFavorited?: boolean; search?: string } = {},
): Promise<ReadingAnnotation[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId };
  if (opts.readingItemId) filter.itemId = opts.readingItemId;
  if (opts.type) filter.type = opts.type;
  if (opts.isFavorited) filter.isFavorite = true;
  if (opts.search) {
    filter.content = { $regex: opts.search, $options: "i" };
  }

  const docs = await ReadingAnnotationModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapAnnotation);
}

export async function updateAnnotation(id: string, userId: string, input: Partial<CreateAnnotationInput>): Promise<ReadingAnnotation | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await ReadingAnnotationModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapAnnotation(doc) : null;
}

export async function deleteAnnotation(id: string, userId: string): Promise<ReadingAnnotation | null> {
  await connectToDatabase();
  const doc = await ReadingAnnotationModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapAnnotation(doc) : null;
}

// ─── Notes ────────────────────────────────────────────────────────

export async function createNote(input: CreateNoteInput): Promise<ReadingNote> {
  await connectToDatabase();
  const doc = await ReadingNoteModel.create(input);
  return mapNote(doc.toObject());
}

export async function getNotesForUser(
  userId: string,
  opts: { readingItemId?: string; search?: string } = {},
): Promise<ReadingNote[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId, deletedAt: null };
  if (opts.readingItemId) filter.itemId = opts.readingItemId;
  if (opts.search) {
    filter.title = { $regex: opts.search, $options: "i" };
  }

  const docs = await ReadingNoteModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapNote);
}

export async function updateNote(id: string, userId: string, input: Partial<CreateNoteInput>): Promise<ReadingNote | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await ReadingNoteModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapNote(doc) : null;
}

export async function deleteNote(id: string, userId: string): Promise<ReadingNote | null> {
  await connectToDatabase();
  const doc = await ReadingNoteModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapNote(doc) : null;
}

// ─── Sessions ─────────────────────────────────────────────────────

export async function createSession(input: CreateSessionInput): Promise<ReadingSession> {
  await connectToDatabase();
  const doc = await ReadingSessionModel.create(input);
  return mapSession(doc.toObject());
}

export async function getSessionsForUser(
  userId: string,
  opts: { readingItemId?: string; dateFrom?: string; dateTo?: string } = {},
): Promise<ReadingSession[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId };
  if (opts.readingItemId) filter.itemId = opts.readingItemId;
  if (opts.dateFrom || opts.dateTo) {
    filter.startTime = {};
    if (opts.dateFrom) filter.startTime.$gte = new Date(opts.dateFrom);
    if (opts.dateTo) filter.startTime.$lte = new Date(opts.dateTo);
  }

  const docs = await ReadingSessionModel.find(filter)
    .sort({ startTime: -1 })
    .lean();
  return docs.map(mapSession);
}

export async function updateSession(id: string, userId: string, input: Partial<CreateSessionInput>): Promise<ReadingSession | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await ReadingSessionModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true },
  ).lean();
  return doc ? mapSession(doc) : null;
}

export async function deleteSession(id: string, userId: string): Promise<ReadingSession | null> {
  await connectToDatabase();
  const doc = await ReadingSessionModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapSession(doc) : null;
}
