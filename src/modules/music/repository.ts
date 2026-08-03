import { db } from "@/core/database";
import { eq, and, isNull, isNotNull, desc, asc, sql, gte, lte, inArray, ne } from "drizzle-orm";
import {
  musicArtists,
  musicAlbums,
  musicTracks,
  musicListeningHistory,
  musicJournal,
  musicMemories,
  musicRatings,
  musicFavorites,
  musicCollections,
  musicCollectionItems,
  musicGoalConfig,
  musicNotes,
  musicJournalSongs,
  musicMoodEntries,
  musicLibrary,
  musicMemorySongs,
} from "./schema";

// ─── Types ────────────────────────────────────────────────────────

export type Artist = typeof musicArtists.$inferSelect;
export type Album = typeof musicAlbums.$inferSelect;
export type Track = typeof musicTracks.$inferSelect;
export type ListeningEntry = typeof musicListeningHistory.$inferSelect;
export type MusicJournalEntry = typeof musicJournal.$inferSelect;
export type Memory = typeof musicMemories.$inferSelect;
export type Rating = typeof musicRatings.$inferSelect;
export type Favorite = typeof musicFavorites.$inferSelect;
export type Collection = typeof musicCollections.$inferSelect;
export type CollectionItem = typeof musicCollectionItems.$inferSelect;
export type GoalConfig = typeof musicGoalConfig.$inferSelect;

export type CreateArtistInput = typeof musicArtists.$inferInsert;
export type CreateAlbumInput = typeof musicAlbums.$inferInsert;
export type CreateTrackInput = typeof musicTracks.$inferInsert;
export type CreateListeningInput = typeof musicListeningHistory.$inferInsert;
export type CreateJournalInput = typeof musicJournal.$inferInsert;
export type CreateMemoryInput = typeof musicMemories.$inferInsert;
export type CreateRatingInput = typeof musicRatings.$inferInsert;
export type CreateFavoriteInput = typeof musicFavorites.$inferInsert;
export type CreateCollectionInput = typeof musicCollections.$inferInsert;
export type CreateCollectionItemInput = typeof musicCollectionItems.$inferInsert;
export type CreateGoalConfigInput = typeof musicGoalConfig.$inferInsert;

export type LibraryEntry = typeof musicLibrary.$inferSelect;
export type CreateLibraryInput = typeof musicLibrary.$inferInsert;

export type MemorySong = typeof musicMemorySongs.$inferSelect;
export type CreateMemorySongInput = typeof musicMemorySongs.$inferInsert;

// ─── Batch entity fetching ─────────────────────────────────────────

export async function getArtistsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(musicArtists).where(inArray(musicArtists.id, ids));
}

export async function getAlbumsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(musicAlbums).where(inArray(musicAlbums.id, ids));
}

export async function getTracksByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db
    .select({
      id: musicTracks.id,
      title: musicTracks.title,
      albumId: musicTracks.albumId,
      artistId: musicTracks.artistId,
      duration: musicTracks.duration,
      albumCoverArtUrl: musicAlbums.coverArtUrl,
      albumTitle: musicAlbums.title,
    })
    .from(musicTracks)
    .leftJoin(musicAlbums, eq(musicTracks.albumId, musicAlbums.id))
    .where(inArray(musicTracks.id, ids));
}

// ─── Artists ──────────────────────────────────────────────────────

export async function createArtist(input: CreateArtistInput) {
  const [artist] = await db.insert(musicArtists).values(input).returning();
  return artist;
}

export async function getArtistById(id: string) {
  const [artist] = await db.select().from(musicArtists).where(eq(musicArtists.id, id)).limit(1);
  return artist ?? null;
}

export async function getArtistByMusicBrainzId(mbid: string) {
  const [artist] = await db.select().from(musicArtists).where(eq(musicArtists.musicBrainzId, mbid)).limit(1);
  return artist ?? null;
}

