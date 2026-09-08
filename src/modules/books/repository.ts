import { connectToDatabase } from "@/lib/mongodb";
import {
  BookModel,
  BookPartModel,
  BookChapterModel,
  BookVersionModel,
  BookCollaboratorModel,
  BookCommentModel,
  BookReadingProgressModel,
  BookBookmarkModel,
  BookHighlightModel,
  BookCharacterModel,
  BookResearchNoteModel,
  BookChapterCharacterModel,
  BookChapterResearchNoteModel,
  BookWritingSessionModel,
} from "@/lib/models/books";

export type Book = any;
export type BookPart = any;
export type BookChapter = any;
export type BookVersion = any;
export type BookCollaborator = any;
export type BookComment = any;
export type BookReadingProgress = any;
export type BookBookmark = any;
export type BookHighlight = any;

export type CreateBookInput = any;
export type CreatePartInput = any;
export type CreateChapterInput = any;
export type CreateVersionInput = any;
export type CreateCollaboratorInput = any;
export type CreateCommentInput = any;
export type CreateProgressInput = any;
export type CreateBookmarkInput = any;
export type CreateHighlightInput = any;
export type CreateCharacterInput = any;
export type CreateResearchNoteInput = any;
export type CreateChapterCharacterInput = any;
export type CreateChapterResearchNoteInput = any;
export type CreateWritingSessionInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createBook(input: CreateBookInput) {
  await connectToDatabase();
  const doc = await BookModel.create(input);
  return toPlain(doc);
}

export async function getBooksForUser(
  userId: string,
  opts: {
    status?: string;
    search?: string;
    tags?: string[];
    sortBy?: "createdAt" | "title" | "updatedAt" | "wordCount";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
    includeTrashed?: boolean;
  } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  filter.deletedAt = opts.includeTrashed ? { $ne: null } : null;

  if (opts.status) filter.status = opts.status;
  if (opts.search) {
    filter.$or = [
      { title: { $regex: opts.search, $options: "i" } },
      { description: { $regex: opts.search, $options: "i" } },
    ];
  }
  if (opts.tags && opts.tags.length > 0) {
    filter.tags = { $in: opts.tags };
  }

  const sortField = opts.sortBy ?? "createdAt";
  const sortDir = opts.sortOrder === "asc" ? 1 : -1;

  const docs = await BookModel.find(filter)
    .sort({ [sortField]: sortDir })
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 100)
    .lean();
  return toPlainArray(docs);
}

