import { z } from "zod";
import {
  createBook,
  getBooksForUser,
  getBookById,
  getPublishedBookById,
  updateBook,
  updateBookById,
  deleteBook,
  getBookDashboardStats,
  createPart,
  getPartsForBook,
  updatePart,
  deletePart,
  createChapter,
  getChaptersForBook,
  getChapterById,
  updateChapter,
  deleteChapter,
  reorderChapters,
  getBookWordCount,
  createVersion,
  getVersionsForChapter,
  getVersionById,
  createCollaborator,
  getCollaboratorsForBook,
  getCollaborator,
  getUserCollaboratorRole,
  updateCollaborator,
  deleteCollaborator,
  createComment,
  getCommentsForChapter,
  updateComment,
  deleteComment,
  upsertReadingProgress,
  getReadingProgress,
  getRecentReadingProgress,
  createBookmark,
  getBookmarks,
  deleteBookmark,
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
  searchBooks,
  type CreateBookInput,
  type CreatePartInput,
  type CreateChapterInput,
  type CreateVersionInput,
  type CreateCollaboratorInput,
  type CreateCommentInput,
  type CreateProgressInput,
  type CreateBookmarkInput,
  type CreateHighlightInput,
  createCharacter,
  getCharactersForBook,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  createResearchNote,
  getResearchNotesForBook,
  getResearchNoteById,
  updateResearchNote,
  deleteResearchNote,
  linkChapterToCharacter,
  getCharactersForChapter,
  unlinkChapterCharacter,
  linkChapterToResearchNote,
  getResearchNotesForChapter,
  unlinkChapterResearchNote,
  createWritingSession,
  updateWritingSession,
  getWritingSessionsForBook,
  getWritingSessionById,
  getWritingSessionStats,
  type CreateCharacterInput,
  type CreateResearchNoteInput,
  type CreateChapterCharacterInput,
  type CreateChapterResearchNoteInput,
  type CreateWritingSessionInput,
} from "./repository";

const bookStatuses = ["draft", "published", "archived"] as const;
const bookTypes = [
  "novel", "fantasy", "romance", "science-fiction", "horror",
  "mystery", "thriller", "self-help", "business", "technical",
  "biography", "memoir", "poetry", "research", "journal",
  "educational", "cookbook", "childrens-book", "custom",
] as const;
const collaboratorRoles = ["owner", "editor", "commenter", "viewer"] as const;

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(10000).optional(),
  authorByline: z.string().max(200).optional(),
  language: z.string().max(10).default("en"),
  isbn: z.string().max(20).optional(),
  bookType: z.enum(bookTypes).optional(),
  genre: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  keywords: z.array(z.string().max(50)).max(30).default([]),
  coverUrl: z.string().max(2000).optional(),
  bannerUrl: z.string().max(2000).optional(),
  copyright: z.string().max(500).optional(),
  license: z.string().max(200).optional(),
  publisher: z.string().max(200).optional(),
  edition: z.string().max(100).optional(),
  series: z.string().max(200).optional(),
  readingLevel: z.string().max(100).optional(),
  ageRating: z.string().max(50).optional(),
  targetWordCount: z.number().int().min(0).optional(),
  targetChapterCount: z.number().int().min(0).optional(),
  dailyWritingGoal: z.number().int().min(0).optional(),
  weeklyGoal: z.number().int().min(0).optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(bookStatuses).default("draft"),
  isListed: z.boolean().default(true),
  publishAt: z.string().datetime().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const createPartSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string().min(1).max(300),
  order: z.number().int().min(0),
});

export const updatePartSchema = createPartSchema.partial().omit({ bookId: true });

export const createChapterSchema = z.object({
  bookId: z.string().uuid(),
  partId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
  content: z.any().default({ type: "doc", content: [] }),
  order: z.number().int().min(0),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.any().optional(),
  partId: z.string().uuid().nullable().optional(),
  wordCount: z.number().int().min(0).optional(),
});

export const reorderChaptersSchema = z.array(
  z.object({
    id: z.string().uuid(),
    order: z.number().int().min(0),
    partId: z.string().uuid().nullable().optional(),
  }),
);

export const createCollaboratorSchema = z.object({
  bookId: z.string().uuid(),
  userId: z.string().min(1),
  role: z.enum(collaboratorRoles).default("editor"),
});

export const updateCollaboratorSchema = z.object({
  role: z.enum(collaboratorRoles),
});

