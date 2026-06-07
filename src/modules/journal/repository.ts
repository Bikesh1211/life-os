import { db } from "@/core/database";
import { journalEntries, type moodEnum } from "./schema";
import { eq, and, isNull, desc, asc, sql, gte, lte, inArray } from "drizzle-orm";

export type JournalEntry = typeof journalEntries.$inferSelect;

export type CreateJournalEntryInput = {
  userId: string;
  title: string;
  content?: string;
  mood?: typeof moodEnum.enumValues[number];
  tags?: string[];
  reflectionScore?: number;
  isPrivate?: boolean;
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
  isPrivate: journalEntries.isPrivate,
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
      isPrivate: input.isPrivate ?? true,
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
