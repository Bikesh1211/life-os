import { db } from "@/core/database";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {
  moviesMedia, moviesPeople,
  movieFavorites, movieRatings, movieWatchlist,
  movieMemories, movieQuotes,
  movieCollections, movieCollectionItems,
} from "./schema";

// === REFERENCE DATA ===
export async function upsertMedia(input: typeof moviesMedia.$inferInsert) {
  const existing = await db.select().from(moviesMedia).where(eq(moviesMedia.tmdbId, input.tmdbId)).limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(moviesMedia).set({ ...input, updatedAt: new Date() }).where(eq(moviesMedia.tmdbId, input.tmdbId)).returning();
    return updated;
  }
  const [created] = await db.insert(moviesMedia).values(input).returning();
  return created;
}

export async function upsertPerson(input: typeof moviesPeople.$inferInsert) {
  const existing = await db.select().from(moviesPeople).where(eq(moviesPeople.tmdbId, input.tmdbId)).limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(moviesPeople).set({ ...input, updatedAt: new Date() }).where(eq(moviesPeople.tmdbId, input.tmdbId)).returning();
    return updated;
  }
  const [created] = await db.insert(moviesPeople).values(input).returning();
  return created;
}

export async function getMediaByTmdbId(tmdbId: string) {
  const [media] = await db.select().from(moviesMedia).where(eq(moviesMedia.tmdbId, tmdbId)).limit(1);
  return media ?? null;
}

export async function getPersonByTmdbId(tmdbId: string) {
  const [person] = await db.select().from(moviesPeople).where(eq(moviesPeople.tmdbId, tmdbId)).limit(1);
  return person ?? null;
}

export async function searchLocalMedia(query: string, limit = 10) {
  return db.select().from(moviesMedia).where(sql`LOWER(${moviesMedia.title}) LIKE ${`%${query.toLowerCase()}%`}`).limit(limit);
}

export async function searchLocalPeople(query: string, limit = 10) {
  return db.select().from(moviesPeople).where(sql`LOWER(${moviesPeople.name}) LIKE ${`%${query.toLowerCase()}%`}`).limit(limit);
}

// === FAVORITES ===
export async function addFavorite(userId: string, mediaId: string) {
  const [fav] = await db.insert(movieFavorites).values({ userId, mediaId }).returning();
  return fav;
}

export async function removeFavorite(userId: string, mediaId: string) {
  const [fav] = await db.delete(movieFavorites).where(and(eq(movieFavorites.userId, userId), eq(movieFavorites.mediaId, mediaId))).returning();
  return fav ?? null;
}

export async function getFavorites(userId: string) {
  return db.select().from(movieFavorites).where(eq(movieFavorites.userId, userId)).orderBy(desc(movieFavorites.addedAt));
}

export async function updateFavorite(id: string, userId: string, input: Partial<typeof movieFavorites.$inferInsert>) {
  const [fav] = await db.update(movieFavorites).set(input).where(and(eq(movieFavorites.id, id), eq(movieFavorites.userId, userId))).returning();
  return fav;
}

// === RATINGS ===
export async function addRating(userId: string, mediaId: string, score: number, review?: string) {
  const [rating] = await db.insert(movieRatings).values({ userId, mediaId, score, review: review ?? null }).returning();
  return rating;
}

export async function getRatings(userId: string) {
  return db.select().from(movieRatings).where(eq(movieRatings.userId, userId)).orderBy(desc(movieRatings.createdAt));
}

export async function getRatingForMedia(userId: string, mediaId: string) {
  const [rating] = await db.select().from(movieRatings).where(and(eq(movieRatings.userId, userId), eq(movieRatings.mediaId, mediaId))).limit(1);
  return rating ?? null;
}

// === WATCHLIST ===
export async function addToWatchlist(input: typeof movieWatchlist.$inferInsert) {
  const [item] = await db.insert(movieWatchlist).values(input).returning();
  return item;
}

export async function updateWatchlistItem(id: string, userId: string, input: Partial<typeof movieWatchlist.$inferInsert>) {
  const [item] = await db.update(movieWatchlist).set({ ...input, updatedAt: new Date() }).where(and(eq(movieWatchlist.id, id), eq(movieWatchlist.userId, userId))).returning();
  return item;
}

export async function removeFromWatchlist(id: string, userId: string) {
  const [item] = await db.delete(movieWatchlist).where(and(eq(movieWatchlist.id, id), eq(movieWatchlist.userId, userId))).returning();
  return item ?? null;
}

export async function getWatchlist(userId: string) {
  return db.select().from(movieWatchlist).where(eq(movieWatchlist.userId, userId)).orderBy(desc(movieWatchlist.createdAt));
}

export async function getWatchlistByStatus(userId: string, status: "plan_to_watch" | "watching" | "completed" | "dropped" | "rewatching") {
  return db.select().from(movieWatchlist).where(and(eq(movieWatchlist.userId, userId), eq(movieWatchlist.status, status))).orderBy(desc(movieWatchlist.updatedAt));
}

// === MEMORIES ===
export async function createMemory(input: typeof movieMemories.$inferInsert) {
  const [memory] = await db.insert(movieMemories).values(input).returning();
  return memory;
}

export async function getMemories(userId: string, limit = 50, offset = 0) {
  return db.select().from(movieMemories).where(eq(movieMemories.userId, userId)).orderBy(desc(movieMemories.watchDate)).limit(limit).offset(offset);
}

export async function getMemoryById(id: string, userId: string) {
  const [memory] = await db.select().from(movieMemories).where(and(eq(movieMemories.id, id), eq(movieMemories.userId, userId))).limit(1);
  return memory ?? null;
}