export const createCommentSchema = z.object({
  chapterId: z.string().uuid(),
  text: z.string().min(1).max(5000),
  position: z.any().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const upsertProgressSchema = z.object({
  bookId: z.string().uuid(),
  chapterId: z.string().uuid(),
  scrollPosition: z.number().int().min(0).default(0),
  percentage: z.number().int().min(0).max(100).default(0),
});

export const createBookmarkSchema = z.object({
  bookId: z.string().uuid(),
  chapterId: z.string().uuid(),
  position: z.any(),
  excerpt: z.string().max(1000).optional(),
  label: z.string().max(200).optional(),
  color: z.string().max(20).default("yellow"),
});

export const createHighlightSchema = z.object({
  bookId: z.string().uuid(),
  chapterId: z.string().uuid(),
  position: z.any(),
  text: z.string().min(1).max(5000),
  color: z.string().max(20).default("yellow"),
  note: z.string().max(2000).optional(),
});

export const updateHighlightSchema = z.object({
  color: z.string().max(20).optional(),
  note: z.string().max(2000).optional(),
});

export const createCharacterSchema = z.object({
  bookId: z.string().uuid(),
  name: z.string().min(1).max(300),
  imageUrl: z.string().max(2000).optional(),
  age: z.string().max(100).optional(),
  personality: z.string().max(10000).optional(),
  background: z.string().max(10000).optional(),
  appearance: z.string().max(5000).optional(),
  goals: z.string().max(5000).optional(),
  notes: z.string().max(10000).optional(),
  color: z.string().max(20).optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial().omit({ bookId: true });

export const createResearchNoteSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string().min(1).max(500),
  content: z.string().max(50000).optional(),
  sourceType: z.string().max(100).optional(),
  sourceUrl: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
});

export const updateResearchNoteSchema = createResearchNoteSchema.partial().omit({ bookId: true });

export const linkChapterCharacterSchema = z.object({
  chapterId: z.string().uuid(),
  characterId: z.string().uuid(),
  position: z.any().optional(),
});

export const linkChapterResearchNoteSchema = z.object({
  chapterId: z.string().uuid(),
  noteId: z.string().uuid(),
});

export const createWritingSessionSchema = z.object({
  bookId: z.string().uuid(),
  chapterId: z.string().uuid().nullable().optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  wordsAdded: z.number().int().min(0).default(0),
});

function countWordsFromDoc(doc: { type?: string; content?: unknown[]; text?: string }): number {
  if (!doc) return 0;
  let wordCount = 0;
  const stack = [doc];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.text) {
      wordCount += node.text.split(/\s+/).filter(Boolean).length;
    }
    if (node.content && Array.isArray(node.content)) {
      for (let i = node.content.length - 1; i >= 0; i--) {
        stack.push(node.content[i] as any);
      }
    }
  }
  return wordCount;
}

export type CreateBookParams = z.infer<typeof createBookSchema>;
export type UpdateBookParams = z.infer<typeof updateBookSchema>;
export type CreatePartParams = z.infer<typeof createPartSchema>;
export type CreateChapterParams = z.infer<typeof createChapterSchema>;
export type UpdateChapterParams = z.infer<typeof updateChapterSchema>;
export type CreateCollaboratorParams = z.infer<typeof createCollaboratorSchema>;
export type CreateCommentParams = z.infer<typeof createCommentSchema>;
export type UpsertProgressParams = z.infer<typeof upsertProgressSchema>;
export type CreateBookmarkParams = z.infer<typeof createBookmarkSchema>;
export type CreateHighlightParams = z.infer<typeof createHighlightSchema>;
export type UpdateHighlightParams = z.infer<typeof updateHighlightSchema>;
export type CreateCharacterParams = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterParams = z.infer<typeof updateCharacterSchema>;
export type CreateResearchNoteParams = z.infer<typeof createResearchNoteSchema>;
export type UpdateResearchNoteParams = z.infer<typeof updateResearchNoteSchema>;
export type LinkChapterCharacterParams = z.infer<typeof linkChapterCharacterSchema>;
export type LinkChapterResearchNoteParams = z.infer<typeof linkChapterResearchNoteSchema>;
export type CreateWritingSessionParams = z.infer<typeof createWritingSessionSchema>;