export async function getArtistBySpotifyId(spotifyId: string) {
  const [artist] = await db.select().from(musicArtists).where(eq(musicArtists.spotifyId, spotifyId)).limit(1);
  return artist ?? null;
}

export async function upsertArtistBySpotifyId(input: CreateArtistInput) {
  if (!input.spotifyId) return createArtist(input);
  const existing = await getArtistBySpotifyId(input.spotifyId);
  if (existing) {
    const [updated] = await db
      .update(musicArtists)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(musicArtists.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(musicArtists).values(input).returning();
  return created;
}

export async function searchArtistsByName(query: string) {
  return db
    .select()
    .from(musicArtists)
    .where(sql`${musicArtists.name} ILIKE ${`%${query}%`}`)
    .orderBy(musicArtists.name)
    .limit(20);
}

export async function updateArtist(id: string, input: Partial<CreateArtistInput>) {
  const [artist] = await db
    .update(musicArtists)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(musicArtists.id, id))
    .returning();
  return artist ?? null;
}

// ─── Albums ───────────────────────────────────────────────────────

export async function createAlbum(input: CreateAlbumInput) {
  const [album] = await db.insert(musicAlbums).values(input).returning();
  return album;
}

export async function getAlbumById(id: string) {
  const [album] = await db.select().from(musicAlbums).where(eq(musicAlbums.id, id)).limit(1);
  return album ?? null;
}

export async function getAlbumByMusicBrainzId(mbid: string) {
  const [album] = await db.select().from(musicAlbums).where(eq(musicAlbums.musicBrainzId, mbid)).limit(1);
  return album ?? null;
}

export async function getAlbumBySpotifyId(spotifyId: string) {
  const [album] = await db.select().from(musicAlbums).where(eq(musicAlbums.spotifyId, spotifyId)).limit(1);
  return album ?? null;
}

export async function upsertAlbumBySpotifyId(input: CreateAlbumInput) {
  if (!input.spotifyId) return createAlbum(input);
  const existing = await getAlbumBySpotifyId(input.spotifyId);
  if (existing) {
    const [updated] = await db
      .update(musicAlbums)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(musicAlbums.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(musicAlbums).values(input).returning();
  return created;
}

export async function getAlbumsByArtist(artistId: string) {
  return db
    .select()
    .from(musicAlbums)
    .where(eq(musicAlbums.artistId, artistId))
    .orderBy(musicAlbums.releaseDate);
}

export async function searchAlbumsByTitle(query: string) {
  return db
    .select()
    .from(musicAlbums)
    .where(sql`${musicAlbums.title} ILIKE ${`%${query}%`}`)
    .orderBy(musicAlbums.title)
    .limit(20);
}

export async function updateAlbum(id: string, input: Partial<CreateAlbumInput>) {
  const [album] = await db
    .update(musicAlbums)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(musicAlbums.id, id))
    .returning();
  return album ?? null;
}

// ─── Tracks ───────────────────────────────────────────────────────

export async function createTrack(input: CreateTrackInput) {
  const [track] = await db.insert(musicTracks).values(input).returning();
  return track;
}

export async function getTrackById(id: string) {
  const [track] = await db.select().from(musicTracks).where(eq(musicTracks.id, id)).limit(1);
  return track ?? null;
}

export async function getTrackByMusicBrainzId(mbid: string) {
  const [track] = await db.select().from(musicTracks).where(eq(musicTracks.musicBrainzId, mbid)).limit(1);
  return track ?? null;
}

export async function getTrackBySpotifyId(spotifyId: string) {
  const [track] = await db.select().from(musicTracks).where(eq(musicTracks.spotifyId, spotifyId)).limit(1);
  return track ?? null;
}

export async function upsertTrackBySpotifyId(input: CreateTrackInput) {
  if (!input.spotifyId) return createTrack(input);
  const existing = await getTrackBySpotifyId(input.spotifyId);
  if (existing) {
    const [updated] = await db
      .update(musicTracks)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(musicTracks.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(musicTracks).values(input).returning();
  return created;
}

export async function getTracksByAlbum(albumId: string) {
  return db
    .select()
    .from(musicTracks)
    .where(eq(musicTracks.albumId, albumId))
    .orderBy(musicTracks.title);
}

export async function getTracksByArtist(artistId: string) {
  return db
    .select()
    .from(musicTracks)
    .where(eq(musicTracks.artistId, artistId))
    .orderBy(musicTracks.title);
}

export async function searchTracksByTitle(query: string) {
  return db
    .select()
    .from(musicTracks)
    .where(sql`${musicTracks.title} ILIKE ${`%${query}%`}`)
    .orderBy(musicTracks.title)
    .limit(20);
}

export async function updateTrack(id: string, input: Partial<CreateTrackInput>) {
  const [track] = await db
    .update(musicTracks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(musicTracks.id, id))
    .returning();
  return track ?? null;
}

// ─── Listening History ────────────────────────────────────────────

export async function createListeningEntry(input: CreateListeningInput) {
  const [entry] = await db.insert(musicListeningHistory).values(input).returning();
  return entry;
}

export async function getListeningHistory(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(musicListeningHistory)
    .where(eq(musicListeningHistory.userId, userId))
    .orderBy(desc(musicListeningHistory.listenedAt))
    .limit(limit)
    .offset(offset);
}

export async function getListeningHistoryByDateRange(userId: string, start: Date, end: Date) {
  return db
    .select()
    .from(musicListeningHistory)
    .where(
      and(
        eq(musicListeningHistory.userId, userId),
        gte(musicListeningHistory.listenedAt, start),
        lte(musicListeningHistory.listenedAt, end),
      ),
    )
    .orderBy(desc(musicListeningHistory.listenedAt));
}

export async function getListeningHistoryByTrack(userId: string, trackId: string) {
  return db
    .select()
    .from(musicListeningHistory)
    .where(
      and(eq(musicListeningHistory.userId, userId), eq(musicListeningHistory.trackId, trackId)),
    )
    .orderBy(desc(musicListeningHistory.listenedAt));
}

// ─── Journal ──────────────────────────────────────────────────────

export async function createJournalEntry(input: CreateJournalInput) {
  const [entry] = await db.insert(musicJournal).values(input).returning();
  return entry;
}

export async function getJournalEntryById(id: string, userId: string) {
  const [entry] = await db
    .select()
    .from(musicJournal)
    .where(and(eq(musicJournal.id, id), eq(musicJournal.userId, userId)))
    .limit(1);
  return entry ?? null;
}

export async function getJournalEntries(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(musicJournal)
    .where(eq(musicJournal.userId, userId))
    .orderBy(desc(musicJournal.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getJournalEntriesByTrack(userId: string, trackId: string) {
  return db
    .select()
    .from(musicJournal)
    .where(and(eq(musicJournal.userId, userId), eq(musicJournal.trackId, trackId)))
    .orderBy(desc(musicJournal.createdAt));
}

export async function updateJournalEntry(id: string, userId: string, input: Partial<CreateJournalInput>) {
  const [entry] = await db
    .update(musicJournal)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicJournal.id, id), eq(musicJournal.userId, userId)))
    .returning();
  return entry ?? null;
}

export async function deleteJournalEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(musicJournal)
    .where(and(eq(musicJournal.id, id), eq(musicJournal.userId, userId)))
    .returning();
  return entry ?? null;
}

// ─── Memories ─────────────────────────────────────────────────────

export async function createMemory(input: CreateMemoryInput) {
  const [memory] = await db.insert(musicMemories).values(input).returning();
  return memory;
}

export async function getMemories(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(musicMemories)
    .where(eq(musicMemories.userId, userId))
    .orderBy(desc(musicMemories.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getMemoryById(id: string, userId: string) {
  const [memory] = await db
    .select()
    .from(musicMemories)
    .where(and(eq(musicMemories.id, id), eq(musicMemories.userId, userId)))
    .limit(1);
  return memory ?? null;
}

export async function getMemoriesByTrack(userId: string, trackId: string) {
  return db
    .select()
    .from(musicMemories)
    .where(and(eq(musicMemories.userId, userId), eq(musicMemories.trackId, trackId)))
    .orderBy(desc(musicMemories.createdAt));
}

export async function getMemoriesByEvent(userId: string, linkedEventId: string) {
  return db
    .select()
    .from(musicMemories)
    .where(
      and(eq(musicMemories.userId, userId), eq(musicMemories.linkedEventId, linkedEventId)),
    )
    .orderBy(desc(musicMemories.createdAt));
}

export async function deleteMemory(id: string, userId: string) {
  const [memory] = await db
    .delete(musicMemories)
    .where(and(eq(musicMemories.id, id), eq(musicMemories.userId, userId)))
    .returning();
  return memory ?? null;
}

// ─── Ratings ──────────────────────────────────────────────────────

export async function createRating(input: CreateRatingInput) {
  const [rating] = await db.insert(musicRatings).values(input).returning();
  return rating;
}

export async function getRatingByEntity(userId: string, entityType: string, entityId: string) {
  const [rating] = await db
    .select()
    .from(musicRatings)
    .where(
      and(
        eq(musicRatings.userId, userId),
        eq(musicRatings.entityType, entityType),
        eq(musicRatings.entityId, entityId),
      ),
    )
    .limit(1);
  return rating ?? null;
}

export async function getRatingsByUser(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(musicRatings)
    .where(eq(musicRatings.userId, userId))
    .orderBy(desc(musicRatings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getRatingsByType(userId: string, entityType: string) {
  return db
    .select()
    .from(musicRatings)
    .where(and(eq(musicRatings.userId, userId), eq(musicRatings.entityType, entityType)))
    .orderBy(desc(musicRatings.score));
}

export async function updateRating(id: string, userId: string, input: { score?: number; review?: string }) {
  const [rating] = await db
    .update(musicRatings)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicRatings.id, id), eq(musicRatings.userId, userId)))
    .returning();
  return rating ?? null;
}

export async function deleteRating(id: string, userId: string) {
  const [rating] = await db
    .delete(musicRatings)
    .where(and(eq(musicRatings.id, id), eq(musicRatings.userId, userId)))
    .returning();
  return rating ?? null;
}

// ─── Favorites ────────────────────────────────────────────────────

export async function createFavorite(input: CreateFavoriteInput) {
  const [fav] = await db.insert(musicFavorites).values(input).returning();
  return fav;
}

export async function getFavorites(userId: string) {
  return db
    .select()
    .from(musicFavorites)
    .where(eq(musicFavorites.userId, userId))
    .orderBy(desc(musicFavorites.createdAt));
}

export async function getFavoritesByType(userId: string, entityType: string) {
  return db
    .select()
    .from(musicFavorites)
    .where(and(eq(musicFavorites.userId, userId), eq(musicFavorites.entityType, entityType)))
    .orderBy(desc(musicFavorites.createdAt));
}

export async function isFavorite(userId: string, entityType: string, entityId: string) {
  const [fav] = await db
    .select()
    .from(musicFavorites)
    .where(
      and(
        eq(musicFavorites.userId, userId),
        eq(musicFavorites.entityType, entityType),
        eq(musicFavorites.entityId, entityId),
      ),
    )
    .limit(1);
  return !!fav;
}

export async function deleteFavorite(userId: string, entityType: string, entityId: string) {
  const [fav] = await db
    .delete(musicFavorites)
    .where(
      and(
        eq(musicFavorites.userId, userId),
        eq(musicFavorites.entityType, entityType),
        eq(musicFavorites.entityId, entityId),
      ),
    )
    .returning();
  return fav ?? null;
}

// ─── Collections ──────────────────────────────────────────────────

export async function createCollection(input: CreateCollectionInput) {
  const [collection] = await db.insert(musicCollections).values(input).returning();
  return collection;
}

export async function getCollections(userId: string) {
  return db
    .select()
    .from(musicCollections)
    .where(and(eq(musicCollections.userId, userId), isNull(musicCollections.deletedAt)))
    .orderBy(musicCollections.title);
}

export async function getCollectionById(id: string, userId: string) {
  const [collection] = await db
    .select()
    .from(musicCollections)
    .where(
      and(eq(musicCollections.id, id), eq(musicCollections.userId, userId), isNull(musicCollections.deletedAt)),
    )
    .limit(1);
  return collection ?? null;
}

export async function updateCollection(id: string, userId: string, input: Partial<CreateCollectionInput>) {
  const [collection] = await db
    .update(musicCollections)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicCollections.id, id), eq(musicCollections.userId, userId)))
    .returning();
  return collection ?? null;
}

export async function deleteCollection(id: string, userId: string) {
  const [collection] = await db
    .update(musicCollections)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(musicCollections.id, id), eq(musicCollections.userId, userId)))
    .returning();
  return collection ?? null;
}

// ─── Collection Items ─────────────────────────────────────────────

/** Restricts collection-item rows to collections owned by `userId`. */
function collectionOwnedByUser(userId: string) {
  return inArray(
    musicCollectionItems.collectionId,
    db
      .select({ id: musicCollections.id })
      .from(musicCollections)
      .where(eq(musicCollections.userId, userId)),
  );
}

export async function addCollectionItem(input: CreateCollectionItemInput, userId: string) {
  const [collection] = await db
    .select({ id: musicCollections.id })
    .from(musicCollections)
    .where(and(eq(musicCollections.id, input.collectionId), eq(musicCollections.userId, userId)))
    .limit(1);
  if (!collection) return null;

  const [item] = await db.insert(musicCollectionItems).values(input).returning();
  return item;
}

export async function getCollectionItems(collectionId: string, userId: string) {
  return db
    .select()
    .from(musicCollectionItems)
    .where(
      and(eq(musicCollectionItems.collectionId, collectionId), collectionOwnedByUser(userId)),
    )
    .orderBy(musicCollectionItems.position);
}

/**
 * Collections owned by `userId` that contain the given entity. Distinct from
 * getCollectionItems, which lists the contents of one collection.
 */
export async function getCollectionItemsForEntity(
  userId: string,
  entityType: string,
  entityId: string,
) {
  return db
    .select()
    .from(musicCollectionItems)
    .where(
      and(
        eq(musicCollectionItems.entityType, entityType),
        eq(musicCollectionItems.entityId, entityId),
        collectionOwnedByUser(userId),
      ),
    );
}

export async function removeCollectionItem(id: string, userId: string) {
  const [item] = await db
    .delete(musicCollectionItems)
    .where(and(eq(musicCollectionItems.id, id), collectionOwnedByUser(userId)))
    .returning();
  return item ?? null;
}

export async function evaluateSmartFilter(userId: string, filter: Record<string, unknown>) {
  const type = filter.type as string | undefined;

  if (type === "most-listened") {
    const period = (filter.period as string) ?? "month";
    const daysAgo = period === "week" ? 7 : period === "year" ? 365 : 30;
    const since = new Date(Date.now() - daysAgo * 86400000);

    const rows = await db
      .select({
        entityId: musicListeningHistory.trackId,
        count: sql<number>`count(*)`,
      })
      .from(musicListeningHistory)
      .where(
        and(
          eq(musicListeningHistory.userId, userId),
          gte(musicListeningHistory.listenedAt, since),
        ),
      )
      .groupBy(musicListeningHistory.trackId)
      .orderBy(desc(sql`count(*)`))
      .limit((filter.limit as number) ?? 20);

    return rows.filter((r) => r.entityId).map((r) => ({
      entityType: "track" as const,
      entityId: r.entityId!,
    }));
  }

  if (type === "highest-rated") {
    const minScore = (filter.minScore as number) ?? 8;
    const rows = await db
      .select({
        entityType: musicRatings.entityType,
        entityId: musicRatings.entityId,
      })
      .from(musicRatings)
      .where(
        and(
          eq(musicRatings.userId, userId),
          gte(musicRatings.score, minScore),
        ),
      )
      .limit((filter.limit as number) ?? 20);

    return rows;
  }

  return [];
}

export async function reorderCollectionItem(id: string, position: number) {
  const [item] = await db
    .update(musicCollectionItems)
    .set({ position })
    .where(eq(musicCollectionItems.id, id))
    .returning();
  return item ?? null;
}

// ─── Goal Config ──────────────────────────────────────────────────

export async function createGoalConfig(input: CreateGoalConfigInput) {
  const [config] = await db.insert(musicGoalConfig).values(input).returning();
  return config;
}

export async function getGoalConfigs(userId: string) {
  return db
    .select()
    .from(musicGoalConfig)
    .where(eq(musicGoalConfig.userId, userId));
}

export async function getGoalConfigByGoalId(userId: string, goalId: string) {
  const [config] = await db
    .select()
    .from(musicGoalConfig)
    .where(and(eq(musicGoalConfig.userId, userId), eq(musicGoalConfig.goalId, goalId)))
    .limit(1);
  return config ?? null;
}

export async function updateGoalConfig(id: string, userId: string, input: Partial<CreateGoalConfigInput>) {
  const [config] = await db
    .update(musicGoalConfig)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicGoalConfig.id, id), eq(musicGoalConfig.userId, userId)))
    .returning();
  return config ?? null;
}

