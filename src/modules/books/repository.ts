import { db } from "@/core/database";
import { eq, and, isNull, desc, asc, gte, lte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  books,
  bookParts,
  bookChapters,
  bookVersions,
  bookCollaborators,
  bookComments,
  bookReadingProgress,
  bookBookmarks,
  bookHighlights,
} from "./schema";

export type Book = typeof books.$inferSelect;
export type BookPart = typeof bookParts.$inferSelect;
export type BookChapter = typeof bookChapters.$inferSelect;
export type BookVersion = typeof bookVersions.$inferSelect;
export type BookCollaborator = typeof bookCollaborators.$inferSelect;
export type BookComment = typeof bookComments.$inferSelect;
export type BookReadingProgress = typeof bookReadingProgress.$inferSelect;
export type BookBookmark = typeof bookBookmarks.$inferSelect;
export type BookHighlight = typeof bookHighlights.$inferSelect;

export type CreateBookInput = typeof books.$inferInsert;
export type CreatePartInput = typeof bookParts.$inferInsert;
export type CreateChapterInput = typeof bookChapters.$inferInsert;
export type CreateVersionInput = typeof bookVersions.$inferInsert;
export type CreateCollaboratorInput = typeof bookCollaborators.$inferInsert;
export type CreateCommentInput = typeof bookComments.$inferInsert;
export type CreateProgressInput = typeof bookReadingProgress.$inferInsert;
export type CreateBookmarkInput = typeof bookBookmarks.$inferInsert;
export type CreateHighlightInput = typeof bookHighlights.$inferInsert;

export async function createBook(input: CreateBookInput) {
  const [book] = await db.insert(books).values(input).returning();
  return book;
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
  } = {},
) {
  const conditions: SQL[] = [
    eq(books.userId, userId),
    isNull(books.deletedAt),
  ];

  if (opts.status) conditions.push(eq(books.status, opts.status as never));
  if (opts.search) {
    conditions.push(
      sql`to_tsvector('english', ${books.title} || ' ' || coalesce(${books.description}, '')) @@ plainto_tsquery('english', ${opts.search})`,
    );
  }
  if (opts.tags && opts.tags.length > 0) {
    conditions.push(
      sql`${books.tags} && ${sql`ARRAY[${sql.join(opts.tags.map((t) => sql`${t}`), sql`, `)}]::text[]`}`,
    );
  }

  const orderCol = opts.sortBy ? books[opts.sortBy] : books.createdAt;
  const orderFn = opts.sortOrder === "asc" ? asc : desc;

  return db
    .select()
    .from(books)
    .where(and(...conditions))
    .orderBy(orderFn(orderCol))
    .limit(opts.limit ?? 100)
    .offset(opts.offset ?? 0);
}

export async function getBookById(id: string, userId: string) {
  const [book] = await db
    .select()
    .from(books)
    .where(and(eq(books.id, id), eq(books.userId, userId), isNull(books.deletedAt)));
  return book ?? null;
}

export async function getPublishedBookById(id: string) {
  const [book] = await db
    .select()
    .from(books)
    .where(and(eq(books.id, id), eq(books.status, "published"), isNull(books.deletedAt)));
  return book ?? null;
}

export async function updateBook(id: string, userId: string, input: Partial<CreateBookInput>) {
  const [book] = await db
    .update(books)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(books.id, id), eq(books.userId, userId), isNull(books.deletedAt)))
    .returning();
  return book ?? null;
}

export async function updateBookById(id: string, input: Partial<CreateBookInput>) {
  const [book] = await db
    .update(books)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(books.id, id))
    .returning();
  return book ?? null;
}

export async function deleteBook(id: string, userId: string) {
  const [book] = await db
    .update(books)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(books.id, id), eq(books.userId, userId), isNull(books.deletedAt)))
    .returning();
  return book ?? null;
}

export async function getBookDashboardStats(userId: string) {
  const items = await db
    .select({
      status: books.status,
      count: sql<number>`count(*)`,
      totalWords: sql<number>`coalesce(sum(${books.wordCount}), 0)`,
    })
    .from(books)
    .where(and(eq(books.userId, userId), isNull(books.deletedAt)))
    .groupBy(books.status);

  const totalBooks = items.reduce((s, i) => s + Number(i.count), 0);
  const draftBooks = items.find((i) => i.status === "draft");
  const publishedBooks = items.find((i) => i.status === "published");
  const totalWords = items.reduce((s, i) => s + Number(i.totalWords), 0);
  const totalChapters = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookChapters)
    .innerJoin(books, eq(bookChapters.bookId, books.id))
    .where(and(eq(books.userId, userId), isNull(books.deletedAt)))
    .then((r) => Number(r[0]?.count ?? 0));

  return {
    totalBooks,
    draftBooks: Number(draftBooks?.count ?? 0),
    publishedBooks: Number(publishedBooks?.count ?? 0),
    totalWords,
    totalChapters,
  };
}

