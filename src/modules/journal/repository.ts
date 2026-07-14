import { db } from "@/core/database";
import {
  journalEntries,
  journalVersions,
  journalBookmarks,
  journalHighlights,
  journalWritingSessions,
  type moodEnum,
} from "./schema";
import { eq, and, isNull, desc, asc, sql, gte, lte } from "drizzle-orm";

export type JournalEntry = typeof journalEntries.$inferSelect;

export type CreateJournalEntryInput = {
  userId: string;
  title: string;
  content?: string;
  mood?: typeof moodEnum.enumValues[number];
  tags?: string[];
  reflectionScore?: number;
  isPinned?: boolean;
  isPrivate?: boolean;
  eventDate?: Date;
};

export type UpdateJournalEntryInput = Partial<Omit<CreateJournalEntryInput, "userId">>;

export type JournalFilters = {
  search?: string;
  mood?: typeof moodEnum.enumValues[number];
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

export const entryColumns = {
  id: journalEntries.id,
  userId: journalEntries.userId,
  title: journalEntries.title,
  content: journalEntries.content,
  mood: journalEntries.mood,
  tags: journalEntries.tags,
  reflectionScore: journalEntries.reflectionScore,
  isPinned: journalEntries.isPinned,
  isPrivate: journalEntries.isPrivate,
  eventDate: journalEntries.eventDate,
  deletedAt: journalEntries.deletedAt,
  createdAt: journalEntries.createdAt,
  updatedAt: journalEntries.updatedAt,
};

export async function createEntry(input: CreateJournalEntryInput) {
  const [entry] = await db
    .insert(journalEntries)
    .values({
      userId: input.userId,
      title: input.title,
      content: input.content,
      mood: input.mood,
      tags: input.tags ?? [],
      reflectionScore: input.reflectionScore,
      isPinned: input.isPinned ?? false,
      isPrivate: input.isPrivate ?? true,
      eventDate: input.eventDate,
    })
    .returning(entryColumns);
  return entry;
}

export async function getEntryById(id: string, userId: string) {
  const [entry] = await db
    .select(entryColumns)
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
    .limit(1);
  return entry ?? null;
}

export async function getEntriesForUser(userId: string, filters: JournalFilters = {}) {
  const conditions: ReturnType<typeof eq>[] = [
    eq(journalEntries.userId, userId),
    isNull(journalEntries.deletedAt),
  ];

  if (filters.search) {
    conditions.push(
      sql`(to_tsvector('english', ${journalEntries.title}) || to_tsvector('english', ${journalEntries.content}) @@ plainto_tsquery('english', ${filters.search}))`,
    );
  }
  if (filters.mood) {
    conditions.push(eq(journalEntries.mood, filters.mood));
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(sql`${journalEntries.tags} @> ${filters.tags}::text[]`);
  }
  if (filters.dateFrom) {
    conditions.push(gte(journalEntries.createdAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(journalEntries.createdAt, filters.dateTo));
  }
  if (filters.minScore !== undefined) {
    conditions.push(gte(journalEntries.reflectionScore, filters.minScore));
  }
  if (filters.maxScore !== undefined) {
    conditions.push(lte(journalEntries.reflectionScore, filters.maxScore));
  }

  const orderByMap = {
    createdAt: journalEntries.createdAt,
    updatedAt: journalEntries.updatedAt,
    title: journalEntries.title,
  };

  const orderColumn = orderByMap[filters.sortBy ?? "createdAt"];
  const orderDirection = filters.sortOrder === "asc" ? asc : desc;

  const entries = await db
    .select(entryColumns)
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(orderDirection(orderColumn))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  return entries;
}

export async function updateEntry(id: string, userId: string, input: UpdateJournalEntryInput) {
  const [entry] = await db
    .update(journalEntries)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
    .returning(entryColumns);
  return entry ?? null;
}

export async function softDeleteEntry(id: string, userId: string) {
  const [entry] = await db
    .update(journalEntries)
    .set({ deletedAt: new Date() })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
    .returning(entryColumns);
  return entry ?? null;
}

export async function getEntryCountForUser(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)));
  return result?.count ?? 0;
}

export async function getRecentEntriesForUser(userId: string, days: number, limit = 10) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db
    .select(entryColumns)
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt), gte(journalEntries.createdAt, since)))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit);
}

export async function getMoodDistribution(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await db
    .select({
      mood: journalEntries.mood,
      count: sql<number>`count(*)`,
    })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt), gte(journalEntries.createdAt, since)))
    .groupBy(journalEntries.mood)
    .orderBy(desc(sql`count(*)`));

  return results;
}

export async function getJournalCoverage(userId: string) {
  const dateCol = sql`COALESCE(${journalEntries.eventDate}, ${journalEntries.createdAt})`;
  const results = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${dateCol})`,
      month: sql<number>`EXTRACT(MONTH FROM ${dateCol})`,
    })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${dateCol})`,
      sql`EXTRACT(MONTH FROM ${dateCol})`,
    )
    .orderBy(
      asc(sql`EXTRACT(YEAR FROM ${dateCol})`),
      asc(sql`EXTRACT(MONTH FROM ${dateCol})`),
    );
  return results.map((r) => ({ year: r.year, month: r.month }));
}

export async function getCommonTags(userId: string, limit = 10) {
  const results = await db
    .select({
      tag: sql<string>`unnest(${journalEntries.tags})`,
      count: sql<number>`count(*)`,
    })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), isNull(journalEntries.deletedAt)))
    .groupBy(sql`unnest(${journalEntries.tags})`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return results;
}

// ── Journal Versions ──

export type JournalVersion = typeof journalVersions.$inferSelect;

