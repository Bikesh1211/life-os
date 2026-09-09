import { connectToDatabase } from "@/lib/mongodb";
import {
  JournalEntryModel,
  JournalVersionModel,
  JournalBookmarkModel,
  JournalHighlightModel,
  JournalWritingSessionModel,
} from "@/lib/models/journal";

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  content?: string;
  mood?: string;
  tags: string[];
  reflectionScore?: number;
  isPinned: boolean;
  isPrivate: boolean;
  eventDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateJournalEntryInput = {
  userId: string;
  title: string;
  content?: string;
  mood?: string;
  tags?: string[];
  reflectionScore?: number;
  isPinned?: boolean;
  isPrivate?: boolean;
  eventDate?: Date;
};

export type UpdateJournalEntryInput = Partial<Omit<CreateJournalEntryInput, "userId">>;

export type JournalFilters = {
  search?: string;
  mood?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

function mapEntry(doc: any): JournalEntry {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    content: doc.content,
    mood: doc.mood,
    tags: doc.tags,
    reflectionScore: doc.reflectionScore,
    isPinned: doc.isPinned,
    isPrivate: doc.isPrivate,
    eventDate: doc.eventDate,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const entryColumns = {
  id: "_id",
  userId: "userId",
  title: "title",
  content: "content",
  mood: "mood",
  tags: "tags",
  reflectionScore: "reflectionScore",
  isPinned: "isPinned",
  isPrivate: "isPrivate",
  eventDate: "eventDate",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

export async function createEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
  await connectToDatabase();
  const doc = await JournalEntryModel.create({
    userId: input.userId,
    title: input.title,
    content: input.content,
    mood: input.mood,
    tags: input.tags ?? [],
    reflectionScore: input.reflectionScore,
    isPinned: input.isPinned ?? false,
    isPrivate: input.isPrivate ?? true,
    eventDate: input.eventDate,
  });
  return mapEntry(doc);
}

export async function getEntryById(id: string, userId: string): Promise<JournalEntry | null> {
  await connectToDatabase();
  const doc = await JournalEntryModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapEntry(doc) : null;
}

export async function getEntriesForUser(userId: string, filters: JournalFilters = {}): Promise<JournalEntry[]> {
  await connectToDatabase();
  const conditions: Record<string, any> = {
    userId,
    deletedAt: null,
  };

  if (filters.mood) {
    conditions.mood = filters.mood;
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.tags = { $all: filters.tags };
  }
  if (filters.dateFrom || filters.dateTo) {
    conditions.createdAt = {};
    if (filters.dateFrom) conditions.createdAt.$gte = filters.dateFrom;
    if (filters.dateTo) conditions.createdAt.$lte = filters.dateTo;
  }
  if (filters.minScore !== undefined) {
    conditions.reflectionScore = conditions.reflectionScore || {};
    conditions.reflectionScore.$gte = filters.minScore;
  }
  if (filters.maxScore !== undefined) {
    conditions.reflectionScore = conditions.reflectionScore || {};
    conditions.reflectionScore.$lte = filters.maxScore;
  }
  if (filters.search) {
    conditions.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { content: { $regex: filters.search, $options: "i" } },
    ];
  }

  const sortField = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const docs = await JournalEntryModel.find(conditions)
    .sort({ [sortField]: sortOrder })
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 50)
    .lean();

  return docs.map(mapEntry);
}

export async function updateEntry(
  id: string,
  userId: string,
  input: UpdateJournalEntryInput,
): Promise<JournalEntry | null> {
  await connectToDatabase();
  const doc = await JournalEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapEntry(doc) : null;
}

export async function softDeleteEntry(id: string, userId: string): Promise<JournalEntry | null> {
  await connectToDatabase();
  const doc = await JournalEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapEntry(doc) : null;
}

export async function getEntryCountForUser(userId: string): Promise<number> {
  await connectToDatabase();
  return JournalEntryModel.countDocuments({ userId, deletedAt: null });
}