export async function createPart(input: CreatePartInput) {
  const [part] = await db.insert(bookParts).values(input).returning();
  return part;
}

export async function getPartsForBook(bookId: string) {
  return db
    .select()
    .from(bookParts)
    .where(eq(bookParts.bookId, bookId))
    .orderBy(asc(bookParts.order));
}

export async function updatePart(id: string, input: Partial<CreatePartInput>) {
  const [part] = await db
    .update(bookParts)
    .set(input)
    .where(eq(bookParts.id, id))
    .returning();
  return part ?? null;
}

export async function deletePart(id: string) {
  const [part] = await db
    .delete(bookParts)
    .where(eq(bookParts.id, id))
    .returning();
  return part ?? null;
}

export async function createChapter(input: CreateChapterInput) {
  const [chapter] = await db.insert(bookChapters).values(input).returning();
  return chapter;
}

export async function getChaptersForBook(bookId: string) {
  return db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.bookId, bookId))
    .orderBy(asc(bookChapters.order));
}

export async function getChapterById(id: string) {
  const [chapter] = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, id));
  return chapter ?? null;
}

export async function updateChapter(id: string, input: Partial<CreateChapterInput>) {
  const [chapter] = await db
    .update(bookChapters)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(bookChapters.id, id))
    .returning();
  return chapter ?? null;
}

export async function deleteChapter(id: string) {
  const [chapter] = await db
    .delete(bookChapters)
    .where(eq(bookChapters.id, id))
    .returning();
  return chapter ?? null;
}

export async function reorderChapters(
  items: { id: string; order: number; partId?: string | null }[],
) {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(bookChapters)
        .set({ order: item.order, partId: item.partId ?? null })
        .where(eq(bookChapters.id, item.id));
    }
  });
}