export async function createVersion(input: {
  entryId: string;
  content: string;
  title: string;
  wordCount: number;
  note?: string;
}) {
  const [version] = await db
    .insert(journalVersions)
    .values(input)
    .returning();
  return version;
}

export async function getEntryVersions(entryId: string) {
  return db
    .select()
    .from(journalVersions)
    .where(eq(journalVersions.entryId, entryId))
    .orderBy(desc(journalVersions.createdAt));
}

export async function getVersionById(id: string) {
  const [version] = await db
    .select()
    .from(journalVersions)
    .where(eq(journalVersions.id, id))
    .limit(1);
  return version ?? null;
}

// ── Journal Bookmarks ──

export type JournalBookmark = typeof journalBookmarks.$inferSelect;

export async function createBookmark(input: {
  userId: string;
  entryId: string;
  position: unknown;
  excerpt?: string;
  label?: string;
  color?: string;
}) {
  const [bookmark] = await db
    .insert(journalBookmarks)
    .values({
      userId: input.userId,
      entryId: input.entryId,
      position: input.position as Record<string, unknown>,
      excerpt: input.excerpt,
      label: input.label,
      color: input.color ?? "yellow",
    })
    .returning();
  return bookmark;
}

export async function getEntryBookmarks(userId: string, entryId: string) {
  return db
    .select()
    .from(journalBookmarks)
    .where(and(eq(journalBookmarks.userId, userId), eq(journalBookmarks.entryId, entryId)))
    .orderBy(desc(journalBookmarks.createdAt));
}

export async function deleteBookmark(id: string, userId: string) {
  const [bookmark] = await db
    .delete(journalBookmarks)
    .where(and(eq(journalBookmarks.id, id), eq(journalBookmarks.userId, userId)))
    .returning();
  return bookmark ?? null;
}

// ── Journal Highlights ──

export type JournalHighlight = typeof journalHighlights.$inferSelect;

export async function createHighlight(input: {
  userId: string;
  entryId: string;
  position: unknown;
  text: string;
  color?: string;
  note?: string;
}) {
  const [highlight] = await db
    .insert(journalHighlights)
    .values({
      userId: input.userId,
      entryId: input.entryId,
      position: input.position as Record<string, unknown>,
      text: input.text,
      color: input.color ?? "yellow",
      note: input.note,
    })
    .returning();
  return highlight;
}

export async function getEntryHighlights(userId: string, entryId: string) {
  return db
    .select()
    .from(journalHighlights)
    .where(and(eq(journalHighlights.userId, userId), eq(journalHighlights.entryId, entryId)))
    .orderBy(desc(journalHighlights.createdAt));
}

export async function updateHighlight(id: string, userId: string, input: { color?: string; note?: string }) {
  const [highlight] = await db
    .update(journalHighlights)
    .set(input)
    .where(and(eq(journalHighlights.id, id), eq(journalHighlights.userId, userId)))
    .returning();
  return highlight ?? null;
}

export async function deleteHighlight(id: string, userId: string) {
  const [highlight] = await db
    .delete(journalHighlights)
    .where(and(eq(journalHighlights.id, id), eq(journalHighlights.userId, userId)))
    .returning();
  return highlight ?? null;
}

// ── Journal Writing Sessions ──

export type JournalWritingSession = typeof journalWritingSessions.$inferSelect;

export async function createWritingSession(input: {
  userId: string;
  entryId: string;
  startedAt: Date;
}) {
  const [session] = await db
    .insert(journalWritingSessions)
    .values(input)
    .returning();
  return session;
}

export async function endWritingSession(id: string, userId: string, endedAt: Date, wordsAdded: number) {
  const existing = await db
    .select({ startedAt: journalWritingSessions.startedAt })
    .from(journalWritingSessions)
    .where(and(eq(journalWritingSessions.id, id), eq(journalWritingSessions.userId, userId)))
    .limit(1);
  if (!existing.length) return null;

  const durationSeconds = Math.round((endedAt.getTime() - existing[0].startedAt.getTime()) / 1000);
  const [session] = await db
    .update(journalWritingSessions)
    .set({ endedAt, durationSeconds, wordsAdded })
    .where(and(eq(journalWritingSessions.id, id), eq(journalWritingSessions.userId, userId)))
    .returning();
  return session ?? null;
}

export async function getEntrySessions(entryId: string, userId: string) {
  return db
    .select()
    .from(journalWritingSessions)
    .where(and(eq(journalWritingSessions.entryId, entryId), eq(journalWritingSessions.userId, userId)))
    .orderBy(desc(journalWritingSessions.startedAt));
}

export async function getSessionStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [todayStats] = await db
    .select({
      totalSessions: sql<number>`count(*)`,
      totalDuration: sql<number>`coalesce(sum(${journalWritingSessions.durationSeconds}), 0)`,
      totalWords: sql<number>`coalesce(sum(${journalWritingSessions.wordsAdded}), 0)`,
    })
    .from(journalWritingSessions)
    .where(and(eq(journalWritingSessions.userId, userId), gte(journalWritingSessions.startedAt, today)));

  const [weekStats] = await db
    .select({
      totalSessions: sql<number>`count(*)`,
      totalDuration: sql<number>`coalesce(sum(${journalWritingSessions.durationSeconds}), 0)`,
      totalWords: sql<number>`coalesce(sum(${journalWritingSessions.wordsAdded}), 0)`,
    })
    .from(journalWritingSessions)
    .where(and(eq(journalWritingSessions.userId, userId), gte(journalWritingSessions.startedAt, weekStart)));

  return { today: todayStats, week: weekStats };
}