export async function getRecentEntriesForUser(userId: string, days: number, limit = 10): Promise<JournalEntry[]> {
  await connectToDatabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const docs = await JournalEntryModel.find({
    userId,
    deletedAt: null,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(mapEntry);
}

export async function getMoodDistribution(
  userId: string,
  days: number,
): Promise<{ mood: string | null; count: number }[]> {
  await connectToDatabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await JournalEntryModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$mood",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return results.map((r: any) => ({ mood: r._id, count: r.count }));
}

export async function getJournalCoverage(userId: string): Promise<{ year: number; month: number }[]> {
  await connectToDatabase();

  const results = await JournalEntryModel.aggregate([
    {
      $match: { userId, deletedAt: null },
    },
    {
      $addFields: {
        effectiveDate: { $ifNull: ["$eventDate", "$createdAt"] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$effectiveDate" },
          month: { $month: "$effectiveDate" },
        },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  return results.map((r: any) => ({ year: r._id.year, month: r._id.month }));
}

export async function getCommonTags(
  userId: string,
  limit = 10,
): Promise<{ tag: string; count: number }[]> {
  await connectToDatabase();

  const results = await JournalEntryModel.aggregate([
    {
      $match: { userId, deletedAt: null, tags: { $exists: true, $ne: [] } },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    { $limit: limit },
  ]);

  return results.map((r: any) => ({ tag: r._id, count: r.count }));
}

// ── Journal Versions ──

export type JournalVersion = {
  id: string;
  entryId: string;
  content: string;
  title: string;
  wordCount: number;
  note?: string;
  createdAt: Date;
};

function mapVersion(doc: any): JournalVersion {
  return {
    id: doc._id.toString(),
    entryId: doc.entryId.toString(),
    content: doc.content,
    title: doc.title,
    wordCount: doc.wordCount,
    note: doc.note,
    createdAt: doc.createdAt,
  };
}

export async function createVersion(input: {
  entryId: string;
  content: string;
  title: string;
  wordCount: number;
  note?: string;
}): Promise<JournalVersion> {
  await connectToDatabase();
  const doc = await JournalVersionModel.create(input);
  return mapVersion(doc);
}

export async function getEntryVersions(entryId: string): Promise<JournalVersion[]> {
  await connectToDatabase();
  const docs = await JournalVersionModel.find({ entryId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapVersion);
}

export async function getVersionById(id: string): Promise<JournalVersion | null> {
  await connectToDatabase();
  const doc = await JournalVersionModel.findById(id).lean();
  return doc ? mapVersion(doc) : null;
}

// ── Journal Bookmarks ──

export type JournalBookmark = {
  id: string;
  userId: string;
  entryId: string;
  position: any;
  excerpt?: string;
  label?: string;
  color: string;
  createdAt: Date;
};

function mapBookmark(doc: any): JournalBookmark {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    entryId: doc.entryId.toString(),
    position: doc.position,
    excerpt: doc.excerpt,
    label: doc.label,
    color: doc.color,
    createdAt: doc.createdAt,
  };
}

export async function createBookmark(input: {
  userId: string;
  entryId: string;
  position: unknown;
  excerpt?: string;
  label?: string;
  color?: string;
}): Promise<JournalBookmark> {
  await connectToDatabase();
  const doc = await JournalBookmarkModel.create({
    userId: input.userId,
    entryId: input.entryId,
    position: input.position,
    excerpt: input.excerpt,
    label: input.label,
    color: input.color ?? "yellow",
  });
  return mapBookmark(doc);
}

export async function getEntryBookmarks(userId: string, entryId: string): Promise<JournalBookmark[]> {
  await connectToDatabase();
  const docs = await JournalBookmarkModel.find({ userId, entryId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapBookmark);
}

export async function deleteBookmark(id: string, userId: string): Promise<JournalBookmark | null> {
  await connectToDatabase();
  const doc = await JournalBookmarkModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapBookmark(doc) : null;
}

// ── Journal Highlights ──

export type JournalHighlight = {
  id: string;
  userId: string;
  entryId: string;
  position: any;
  text: string;
  color: string;
  note?: string;
  createdAt: Date;
};

function mapHighlight(doc: any): JournalHighlight {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    entryId: doc.entryId.toString(),
    position: doc.position,
    text: doc.text,
    color: doc.color,
    note: doc.note,
    createdAt: doc.createdAt,
  };
}

export async function createHighlight(input: {
  userId: string;
  entryId: string;
  position: unknown;
  text: string;
  color?: string;
  note?: string;
}): Promise<JournalHighlight> {
  await connectToDatabase();
  const doc = await JournalHighlightModel.create({
    userId: input.userId,
    entryId: input.entryId,
    position: input.position,
    text: input.text,
    color: input.color ?? "yellow",
    note: input.note,
  });
  return mapHighlight(doc);
}

export async function getEntryHighlights(userId: string, entryId: string): Promise<JournalHighlight[]> {
  await connectToDatabase();
  const docs = await JournalHighlightModel.find({ userId, entryId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapHighlight);
}

export async function updateHighlight(
  id: string,
  userId: string,
  input: { color?: string; note?: string },
): Promise<JournalHighlight | null> {
  await connectToDatabase();
  const doc = await JournalHighlightModel.findOneAndUpdate(
    { _id: id, userId },
    input,
    { new: true },
  ).lean();
  return doc ? mapHighlight(doc) : null;
}

export async function deleteHighlight(id: string, userId: string): Promise<JournalHighlight | null> {
  await connectToDatabase();
  const doc = await JournalHighlightModel.findOneAndDelete({ _id: id, userId }).lean();
  return doc ? mapHighlight(doc) : null;
}

// ── Journal Writing Sessions ──

export type JournalWritingSession = {
  id: string;
  userId: string;
  entryId: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  wordsAdded: number;
  createdAt: Date;
};

function mapSession(doc: any): JournalWritingSession {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    entryId: doc.entryId.toString(),
    startedAt: doc.startedAt,
    endedAt: doc.endedAt,
    durationSeconds: doc.durationSeconds,
    wordsAdded: doc.wordsAdded,
    createdAt: doc.createdAt,
  };
}

export async function createWritingSession(input: {
  userId: string;
  entryId: string;
  startedAt: Date;
}): Promise<JournalWritingSession> {
  await connectToDatabase();
  const doc = await JournalWritingSessionModel.create(input);
  return mapSession(doc);
}

export async function endWritingSession(
  id: string,
  userId: string,
  endedAt: Date,
  wordsAdded: number,
): Promise<JournalWritingSession | null> {
  await connectToDatabase();
  const existing = await JournalWritingSessionModel.findOne({
    _id: id,
    userId,
  }).lean();
  if (!existing) return null;

  const durationSeconds = Math.round(
    (endedAt.getTime() - new Date(existing.startedAt).getTime()) / 1000,
  );
  const doc = await JournalWritingSessionModel.findOneAndUpdate(
    { _id: id, userId },
    { endedAt, durationSeconds, wordsAdded },
    { new: true },
  ).lean();
  return doc ? mapSession(doc) : null;
}

export async function getEntrySessions(
  entryId: string,
  userId: string,
): Promise<JournalWritingSession[]> {
  await connectToDatabase();
  const docs = await JournalWritingSessionModel.find({ entryId, userId })
    .sort({ startedAt: -1 })
    .lean();
  return docs.map(mapSession);
}

export async function getSessionStats(userId: string): Promise<{
  today: { totalSessions: number; totalDuration: number; totalWords: number };
  week: { totalSessions: number; totalDuration: number; totalWords: number };
}> {
  await connectToDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [todayStats] = await JournalWritingSessionModel.aggregate([
    {
      $match: {
        userId,
        startedAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: { $ifNull: ["$durationSeconds", 0] } },
        totalWords: { $sum: { $ifNull: ["$wordsAdded", 0] } },
      },
    },
  ]);

  const [weekStats] = await JournalWritingSessionModel.aggregate([
    {
      $match: {
        userId,
        startedAt: { $gte: weekStart },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: { $ifNull: ["$durationSeconds", 0] } },
        totalWords: { $sum: { $ifNull: ["$wordsAdded", 0] } },
      },
    },
  ]);

  return {
    today: todayStats ?? { totalSessions: 0, totalDuration: 0, totalWords: 0 },
    week: weekStats ?? { totalSessions: 0, totalDuration: 0, totalWords: 0 },
  };
}