export async function updateMemory(id: string, userId: string, input: Partial<typeof movieMemories.$inferInsert>) {
  const [memory] = await db.update(movieMemories).set({ ...input, updatedAt: new Date() }).where(and(eq(movieMemories.id, id), eq(movieMemories.userId, userId))).returning();
  return memory;
}

export async function deleteMemory(id: string, userId: string) {
  const [memory] = await db.delete(movieMemories).where(and(eq(movieMemories.id, id), eq(movieMemories.userId, userId))).returning();
  return memory ?? null;
}

export async function getMemoriesByDateRange(userId: string, dateFrom: Date, dateTo: Date) {
  return db.select().from(movieMemories).where(and(eq(movieMemories.userId, userId), sql`${movieMemories.watchDate} >= ${dateFrom}`, sql`${movieMemories.watchDate} <= ${dateTo}`)).orderBy(desc(movieMemories.watchDate));
}

export async function getMemoriesOnThisDay(userId: string, month: number, day: number) {
  return db.select().from(movieMemories).where(and(eq(movieMemories.userId, userId), sql`EXTRACT(MONTH FROM ${movieMemories.watchDate}) = ${month}`, sql`EXTRACT(DAY FROM ${movieMemories.watchDate}) = ${day}`)).orderBy(desc(movieMemories.createdAt));
}

// === QUOTES ===
export async function createQuote(input: typeof movieQuotes.$inferInsert) {
  const [quote] = await db.insert(movieQuotes).values(input).returning();
  return quote;
}

export async function getQuotes(userId: string) {
  return db.select().from(movieQuotes).where(eq(movieQuotes.userId, userId)).orderBy(desc(movieQuotes.createdAt));
}

export async function getQuoteById(id: string, userId: string) {
  const [quote] = await db.select().from(movieQuotes).where(and(eq(movieQuotes.id, id), eq(movieQuotes.userId, userId))).limit(1);
  return quote ?? null;
}

export async function deleteQuote(id: string, userId: string) {
  const [quote] = await db.delete(movieQuotes).where(and(eq(movieQuotes.id, id), eq(movieQuotes.userId, userId))).returning();
  return quote ?? null;
}

// === COLLECTIONS ===
export async function createCollection(input: typeof movieCollections.$inferInsert) {
  const [c] = await db.insert(movieCollections).values(input).returning();
  return c;
}

export async function getCollections(userId: string) {
  return db.select().from(movieCollections).where(eq(movieCollections.userId, userId)).orderBy(desc(movieCollections.createdAt));
}

export async function getCollectionById(id: string, userId: string) {
  const [c] = await db.select().from(movieCollections).where(and(eq(movieCollections.id, id), eq(movieCollections.userId, userId))).limit(1);
  return c ?? null;
}

export async function updateCollection(id: string, userId: string, input: Partial<typeof movieCollections.$inferInsert>) {
  const [c] = await db.update(movieCollections).set({ ...input, updatedAt: new Date() }).where(and(eq(movieCollections.id, id), eq(movieCollections.userId, userId))).returning();
  return c;
}

export async function deleteCollection(id: string, userId: string) {
  const [c] = await db.delete(movieCollections).where(and(eq(movieCollections.id, id), eq(movieCollections.userId, userId))).returning();
  return c ?? null;
}

export async function addCollectionItem(collectionId: string, mediaId: string, position = 0) {
  const [item] = await db.insert(movieCollectionItems).values({ collectionId, mediaId, position }).returning();
  return item;
}

export async function getCollectionItems(collectionId: string) {
  return db.select().from(movieCollectionItems).where(eq(movieCollectionItems.collectionId, collectionId)).orderBy(movieCollectionItems.position);
}

export async function removeCollectionItem(id: string) {
  const [item] = await db.delete(movieCollectionItems).where(eq(movieCollectionItems.id, id)).returning();
  return item ?? null;
}

// === DASHBOARD / STATS ===
export async function getDashboardStats(userId: string) {
  const [favCount] = await db.select({ count: sql<number>`count(*)` }).from(movieFavorites).where(eq(movieFavorites.userId, userId));
  const [memCount] = await db.select({ count: sql<number>`count(*)` }).from(movieMemories).where(eq(movieMemories.userId, userId));
  const [watchCount] = await db.select({ count: sql<number>`count(*)` }).from(movieWatchlist).where(and(eq(movieWatchlist.userId, userId), eq(movieWatchlist.status, "completed")));
  const [quoteCount] = await db.select({ count: sql<number>`count(*)` }).from(movieQuotes).where(eq(movieQuotes.userId, userId));
  const [colCount] = await db.select({ count: sql<number>`count(*)` }).from(movieCollections).where(eq(movieCollections.userId, userId));

  return {
    totalFavorites: Number(favCount.count),
    totalMemories: Number(memCount.count),
    totalCompleted: Number(watchCount.count),
    totalQuotes: Number(quoteCount.count),
    totalCollections: Number(colCount.count),
  };
}

export async function getMoviesWatchedPerMonth(userId: string) {
  return db.select({
    month: sql<string>`to_char(${movieMemories.watchDate}, 'YYYY-MM')`,
    count: sql<number>`count(*)`,
  }).from(movieMemories).where(and(eq(movieMemories.userId, userId), sql`${movieMemories.watchDate} IS NOT NULL`)).groupBy(sql`to_char(${movieMemories.watchDate}, 'YYYY-MM')`).orderBy(sql`to_char(${movieMemories.watchDate}, 'YYYY-MM')`);
}
