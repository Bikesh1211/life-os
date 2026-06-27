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
} from "./repository";

const bookStatuses = ["draft", "published", "archived"] as const;
const collaboratorRoles = ["owner", "editor", "commenter", "viewer"] as const;

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(10000).optional(),
  authorByline: z.string().max(200).optional(),
  language: z.string().max(10).default("en"),
  isbn: z.string().max(20).optional(),
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

export async function createNewBook(userId: string, params: CreateBookParams) {
  const validated = createBookSchema.parse(params);
  const input = {
    userId,
    ...validated,
    wordCount: 0,
    chapterCount: 0,
  } as CreateBookInput;
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
  return updateBook(id, userId, validated as Partial<CreateBookInput>);
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