export async function createNewBook(userId: string, params: CreateBookParams) {
  const validated = createBookSchema.parse(params);
  const input: CreateBookInput = {
    userId,
    title: validated.title,
    subtitle: validated.subtitle ?? null,
    description: validated.description ?? null,
    authorByline: validated.authorByline ?? null,
    language: validated.language,
    isbn: validated.isbn ?? null,
    bookType: validated.bookType ?? null,
    genre: validated.genre ?? null,
    tags: validated.tags,
    keywords: validated.keywords,
    coverUrl: validated.coverUrl ?? null,
    bannerUrl: validated.bannerUrl ?? null,
    copyright: validated.copyright ?? null,
    license: validated.license ?? null,
    publisher: validated.publisher ?? null,
    edition: validated.edition ?? null,
    series: validated.series ?? null,
    readingLevel: validated.readingLevel ?? null,
    ageRating: validated.ageRating ?? null,
    targetWordCount: validated.targetWordCount ?? null,
    targetChapterCount: validated.targetChapterCount ?? null,
    dailyWritingGoal: validated.dailyWritingGoal ?? null,
    weeklyGoal: validated.weeklyGoal ?? null,
    deadline: validated.deadline ? new Date(validated.deadline) : null,
    status: validated.status,
    isListed: validated.isListed,
    publishAt: validated.publishAt ? new Date(validated.publishAt) : null,
    wordCount: 0,
    chapterCount: 0,
  };
  return createBook(input);
}

export async function getBooks(userId: string, filters: {
  status?: string;
  search?: string;
  tags?: string[];
  sortBy?: "createdAt" | "title" | "updatedAt" | "wordCount";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
} = {}) {
  return getBooksForUser(userId, filters);
}

export async function getBook(id: string, userId: string) {
  return getBookById(id, userId);
}

export async function updateExistingBook(id: string, userId: string, params: UpdateBookParams) {
  const validated = updateBookSchema.parse(params);
  const { deadline, publishAt, ...rest } = validated;
  const input: Partial<CreateBookInput> = {
    ...rest,
    deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
    publishAt: publishAt !== undefined ? (publishAt ? new Date(publishAt) : null) : undefined,
  };
  return updateBook(id, userId, input);
}

export async function removeBook(id: string, userId: string) {
  return deleteBook(id, userId);
}

export async function getDashboard(userId: string) {
  return getBookDashboardStats(userId);
}

export async function addPart(params: CreatePartParams) {
  const validated = createPartSchema.parse(params);
  return createPart(validated as CreatePartInput);
}

export async function getParts(bookId: string) {
  return getPartsForBook(bookId);
}

export async function modifyPart(id: string, params: z.infer<typeof updatePartSchema>) {
  const validated = updatePartSchema.parse(params);
  return updatePart(id, validated);
}

export async function removePart(id: string) {
  return deletePart(id);
}

export async function addChapter(params: CreateChapterParams) {
  const validated = createChapterSchema.parse(params);
  const wordCount = validated.content
    ? countWordsFromDoc(validated.content)
    : 0;
  const input: CreateChapterInput = {
    bookId: validated.bookId,
    partId: validated.partId ?? null,
    title: validated.title,
    content: validated.content ?? { type: "doc", content: [] },
    order: validated.order,
    wordCount,
  };
  const chapter = await createChapter(input);
  await recalculateBookCounts(validated.bookId);
  return chapter;
}

export async function getChapters(bookId: string) {
  return getChaptersForBook(bookId);
}

export async function getChapter(id: string) {
  return getChapterById(id);
}

export async function modifyChapter(id: string, params: UpdateChapterParams) {
  const validated = updateChapterSchema.parse(params);
  const input: Partial<CreateChapterInput> = { ...validated };
  if (validated.content) {
    input.wordCount = countWordsFromDoc(validated.content);
  }
  const chapter = await updateChapter(id, input);
  if (chapter) {
    await recalculateBookCounts(chapter.bookId);
  }
  return chapter;
}

export async function removeChapter(id: string) {
  const chapter = await getChapterById(id);
  if (!chapter) return null;
  const result = await deleteChapter(id);
  if (result) {
    await recalculateBookCounts(chapter.bookId);
  }
  return result;
}

export async function reorderBookChapters(
  items: { id: string; order: number; partId?: string | null }[],
) {
  const validated = reorderChaptersSchema.parse(items);
  await reorderChapters(validated);
}

async function recalculateBookCounts(bookId: string) {
  const { totalWords, chapterCount } = await getBookWordCount(bookId);
  await updateBookById(bookId, {
    wordCount: totalWords,
    chapterCount,
  } as Partial<CreateBookInput>);
}

export async function saveVersion(chapterId: string, note?: string) {
  const chapter = await getChapterById(chapterId);
  if (!chapter) return null;
  const input: CreateVersionInput = {
    chapterId,
    content: chapter.content,
    wordCount: chapter.wordCount,
    note: note ?? null,
  };
  return createVersion(input);
}