export async function getBookById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await BookModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function getPublishedBookById(id: string) {
  await connectToDatabase();
  const doc = await BookModel.findOne({ _id: id, status: "published", deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateBook(id: string, userId: string, input: Partial<CreateBookInput>) {
  await connectToDatabase();
  const doc = await BookModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function updateBookById(id: string, input: Partial<CreateBookInput>) {
  await connectToDatabase();
  const doc = await BookModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteBook(id: string, userId: string) {
  await connectToDatabase();
  const doc = await BookModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getBookDashboardStats(userId: string) {
  await connectToDatabase();
  const items = await BookModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalWords: { $sum: { $ifNull: ["$wordCount", 0] } },
        goalWords: { $sum: { $ifNull: ["$targetWordCount", 0] } },
        booksWithGoals: {
          $sum: { $cond: [{ $ne: ["$targetWordCount", null] }, 1, 0] },
        },
      },
    },
  ]);

  const totalBooks = items.reduce((s: number, i: any) => s + Number(i.count), 0);
  const draftBooks = items.find((i: any) => i._id === "draft");
  const publishedBooks = items.find((i: any) => i._id === "published");
  const archivedBooks = items.find((i: any) => i._id === "archived");
  const totalWords = items.reduce((s: number, i: any) => s + Number(i.totalWords), 0);
  const totalGoalWords = items.reduce((s: number, i: any) => s + Number(i.goalWords), 0);
  const totalBooksWithGoals = items.reduce((s: number, i: any) => s + Number(i.booksWithGoals), 0);

  const totalChapters = await BookChapterModel.aggregate([
    { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $match: { "book.userId": userId, "book.deletedAt": null } },
    { $count: "count" },
  ]).then((r: any[]) => Number(r[0]?.count ?? 0));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [wordsToday] = await BookWritingSessionModel.aggregate([
    { $match: { userId, startedAt: { $gte: today } } },
    { $group: { _id: null, words: { $sum: { $ifNull: ["$wordsAdded", 0] } } } },
  ]);

  return {
    totalBooks: Number(totalBooks),
    draftBooks: Number(draftBooks?.count ?? 0),
    publishedBooks: Number(publishedBooks?.count ?? 0),
    archivedBooks: Number(archivedBooks?.count ?? 0),
    totalWords: Number(totalWords),
    totalChapters,
    totalGoalWords: Number(totalGoalWords),
    booksWithGoals: Number(totalBooksWithGoals),
    wordsToday: Number(wordsToday?.words ?? 0),
  };
}

export async function createPart(input: CreatePartInput) {
  await connectToDatabase();
  const doc = await BookPartModel.create(input);
  return toPlain(doc);
}

export async function getPartsForBook(bookId: string) {
  await connectToDatabase();
  const docs = await BookPartModel.find({ bookId }).sort({ order: 1 }).lean();
  return toPlainArray(docs);
}

export async function updatePart(id: string, input: Partial<CreatePartInput>) {
  await connectToDatabase();
  const doc = await BookPartModel.findOneAndUpdate({ _id: id }, input, { new: true }).lean();
  return toPlain(doc);
}

export async function deletePart(id: string) {
  await connectToDatabase();
  const doc = await BookPartModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

export async function createChapter(input: CreateChapterInput) {
  await connectToDatabase();
  const doc = await BookChapterModel.create(input);
  return toPlain(doc);
}

export async function getChaptersForBook(bookId: string) {
  await connectToDatabase();
  const docs = await BookChapterModel.find({ bookId }).sort({ order: 1 }).lean();
  return toPlainArray(docs);
}

export async function getChapterById(id: string, userId: string) {
  await connectToDatabase();
  const chapter = await BookChapterModel.findOne({ _id: id }).lean();
  if (!chapter) return null;
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return null;
  return toPlain(chapter);
}

export async function updateChapter(id: string, userId: string, input: Partial<CreateChapterInput>) {
  await connectToDatabase();
  const chapter = await BookChapterModel.findOne({ _id: id }).lean();
  if (!chapter) return null;
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return null;

  const doc = await BookChapterModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteChapter(id: string, userId: string) {
  await connectToDatabase();
  const chapter = await BookChapterModel.findOne({ _id: id }).lean();
  if (!chapter) return null;
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return null;

  const doc = await BookChapterModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

export async function reorderChapters(
  items: { id: string; order: number; partId?: string | null }[],
) {
  await connectToDatabase();
  for (const item of items) {
    await BookChapterModel.findOneAndUpdate(
      { _id: item.id },
      { order: item.order, partId: item.partId ?? null },
    );
  }
}

export async function getBookWordCount(bookId: string) {
  await connectToDatabase();
  const [result] = await BookChapterModel.aggregate([
    { $match: { bookId } },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ["$wordCount", 0] } },
        count: { $sum: 1 },
      },
    },
  ]);
  return { totalWords: Number(result?.total ?? 0), chapterCount: Number(result?.count ?? 0) };
}

export async function createVersion(input: CreateVersionInput) {
  await connectToDatabase();
  const doc = await BookVersionModel.create(input);
  return toPlain(doc);
}

export async function getVersionsForChapter(chapterId: string, userId: string) {
  await connectToDatabase();
  const chapter = await BookChapterModel.findOne({ _id: chapterId }).lean();
  if (!chapter) return [];
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return [];

  const docs = await BookVersionModel.find({ chapterId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getVersionById(id: string, userId: string) {
  await connectToDatabase();
  const version = await BookVersionModel.findOne({ _id: id }).lean();
  if (!version) return null;
  const chapter = await BookChapterModel.findOne({ _id: version.chapterId }).lean();
  if (!chapter) return null;
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return null;
  return toPlain(version);
}

export async function createCollaborator(input: CreateCollaboratorInput) {
  await connectToDatabase();
  const doc = await BookCollaboratorModel.create(input);
  return toPlain(doc);
}

export async function getCollaboratorsForBook(bookId: string) {
  await connectToDatabase();
  const docs = await BookCollaboratorModel.find({ bookId }).sort({ createdAt: 1 }).lean();
  return toPlainArray(docs);
}

export async function getCollaborator(bookId: string, userId: string) {
  await connectToDatabase();
  const doc = await BookCollaboratorModel.findOne({ bookId, userId }).lean();
  return toPlain(doc);
}

export async function getUserCollaboratorRole(bookId: string, userId: string) {
  await connectToDatabase();
  const doc = await BookCollaboratorModel.findOne({ bookId, userId }).lean();
  return doc?.role ?? null;
}

export async function updateCollaborator(id: string, userId: string, input: Partial<CreateCollaboratorInput>) {
  await connectToDatabase();
  const collab = await BookCollaboratorModel.findOne({ _id: id }).lean();
  if (!collab) return null;
  const book = await BookModel.findOne({ _id: collab.bookId, userId }).lean();
  if (!book) return null;

  const doc = await BookCollaboratorModel.findOneAndUpdate({ _id: id }, input, { new: true }).lean();
  return toPlain(doc);
}

export async function deleteCollaborator(id: string, userId: string) {
  await connectToDatabase();
  const collab = await BookCollaboratorModel.findOne({ _id: id }).lean();
  if (!collab) return null;
  const book = await BookModel.findOne({ _id: collab.bookId, userId }).lean();
  if (!book) return null;

  const doc = await BookCollaboratorModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

export async function createComment(input: CreateCommentInput) {
  await connectToDatabase();
  const doc = await BookCommentModel.create(input);
  return toPlain(doc);
}

export async function getCommentsForChapter(chapterId: string, userId: string) {
  await connectToDatabase();
  const chapter = await BookChapterModel.findOne({ _id: chapterId }).lean();
  if (!chapter) return [];
  const book = await BookModel.findOne({ _id: chapter.bookId, userId, deletedAt: null }).lean();
  if (!book) return [];

  const docs = await BookCommentModel.find({ chapterId })
    .sort({ createdAt: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateComment(id: string, userId: string, text: string) {
  await connectToDatabase();
  const doc = await BookCommentModel.findOneAndUpdate(
    { _id: id, userId },
    { text, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteComment(id: string, userId: string) {
  await connectToDatabase();
  const doc = await BookCommentModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function upsertReadingProgress(input: CreateProgressInput) {
  await connectToDatabase();
  const existing = await BookReadingProgressModel.findOne({
    userId: input.userId,
    bookId: input.bookId,
  }).lean();

  if (existing) {
    const doc = await BookReadingProgressModel.findOneAndUpdate(
      { _id: existing.id },
      {
        chapterId: input.chapterId,
        scrollPosition: input.scrollPosition,
        percentage: input.percentage,
        updatedAt: new Date(),
      },
      { new: true },
    ).lean();
    return toPlain(doc);
  }

  const doc = await BookReadingProgressModel.create(input);
  return toPlain(doc);
}

export async function getReadingProgress(userId: string, bookId: string) {
  await connectToDatabase();
  const doc = await BookReadingProgressModel.findOne({ userId, bookId }).lean();
  return toPlain(doc);
}

export async function getRecentReadingProgress(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await BookReadingProgressModel.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function createBookmark(input: CreateBookmarkInput) {
  await connectToDatabase();
  const doc = await BookBookmarkModel.create(input);
  return toPlain(doc);
}

export async function getBookmarks(bookId: string, userId: string) {
  await connectToDatabase();
  const docs = await BookBookmarkModel.find({ bookId, userId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function deleteBookmark(id: string, userId: string) {
  await connectToDatabase();
  const doc = await BookBookmarkModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function createHighlight(input: CreateHighlightInput) {
  await connectToDatabase();
  const doc = await BookHighlightModel.create(input);
  return toPlain(doc);
}

export async function getHighlights(bookId: string, userId: string) {
  await connectToDatabase();
  const docs = await BookHighlightModel.find({ bookId, userId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateHighlight(id: string, userId: string, input: Partial<CreateHighlightInput>) {
  await connectToDatabase();
  const doc = await BookHighlightModel.findOneAndUpdate(
    { _id: id, userId },
    input,
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteHighlight(id: string, userId: string) {
  await connectToDatabase();
  const doc = await BookHighlightModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function searchBooks(
  userId: string,
  query: string,
  opts: { limit?: number; offset?: number } = {},
) {
  await connectToDatabase();
  const bookFilter = {
    userId,
    deletedAt: null,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  const bookResults = await BookModel.find(bookFilter)
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 20)
    .lean();

  const chapters = await BookChapterModel.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ],
  })
    .limit(opts.limit ?? 20)
    .skip(opts.offset ?? 0)
    .lean();

  const chapterResults = [];
  for (const ch of chapters) {
    const book = await BookModel.findOne({ _id: ch.bookId, userId, deletedAt: null }).lean();
    if (book) chapterResults.push({ chapter: toPlain(ch), book: toPlain(book) });
  }

  return { books: toPlainArray(bookResults), chapters: chapterResults };
}

// Characters
export async function createCharacter(input: CreateCharacterInput) {
  await connectToDatabase();
  const doc = await BookCharacterModel.create(input);
  return toPlain(doc);
}

export async function getCharactersForBook(bookId: string) {
  await connectToDatabase();
  const docs = await BookCharacterModel.find({ bookId }).sort({ name: 1 }).lean();
  return toPlainArray(docs);
}

export async function getCharacterById(id: string) {
  await connectToDatabase();
  const doc = await BookCharacterModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function updateCharacter(id: string, input: Partial<CreateCharacterInput>) {
  await connectToDatabase();
  const doc = await BookCharacterModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteCharacter(id: string) {
  await connectToDatabase();
  const doc = await BookCharacterModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

// Research Notes
export async function createResearchNote(input: CreateResearchNoteInput) {
  await connectToDatabase();
  const doc = await BookResearchNoteModel.create(input);
  return toPlain(doc);
}

export async function getResearchNotesForBook(bookId: string) {
  await connectToDatabase();
  const docs = await BookResearchNoteModel.find({ bookId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getResearchNoteById(id: string) {
  await connectToDatabase();
  const doc = await BookResearchNoteModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function updateResearchNote(id: string, input: Partial<CreateResearchNoteInput>) {
  await connectToDatabase();
  const doc = await BookResearchNoteModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteResearchNote(id: string) {
  await connectToDatabase();
  const doc = await BookResearchNoteModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

// Chapter-Character linking
export async function linkChapterToCharacter(input: CreateChapterCharacterInput) {
  await connectToDatabase();
  const doc = await BookChapterCharacterModel.create(input);
  return toPlain(doc);
}

export async function getCharactersForChapter(chapterId: string) {
  await connectToDatabase();
  const links = await BookChapterCharacterModel.find({ chapterId }).lean();
  const characterIds = links.map((l: any) => l.characterId);
  const characters = await BookCharacterModel.find({ _id: { $in: characterIds } }).lean();
  return characters.map((c: any) => ({ character: toPlain(c) }));
}

export async function unlinkChapterCharacter(chapterId: string, characterId: string) {
  await connectToDatabase();
  const doc = await BookChapterCharacterModel.findOneAndDelete({ chapterId, characterId }).lean();
  return toPlain(doc);
}

// Chapter-Research Note linking
export async function linkChapterToResearchNote(input: CreateChapterResearchNoteInput) {
  await connectToDatabase();
  const doc = await BookChapterResearchNoteModel.create(input);
  return toPlain(doc);
}

export async function getResearchNotesForChapter(chapterId: string) {
  await connectToDatabase();
  const links = await BookChapterResearchNoteModel.find({ chapterId }).lean();
  const noteIds = links.map((l: any) => l.noteId);
  const notes = await BookResearchNoteModel.find({ _id: { $in: noteIds } }).lean();
  return notes.map((n: any) => ({ note: toPlain(n) }));
}

export async function unlinkChapterResearchNote(chapterId: string, noteId: string) {
  await connectToDatabase();
  const doc = await BookChapterResearchNoteModel.findOneAndDelete({ chapterId, noteId }).lean();
  return toPlain(doc);
}

// Writing Sessions
export async function createWritingSession(input: CreateWritingSessionInput) {
  await connectToDatabase();
  const doc = await BookWritingSessionModel.create(input);
  return toPlain(doc);
}

export async function getWritingSessionById(id: string) {
  await connectToDatabase();
  const doc = await BookWritingSessionModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function updateWritingSession(id: string, input: Partial<CreateWritingSessionInput>) {
  await connectToDatabase();
  const doc = await BookWritingSessionModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getWritingSessionsForBook(
  bookId: string,
  opts: { from?: Date; to?: Date; limit?: number } = {},
) {
  await connectToDatabase();
  const filter: any = { bookId };
  if (opts.from || opts.to) {
    filter.startedAt = {};
    if (opts.from) filter.startedAt.$gte = opts.from;
    if (opts.to) filter.startedAt.$lte = opts.to;
  }

  const docs = await BookWritingSessionModel.find(filter)
    .sort({ startedAt: -1 })
    .limit(opts.limit ?? 100)
    .lean();
  return toPlainArray(docs);
}

export async function getWritingSessionStats(userId: string) {
  await connectToDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [todayStats] = await BookWritingSessionModel.aggregate([
    { $match: { userId, startedAt: { $gte: today } } },
    {
      $group: {
        _id: null,
        words: { $sum: { $ifNull: ["$wordsAdded", 0] } },
        sessions: { $sum: 1 },
        seconds: { $sum: { $ifNull: ["$durationSeconds", 0] } },
      },
    },
  ]);

  const [weekStats] = await BookWritingSessionModel.aggregate([
    { $match: { userId, startedAt: { $gte: weekStart } } },
    {
      $group: {
        _id: null,
        words: { $sum: { $ifNull: ["$wordsAdded", 0] } },
        sessions: { $sum: 1 },
        seconds: { $sum: { $ifNull: ["$durationSeconds", 0] } },
      },
    },
  ]);

  return {
    today: {
      words: Number(todayStats?.words ?? 0),
      sessions: Number(todayStats?.sessions ?? 0),
      seconds: Number(todayStats?.seconds ?? 0),
    },
    thisWeek: {
      words: Number(weekStats?.words ?? 0),
      sessions: Number(weekStats?.sessions ?? 0),
      seconds: Number(weekStats?.seconds ?? 0),
    },
  };
}