export async function getBookWordCount(bookId: string) {
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${bookChapters.wordCount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(bookChapters)
    .where(eq(bookChapters.bookId, bookId));
  return { totalWords: Number(result?.total ?? 0), chapterCount: Number(result?.count ?? 0) };
}

export async function createVersion(input: CreateVersionInput) {
  const [version] = await db.insert(bookVersions).values(input).returning();
  return version;
}

export async function getVersionsForChapter(chapterId: string) {
  return db
    .select()
    .from(bookVersions)
    .where(eq(bookVersions.chapterId, chapterId))
    .orderBy(desc(bookVersions.createdAt));
}

export async function getVersionById(id: string) {
  const [version] = await db
    .select()
    .from(bookVersions)
    .where(eq(bookVersions.id, id));
  return version ?? null;
}

export async function createCollaborator(input: CreateCollaboratorInput) {
  const [collaborator] = await db.insert(bookCollaborators).values(input).returning();
  return collaborator;
}

export async function getCollaboratorsForBook(bookId: string) {
  return db
    .select()
    .from(bookCollaborators)
    .where(eq(bookCollaborators.bookId, bookId))
    .orderBy(asc(bookCollaborators.createdAt));
}

export async function getCollaborator(bookId: string, userId: string) {
  const [collaborator] = await db
    .select()
    .from(bookCollaborators)
    .where(and(eq(bookCollaborators.bookId, bookId), eq(bookCollaborators.userId, userId)));
  return collaborator ?? null;
}

export async function getUserCollaboratorRole(bookId: string, userId: string) {
  const [collaborator] = await db
    .select({ role: bookCollaborators.role })
    .from(bookCollaborators)
    .where(and(eq(bookCollaborators.bookId, bookId), eq(bookCollaborators.userId, userId)));
  return collaborator?.role ?? null;
}

export async function updateCollaborator(id: string, input: Partial<CreateCollaboratorInput>) {
  const [collaborator] = await db
    .update(bookCollaborators)
    .set(input)
    .where(eq(bookCollaborators.id, id))
    .returning();
  return collaborator ?? null;
}

export async function deleteCollaborator(id: string) {
  const [collaborator] = await db
    .delete(bookCollaborators)
    .where(eq(bookCollaborators.id, id))
    .returning();
  return collaborator ?? null;
}

export async function createComment(input: CreateCommentInput) {
  const [comment] = await db.insert(bookComments).values(input).returning();
  return comment;
}

export async function getCommentsForChapter(chapterId: string) {
  return db
    .select()
    .from(bookComments)
    .where(eq(bookComments.chapterId, chapterId))
    .orderBy(asc(bookComments.createdAt));
}

export async function updateComment(id: string, userId: string, text: string) {
  const [comment] = await db
    .update(bookComments)
    .set({ text, updatedAt: new Date() })
    .where(and(eq(bookComments.id, id), eq(bookComments.userId, userId)))
    .returning();
  return comment ?? null;
}

export async function deleteComment(id: string, userId: string) {
  const [comment] = await db
    .delete(bookComments)
    .where(and(eq(bookComments.id, id), eq(bookComments.userId, userId)))
    .returning();
  return comment ?? null;
}

export async function upsertReadingProgress(input: CreateProgressInput) {
  const existing = await db
    .select()
    .from(bookReadingProgress)
    .where(
      and(
        eq(bookReadingProgress.userId, input.userId),
        eq(bookReadingProgress.bookId, input.bookId),
      ),
    )
    .then((rows) => rows[0] ?? null);

  if (existing) {
    const [progress] = await db
      .update(bookReadingProgress)
      .set({
        chapterId: input.chapterId,
        scrollPosition: input.scrollPosition,
        percentage: input.percentage,
        updatedAt: new Date(),
      })
      .where(eq(bookReadingProgress.id, existing.id))
      .returning();
    return progress;
  }

  const [progress] = await db.insert(bookReadingProgress).values(input).returning();
  return progress;
}

export async function getReadingProgress(userId: string, bookId: string) {
  const [progress] = await db
    .select()
    .from(bookReadingProgress)
    .where(and(eq(bookReadingProgress.userId, userId), eq(bookReadingProgress.bookId, bookId)));
  return progress ?? null;
}

export async function getRecentReadingProgress(userId: string, limit = 5) {
  return db
    .select()
    .from(bookReadingProgress)
    .where(eq(bookReadingProgress.userId, userId))
    .orderBy(desc(bookReadingProgress.updatedAt))
    .limit(limit);
}

export async function createBookmark(input: CreateBookmarkInput) {
  const [bookmark] = await db.insert(bookBookmarks).values(input).returning();
  return bookmark;
}

export async function getBookmarks(bookId: string, userId: string) {
  return db
    .select()
    .from(bookBookmarks)
    .where(and(eq(bookBookmarks.bookId, bookId), eq(bookBookmarks.userId, userId)))
    .orderBy(desc(bookBookmarks.createdAt));
}

export async function deleteBookmark(id: string, userId: string) {
  const [bookmark] = await db
    .delete(bookBookmarks)
    .where(and(eq(bookBookmarks.id, id), eq(bookBookmarks.userId, userId)))
    .returning();
  return bookmark ?? null;
}

export async function createHighlight(input: CreateHighlightInput) {
  const [highlight] = await db.insert(bookHighlights).values(input).returning();
  return highlight;
}

export async function getHighlights(bookId: string, userId: string) {
  return db
    .select()
    .from(bookHighlights)
    .where(and(eq(bookHighlights.bookId, bookId), eq(bookHighlights.userId, userId)))
    .orderBy(desc(bookHighlights.createdAt));
}

export async function updateHighlight(id: string, userId: string, input: Partial<CreateHighlightInput>) {
  const [highlight] = await db
    .update(bookHighlights)
    .set(input)
    .where(and(eq(bookHighlights.id, id), eq(bookHighlights.userId, userId)))
    .returning();
  return highlight ?? null;
}

export async function deleteHighlight(id: string, userId: string) {
  const [highlight] = await db
    .delete(bookHighlights)
    .where(and(eq(bookHighlights.id, id), eq(bookHighlights.userId, userId)))
    .returning();
  return highlight ?? null;
}

export async function searchBooks(
  userId: string,
  query: string,
  opts: { limit?: number; offset?: number } = {},
) {
  const conditions: SQL[] = [
    eq(books.userId, userId),
    isNull(books.deletedAt),
    sql`to_tsvector('english', ${books.title} || ' ' || coalesce(${books.description}, '')) @@ plainto_tsquery('english', ${query})`,
  ];

  const bookResults = await db
    .select()
    .from(books)
    .where(and(...conditions))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);

  const chapterConditions: SQL[] = [
    sql`to_tsvector('english', ${bookChapters.title} || ' ' || coalesce(${bookChapters.content}::text, '')) @@ plainto_tsquery('english', ${query})`,
  ];

  const chapterResults = await db
    .select({
      chapter: bookChapters,
      book: books,
    })
    .from(bookChapters)
    .innerJoin(books, eq(bookChapters.bookId, books.id))
    .where(and(eq(books.userId, userId), isNull(books.deletedAt), ...chapterConditions))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);

  return { books: bookResults, chapters: chapterResults };
}