export async function getChapterVersions(chapterId: string) {
  return getVersionsForChapter(chapterId);
}

export async function restoreVersion(versionId: string) {
  const version = await getVersionById(versionId);
  if (!version) return null;
  const chapter = await updateChapter(version.chapterId, {
    content: version.content,
    wordCount: version.wordCount,
  });
  return chapter;
}

export async function inviteCollaborator(params: CreateCollaboratorParams) {
  const validated = createCollaboratorSchema.parse(params);
  const input: CreateCollaboratorInput = validated;
  return createCollaborator(input);
}

export async function getBookCollaborators(bookId: string) {
  return getCollaboratorsForBook(bookId);
}

export async function modifyCollaborator(id: string, params: z.infer<typeof updateCollaboratorSchema>) {
  const validated = updateCollaboratorSchema.parse(params);
  return updateCollaborator(id, validated);
}

export async function removeCollaborator(id: string) {
  return deleteCollaborator(id);
}

export async function checkCollaboratorRole(bookId: string, userId: string) {
  return getUserCollaboratorRole(bookId, userId);
}

export async function addComment(params: CreateCommentParams) {
  const validated = createCommentSchema.parse(params);
  const input: CreateCommentInput = {
    chapterId: validated.chapterId,
    userId: "",
    text: validated.text,
    position: validated.position ?? null,
    parentId: validated.parentId ?? null,
  };
  return createComment(input);
}

export async function getChapterComments(chapterId: string) {
  return getCommentsForChapter(chapterId);
}

export async function editComment(id: string, userId: string, params: z.infer<typeof updateCommentSchema>) {
  const validated = updateCommentSchema.parse(params);
  return updateComment(id, userId, validated.text);
}

export async function removeComment(id: string, userId: string) {
  return deleteComment(id, userId);
}

export async function saveReadingProgress(userId: string, params: UpsertProgressParams) {
  const validated = upsertProgressSchema.parse(params);
  const input: CreateProgressInput = {
    userId,
    ...validated,
  };
  return upsertReadingProgress(input);
}

export async function getBookProgress(userId: string, bookId: string) {
  return getReadingProgress(userId, bookId);
}

export async function getRecentProgress(userId: string, limit = 5) {
  return getRecentReadingProgress(userId, limit);
}

export async function addBookmark(userId: string, params: CreateBookmarkParams) {
  const validated = createBookmarkSchema.parse(params);
  return createBookmark({ userId, ...validated } as CreateBookmarkInput);
}

export async function getBookBookmarks(bookId: string, userId: string) {
  return getBookmarks(bookId, userId);
}

export async function removeBookmark(id: string, userId: string) {
  return deleteBookmark(id, userId);
}

export async function addHighlight(userId: string, params: CreateHighlightParams) {
  const validated = createHighlightSchema.parse(params);
  return createHighlight({
    userId,
    ...validated,
    note: validated.note ?? null,
  } as CreateHighlightInput);
}

export async function getBookHighlights(bookId: string, userId: string) {
  return getHighlights(bookId, userId);
}

export async function modifyHighlight(id: string, userId: string, params: UpdateHighlightParams) {
  const validated = updateHighlightSchema.parse(params);
  return updateHighlight(id, userId, validated as Partial<CreateHighlightInput>);
}

export async function removeHighlight(id: string, userId: string) {
  return deleteHighlight(id, userId);
}

export async function searchAllBooks(userId: string, query: string) {
  if (!query.trim()) return { books: [], chapters: [] };
  return searchBooks(userId, query.trim());
}

export async function exportBookAsMarkdown(bookId: string, userId: string) {
  const book = await getBookById(bookId, userId);
  if (!book) return null;

  const chapters = await getChaptersForBook(bookId);
  const parts = await getPartsForBook(bookId);

  const partsMap = new Map(parts.map((p) => [p.id, p]));

  let md = `# ${book.title}\n\n`;
  if (book.subtitle) md += `*${book.subtitle}*\n\n`;
  if (book.authorByline) md += `**By ${book.authorByline}**\n\n`;
  if (book.description) md += `${book.description}\n\n`;
  md += `---\n\n`;

  let currentPartId: string | null = null;
  for (const chapter of chapters) {
    if (chapter.partId && chapter.partId !== currentPartId) {
      const part = partsMap.get(chapter.partId);
      if (part) {
        md += `## ${part.title}\n\n`;
      }
      currentPartId = chapter.partId;
    }
    md += `### ${chapter.title}\n\n`;

    if (chapter.content && typeof chapter.content === "object") {
      const text = extractTextFromDoc(chapter.content as any);
      md += `${text}\n\n`;
    }
  }

  return { markdown: md, book, chapters, parts };
}