export async function incrementGoalCount(id: string, userId: string, amount = 1) {
  const [config] = await db
    .update(musicGoalConfig)
    .set({ currentCount: sql`${musicGoalConfig.currentCount} + ${amount}`, updatedAt: new Date() })
    .where(and(eq(musicGoalConfig.id, id), eq(musicGoalConfig.userId, userId)))
    .returning();
  return config ?? null;
}

export async function deleteGoalConfig(id: string, userId: string) {
  const [config] = await db
    .delete(musicGoalConfig)
    .where(and(eq(musicGoalConfig.id, id), eq(musicGoalConfig.userId, userId)))
    .returning();
  return config ?? null;
}

// ─── Analytics Queries ────────────────────────────────────────────

export async function getMostListenedArtists(userId: string, limit = 10) {
  return db
    .select({
      artistId: musicTracks.artistId,
      count: sql<number>`count(*)`,
    })
    .from(musicListeningHistory)
    .innerJoin(musicTracks, eq(musicListeningHistory.trackId, musicTracks.id))
    .where(eq(musicListeningHistory.userId, userId))
    .groupBy(musicTracks.artistId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getListeningStreaks(userId: string, lookbackDays = 400) {
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);
  return db
    .select({
      date: sql<string>`DATE(${musicListeningHistory.listenedAt})`,
      count: sql<number>`count(*)`,
    })
    .from(musicListeningHistory)
    .where(
      and(
        eq(musicListeningHistory.userId, userId),
        gte(musicListeningHistory.listenedAt, since),
      ),
    )
    .groupBy(sql`DATE(${musicListeningHistory.listenedAt})`)
    .orderBy(desc(sql`DATE(${musicListeningHistory.listenedAt})`));
}

export async function getTotalListeningHours(userId: string) {
  const [result] = await db
    .select({
      totalSeconds: sql<number>`COALESCE(SUM(${musicListeningHistory.duration}), 0)`,
    })
    .from(musicListeningHistory)
    .where(eq(musicListeningHistory.userId, userId));
  return (result?.totalSeconds ?? 0) / 3600;
}

export async function getYearlyListeningStats(userId: string, year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${musicListeningHistory.listenedAt})`,
      count: sql<number>`count(*)`,
      totalDuration: sql<number>`COALESCE(SUM(${musicListeningHistory.duration}), 0)`,
    })
    .from(musicListeningHistory)
    .where(
      and(
        eq(musicListeningHistory.userId, userId),
        gte(musicListeningHistory.listenedAt, start),
        lte(musicListeningHistory.listenedAt, end),
      ),
    )
    .groupBy(sql`EXTRACT(MONTH FROM ${musicListeningHistory.listenedAt})`)
    .orderBy(sql`EXTRACT(MONTH FROM ${musicListeningHistory.listenedAt})`);
}

// ─── Notes ─────────────────────────────────────────────────────────

export type MusicNote = typeof musicNotes.$inferSelect;
export type CreateNoteInput = typeof musicNotes.$inferInsert;

export type JournalSong = typeof musicJournalSongs.$inferSelect;
export type CreateJournalSongInput = typeof musicJournalSongs.$inferInsert;

export type MoodEntry = typeof musicMoodEntries.$inferSelect;
export type CreateMoodEntryInput = typeof musicMoodEntries.$inferInsert;

export async function createNote(input: CreateNoteInput) {
  const [note] = await db.insert(musicNotes).values(input).returning();
  return note;
}

export async function getNotesByEntity(userId: string, entityType: string, entityId: string) {
  return db
    .select()
    .from(musicNotes)
    .where(and(eq(musicNotes.userId, userId), eq(musicNotes.entityType, entityType), eq(musicNotes.entityId, entityId), isNull(musicNotes.deletedAt)))
    .orderBy(desc(musicNotes.createdAt));
}

export async function getNoteById(id: string, userId: string) {
  const [note] = await db
    .select()
    .from(musicNotes)
    .where(and(eq(musicNotes.id, id), eq(musicNotes.userId, userId), isNull(musicNotes.deletedAt)))
    .limit(1);
  return note ?? null;
}

export async function updateNote(id: string, userId: string, input: { content: string }) {
  const [note] = await db
    .update(musicNotes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicNotes.id, id), eq(musicNotes.userId, userId)))
    .returning();
  return note ?? null;
}

export async function deleteNote(id: string, userId: string) {
  const [note] = await db
    .update(musicNotes)
    .set({ deletedAt: new Date() })
    .where(and(eq(musicNotes.id, id), eq(musicNotes.userId, userId)))
    .returning();
  return note ?? null;
}

// ─── Journal Songs (junction) ─────────────────────────────────────

export async function addSongToJournal(input: CreateJournalSongInput) {
  const [item] = await db.insert(musicJournalSongs).values(input).returning();
  return item;
}

export async function getJournalSongs(journalId: string) {
  return db
    .select()
    .from(musicJournalSongs)
    .where(eq(musicJournalSongs.journalId, journalId))
    .orderBy(musicJournalSongs.position);
}

export async function removeSongFromJournal(id: string) {
  const [item] = await db.delete(musicJournalSongs).where(eq(musicJournalSongs.id, id)).returning();
  return item ?? null;
}

// ─── Mood Entries ─────────────────────────────────────────────────

export async function createMoodEntry(input: CreateMoodEntryInput) {
  const [entry] = await db.insert(musicMoodEntries).values(input).returning();
  return entry;
}

export async function getMoodEntries(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date; limit?: number; offset?: number },
) {
  const conditions: ReturnType<typeof eq>[] = [eq(musicMoodEntries.userId, userId)];
  if (options?.dateFrom) conditions.push(gte(musicMoodEntries.date, options.dateFrom));
  if (options?.dateTo) conditions.push(lte(musicMoodEntries.date, options.dateTo));

  return db
    .select()
    .from(musicMoodEntries)
    .where(and(...conditions))
    .orderBy(desc(musicMoodEntries.date))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);
}

export async function getMoodAnalytics(userId: string, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db
    .select({
      mood: musicMoodEntries.mood,
      count: sql<number>`count(*)`,
    })
    .from(musicMoodEntries)
    .where(and(eq(musicMoodEntries.userId, userId), gte(musicMoodEntries.date, since)))
    .groupBy(musicMoodEntries.mood)
    .orderBy(sql`count(*) desc`);
}

// ─── Enhanced Memories ────────────────────────────────────────────

export async function updateMemory(
  id: string,
  userId: string,
  input: Partial<CreateMemoryInput>,
) {
  const [memory] = await db
    .update(musicMemories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(musicMemories.id, id), eq(musicMemories.userId, userId)))
    .returning();
  return memory;
}

export async function getMemoriesByDateRange(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  return db
    .select()
    .from(musicMemories)
    .where(
      and(
        eq(musicMemories.userId, userId),
        gte(musicMemories.memoryDate, dateFrom),
        lte(musicMemories.memoryDate, dateTo),
      ),
    )
    .orderBy(desc(musicMemories.memoryDate));
}

export async function getMemoriesByMood(userId: string, mood: string) {
  return db
    .select()
    .from(musicMemories)
    .where(and(eq(musicMemories.userId, userId), eq(musicMemories.mood, mood)))
    .orderBy(desc(musicMemories.createdAt));
}

export async function getMemoriesOnThisDay(userId: string, month: number, day: number) {
  return db
    .select()
    .from(musicMemories)
    .where(
      and(
        eq(musicMemories.userId, userId),
        sql`EXTRACT(MONTH FROM ${musicMemories.memoryDate}) = ${month}`,
        sql`EXTRACT(DAY FROM ${musicMemories.memoryDate}) = ${day}`,
        isNotNull(musicMemories.memoryDate),
      ),
    )
    .orderBy(desc(musicMemories.createdAt));
}

// ─── Library ────────────────────────────────────────────────────────

export async function addToLibrary(input: CreateLibraryInput) {
  const [entry] = await db.insert(musicLibrary).values(input).returning();
  return entry;
}

export async function getLibrary(userId: string, limit = 100, offset = 0) {
  return db
    .select()
    .from(musicLibrary)
    .where(eq(musicLibrary.userId, userId))
    .orderBy(desc(musicLibrary.addedAt))
    .limit(limit)
    .offset(offset);
}

export async function removeFromLibrary(id: string, userId: string) {
  const [entry] = await db
    .delete(musicLibrary)
    .where(and(eq(musicLibrary.id, id), eq(musicLibrary.userId, userId)))
    .returning();
  return entry ?? null;
}

export async function removeTrackFromLibrary(userId: string, trackId: string) {
  const [entry] = await db
    .delete(musicLibrary)
    .where(and(eq(musicLibrary.userId, userId), eq(musicLibrary.trackId, trackId)))
    .returning();
  return entry ?? null;
}

export async function isInLibrary(userId: string, trackId: string) {
  const [entry] = await db
    .select()
    .from(musicLibrary)
    .where(and(eq(musicLibrary.userId, userId), eq(musicLibrary.trackId, trackId)))
    .limit(1);
  return !!entry;
}

export async function getLibraryTrackIds(userId: string) {
  const rows = await db
    .select({ trackId: musicLibrary.trackId })
    .from(musicLibrary)
    .where(eq(musicLibrary.userId, userId));
  return rows.map((r) => r.trackId);
}

// ─── Memory Songs (junction) ────────────────────────────────────────

export async function addSongToMemory(input: CreateMemorySongInput) {
  const [item] = await db.insert(musicMemorySongs).values(input).returning();
  return item;
}

export async function getMemorySongs(memoryId: string) {
  return db
    .select()
    .from(musicMemorySongs)
    .where(eq(musicMemorySongs.memoryId, memoryId))
    .orderBy(musicMemorySongs.position);
}

export async function removeSongFromMemory(id: string) {
  const [item] = await db.delete(musicMemorySongs).where(eq(musicMemorySongs.id, id)).returning();
  return item ?? null;
}

export async function getMemoriesByTrackViaSongs(userId: string, trackId: string) {
  return db
    .select({ memoryId: musicMemorySongs.memoryId })
    .from(musicMemorySongs)
    .innerJoin(musicMemories, eq(musicMemorySongs.memoryId, musicMemories.id))
    .where(and(eq(musicMemories.userId, userId), eq(musicMemorySongs.trackId, trackId)));
}


