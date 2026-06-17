import { db } from "@/core/database";
import { eq, and, isNull, desc, asc, gte, lte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  readingItems,
  readingAnnotations,
  readingNotes,
  readingSessions,
} from "./schema";

// ─── Types ────────────────────────────────────────────────────────

export type ReadingItem = typeof readingItems.$inferSelect;
export type ReadingAnnotation = typeof readingAnnotations.$inferSelect;
export type ReadingNote = typeof readingNotes.$inferSelect;
export type ReadingSession = typeof readingSessions.$inferSelect;

export type CreateItemInput = typeof readingItems.$inferInsert;
export type CreateAnnotationInput = typeof readingAnnotations.$inferInsert;
export type CreateNoteInput = typeof readingNotes.$inferInsert;
export type CreateSessionInput = typeof readingSessions.$inferInsert;

// ─── Items ────────────────────────────────────────────────────────

export async function createItem(input: CreateItemInput) {
  const [item] = await db.insert(readingItems).values(input).returning();
  return item;
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
) {
  const conditions: SQL[] = [
    eq(readingItems.userId, userId),
    isNull(readingItems.deletedAt),
  ];

  if (opts.type) conditions.push(eq(readingItems.type, opts.type as never));
  if (opts.status) conditions.push(eq(readingItems.status, opts.status as never));
  if (opts.favorites) conditions.push(eq(readingItems.isFavorited, true));
  if (opts.tags && opts.tags.length > 0) {
    conditions.push(sql`${readingItems.tags} && ${sql`ARRAY[${sql.join(opts.tags.map((t) => sql`${t}`), sql`, `)}]::text[]`}`);
  }
  if (opts.search) {
    conditions.push(
      sql`to_tsvector('english', ${readingItems.title}) @@ plainto_tsquery('english', ${opts.search})`,
    );
  }
  if (opts.dateFrom) conditions.push(gte(readingItems.createdAt, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(readingItems.createdAt, new Date(opts.dateTo)));

  const orderCol = opts.sortBy
    ? readingItems[opts.sortBy]
    : readingItems.createdAt;
  const orderFn = opts.sortOrder === "asc" ? asc : desc;

  return db
    .select()
    .from(readingItems)
    .where(and(...conditions))
    .orderBy(desc(readingItems.isFavorited), orderFn(orderCol))
    .limit(opts.limit ?? 100)
    .offset(opts.offset ?? 0);
}

export async function getItemById(id: string, userId: string) {
  const [item] = await db
    .select()
    .from(readingItems)
    .where(
      and(eq(readingItems.id, id), eq(readingItems.userId, userId), isNull(readingItems.deletedAt)),
    );
  return item ?? null;
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>) {
  const [item] = await db
    .update(readingItems)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(eq(readingItems.id, id), eq(readingItems.userId, userId), isNull(readingItems.deletedAt)),
    )
    .returning();
  return item ?? null;
}

export async function deleteItem(id: string, userId: string) {
  const [item] = await db
    .update(readingItems)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(readingItems.id, id), eq(readingItems.userId, userId), isNull(readingItems.deletedAt)))
    .returning();
  return item ?? null;
}