export async function exportBookAsJson(bookId: string, userId: string) {
  const book = await getBookById(bookId, userId);
  if (!book) return null;

  const chapters = await getChaptersForBook(bookId);
  const parts = await getPartsForBook(bookId);

  return {
    book,
    parts,
    chapters: chapters.map((c) => ({
      id: c.id,
      title: c.title,
      order: c.order,
      partId: c.partId,
      wordCount: c.wordCount,
      content: c.content,
    })),
    exportedAt: new Date().toISOString(),
  };
}

// Characters
export async function addCharacter(userId: string, params: CreateCharacterParams) {
  const validated = createCharacterSchema.parse(params);
  const input: CreateCharacterInput = { userId, ...validated, bookId: validated.bookId };
  return createCharacter(input);
}

export async function getCharacters(bookId: string) {
  return getCharactersForBook(bookId);
}

export async function modifyCharacter(id: string, params: UpdateCharacterParams) {
  const validated = updateCharacterSchema.parse(params);
  return updateCharacter(id, validated);
}

export async function removeCharacter(id: string) {
  return deleteCharacter(id);
}

// Research Notes
export async function addResearchNote(userId: string, params: CreateResearchNoteParams) {
  const validated = createResearchNoteSchema.parse(params);
  const input: CreateResearchNoteInput = { userId, ...validated, bookId: validated.bookId };
  return createResearchNote(input);
}

export async function getResearchNotes(bookId: string) {
  return getResearchNotesForBook(bookId);
}

export async function modifyResearchNote(id: string, params: UpdateResearchNoteParams) {
  const validated = updateResearchNoteSchema.parse(params);
  return updateResearchNote(id, validated);
}

export async function removeResearchNote(id: string) {
  return deleteResearchNote(id);
}

// Chapter-Character linking
export async function linkCharacterToChapter(userId: string, params: LinkChapterCharacterParams) {
  const validated = linkChapterCharacterSchema.parse(params);
  const input: CreateChapterCharacterInput = { ...validated, position: validated.position ?? null };
  return linkChapterToCharacter(input);
}

export async function getChapterCharacters(chapterId: string) {
  return getCharactersForChapter(chapterId);
}

export async function unlinkCharacterFromChapter(chapterId: string, characterId: string) {
  return unlinkChapterCharacter(chapterId, characterId);
}

// Chapter-Research Note linking
export async function linkResearchNoteToChapter(params: LinkChapterResearchNoteParams) {
  const validated = linkChapterResearchNoteSchema.parse(params);
  return linkChapterToResearchNote(validated as CreateChapterResearchNoteInput);
}

export async function getChapterResearchNotes(chapterId: string) {
  return getResearchNotesForChapter(chapterId);
}

export async function unlinkResearchNoteFromChapter(chapterId: string, noteId: string) {
  return unlinkChapterResearchNote(chapterId, noteId);
}

// Writing Sessions
export async function startWritingSession(userId: string, params: Omit<CreateWritingSessionParams, 'endedAt' | 'durationSeconds'>) {
  const validated = createWritingSessionSchema.parse({ ...params, startedAt: new Date().toISOString() });
  const input: CreateWritingSessionInput = {
    userId,
    bookId: validated.bookId,
    chapterId: validated.chapterId ?? null,
    startedAt: new Date(validated.startedAt),
    wordsAdded: validated.wordsAdded,
  };
  return createWritingSession(input);
}

export async function endWritingSession(id: string, params: { wordsAdded: number }) {
  const now = new Date();
  const session = await getWritingSessionById(id);
  if (!session) return null;

  const durationSeconds = Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000);
  return updateWritingSession(id, {
    endedAt: now,
    durationSeconds,
    wordsAdded: params.wordsAdded,
  });
}

export async function getBookSessions(bookId: string, opts?: { from?: Date; to?: Date }) {
  return getWritingSessionsForBook(bookId, opts);
}

export async function getSessionStats(userId: string) {
  return getWritingSessionStats(userId);
}

function extractTextFromDoc(doc: { type?: string; content?: unknown[]; text?: string }): string {
  if (!doc) return "";
  const parts: string[] = [];
  const stack = [doc];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.text) {
      parts.push(node.text);
    }
    if (node.content && Array.isArray(node.content)) {
      for (let i = node.content.length - 1; i >= 0; i--) {
        stack.push(node.content[i] as any);
      }
    }
  }
  return parts.join(" ");
}