export async function getDashboardStats(userId: string) {
  const items = await db
    .select({
      type: readingItems.type,
      status: readingItems.status,
      count: sql<number>`count(*)`,
      pages: sql<number>`sum(${readingItems.pageCount})`,
      rating: sql<number>`avg(${readingItems.rating})`,
    })
    .from(readingItems)
    .where(and(eq(readingItems.userId, userId), isNull(readingItems.deletedAt)))
    .groupBy(readingItems.type, readingItems.status);

  const annotations = await db
    .select({ count: sql<number>`count(*)` })
    .from(readingAnnotations)
    .where(eq(readingAnnotations.userId, userId))
    .then((r) => Number(r[0]?.count ?? 0));

  const sessions = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(extract(epoch from (${readingSessions.endTime} - ${readingSessions.startTime})) / 60), 0)`,
      pagesRead: sql<number>`coalesce(sum(${readingSessions.pagesRead}), 0)`,
    })
    .from(readingSessions)
    .where(eq(readingSessions.userId, userId))
    .then((r) => r[0] ?? { totalMinutes: 0, pagesRead: 0 });

  const currentlyReading = await db
    .select({ count: sql<number>`count(*)` })
    .from(readingItems)
    .where(
      and(
        eq(readingItems.userId, userId),
        eq(readingItems.status, "reading"),
        isNull(readingItems.deletedAt),
      ),
    )
    .then((r) => Number(r[0]?.count ?? 0));

  return { items, annotations, sessions, currentlyReading };
}

// ─── Annotations ──────────────────────────────────────────────────

export async function createAnnotation(input: CreateAnnotationInput) {
  const [a] = await db.insert(readingAnnotations).values(input).returning();
  return a;
}

export async function getAnnotationsForUser(
  userId: string,
  opts: { readingItemId?: string; type?: string; isFavorited?: boolean; search?: string } = {},
) {
  const conditions: SQL[] = [eq(readingAnnotations.userId, userId)];
  if (opts.readingItemId) conditions.push(eq(readingAnnotations.readingItemId, opts.readingItemId));
  if (opts.type) conditions.push(eq(readingAnnotations.type, opts.type as never));
  if (opts.isFavorited) conditions.push(eq(readingAnnotations.isFavorited, true));
  if (opts.search) {
    conditions.push(
      sql`to_tsvector('english', ${readingAnnotations.text}) @@ plainto_tsquery('english', ${opts.search})`,
    );
  }
  return db
    .select()
    .from(readingAnnotations)
    .where(and(...conditions))
    .orderBy(desc(readingAnnotations.createdAt));
}

export async function updateAnnotation(id: string, userId: string, input: Partial<CreateAnnotationInput>) {
  const [a] = await db
    .update(readingAnnotations)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(readingAnnotations.id, id), eq(readingAnnotations.userId, userId)))
    .returning();
  return a ?? null;
}

export async function deleteAnnotation(id: string, userId: string) {
  const [a] = await db
    .delete(readingAnnotations)
    .where(and(eq(readingAnnotations.id, id), eq(readingAnnotations.userId, userId)))
    .returning();
  return a ?? null;
}

// ─── Notes ────────────────────────────────────────────────────────

export async function createNote(input: CreateNoteInput) {
  const [n] = await db.insert(readingNotes).values(input).returning();
  return n;
}

export async function getNotesForUser(
  userId: string,
  opts: { readingItemId?: string; search?: string } = {},
) {
  const conditions: SQL[] = [eq(readingNotes.userId, userId), isNull(readingNotes.deletedAt)];
  if (opts.readingItemId) conditions.push(eq(readingNotes.readingItemId, opts.readingItemId));
  if (opts.search) {
    conditions.push(
      sql`to_tsvector('english', ${readingNotes.title}) @@ plainto_tsquery('english', ${opts.search})`,
    );
  }
  return db
    .select()
    .from(readingNotes)
    .where(and(...conditions))
    .orderBy(desc(readingNotes.createdAt));
}

export async function updateNote(id: string, userId: string, input: Partial<CreateNoteInput>) {
  const [n] = await db
    .update(readingNotes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(readingNotes.id, id), eq(readingNotes.userId, userId), isNull(readingNotes.deletedAt)))
    .returning();
  return n ?? null;
}

export async function deleteNote(id: string, userId: string) {
  const [n] = await db
    .update(readingNotes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(readingNotes.id, id), eq(readingNotes.userId, userId), isNull(readingNotes.deletedAt)))
    .returning();
  return n ?? null;
}

// ─── Sessions ─────────────────────────────────────────────────────

export async function createSession(input: CreateSessionInput) {
  const [s] = await db.insert(readingSessions).values(input).returning();
  return s;
}

export async function getSessionsForUser(
  userId: string,
  opts: { readingItemId?: string; dateFrom?: string; dateTo?: string } = {},
) {
  const conditions: SQL[] = [eq(readingSessions.userId, userId)];
  if (opts.readingItemId) conditions.push(eq(readingSessions.readingItemId, opts.readingItemId));
  if (opts.dateFrom) conditions.push(gte(readingSessions.startTime, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(readingSessions.startTime, new Date(opts.dateTo)));
  return db
    .select()
    .from(readingSessions)
    .where(and(...conditions))
    .orderBy(desc(readingSessions.startTime));
}

export async function updateSession(id: string, userId: string, input: Partial<CreateSessionInput>) {
  const [s] = await db
    .update(readingSessions)
    .set(input)
    .where(and(eq(readingSessions.id, id), eq(readingSessions.userId, userId)))
    .returning();
  return s ?? null;
}

export async function deleteSession(id: string, userId: string) {
  const [s] = await db
    .delete(readingSessions)
    .where(and(eq(readingSessions.id, id), eq(readingSessions.userId, userId)))
    .returning();
  return s ?? null;
}
