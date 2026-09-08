import { z } from "zod";
import * as repo from "./repository";
import * as mb from "./musicbrainz";
import * as spotify from "./spotify";
import { getCoverArtUrl } from "./cover-art";

// ─── Zod Schemas ──────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["artist", "album", "track", "release"]).default("track"),
});

export const createListeningSchema = z.object({
  trackId: z.string().uuid().optional(),
  artistName: z.string().max(200).optional(),
  trackName: z.string().max(200).optional(),
  listenedAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  sessionId: z.string().uuid().optional(),
});

export const createJournalSchema = z.object({
  trackId: z.string().uuid().optional(),
  albumId: z.string().uuid().optional(),
  artistId: z.string().uuid().optional(),
  mood: z.string().max(50).optional(),
  journalEntry: z.string().min(1).max(10000),
});

export const updateJournalSchema = createJournalSchema.partial();

export const createMemorySchema = z.object({
  trackId: z.string().optional(),
  albumId: z.string().optional(),
  artistId: z.string().optional(),
  title: z.string().max(200).optional(),
  contextText: z.string().min(1).max(5000),
  mood: z.string().max(50).nullable().optional(),
  photoUrls: z.array(z.string().max(2000)).max(10).optional(),
  memoryDate: z.string().datetime().optional(),
  linkedEventId: z.string().optional(),
});

export const updateMemorySchema = createMemorySchema.partial();

export const addMemorySongSchema = z.object({
  trackId: z.string().min(1),
  position: z.number().int().min(0).optional(),
});

export const addToLibrarySchema = z.object({
  trackId: z.string().uuid(),
});

export const addJournalSongSchema = z.object({
  trackId: z.string().uuid().optional(),
  albumId: z.string().uuid().optional(),
  artistId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
});

export const createMoodEntrySchema = z.object({
  mood: z.string().min(1).max(50),
  note: z.string().max(1000).optional(),
  date: z.string().datetime().optional(),
});

export const createRatingSchema = z.object({
  entityType: z.enum(["track", "album", "artist"]),
  entityId: z.string().uuid(),
  score: z.number().int().min(1).max(10),
  review: z.string().max(2000).optional(),
});

export const updateRatingSchema = z.object({
  score: z.number().int().min(1).max(10).optional(),
  review: z.string().max(2000).optional(),
});

export const createFavoriteSchema = z.object({
  entityType: z.enum(["track", "album", "artist", "genre", "decade"]),
  entityId: z.string().min(1).max(200),
});

export const createCollectionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isSmart: z.boolean().optional(),
  smartFilter: z.string().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const addCollectionItemSchema = z.object({
  entityType: z.enum(["track", "album", "artist", "memory"]),
  entityId: z.string().min(1).max(200),
  position: z.number().int().min(0).optional(),
});

export const createGoalConfigSchema = z.object({
  goalId: z.string().min(1),
  targetType: z.enum(["albums", "tracks", "genres", "countries"]),
  targetValue: z.string().max(200).optional(),
  targetCount: z.number().int().positive().optional(),
});

export const updateGoalConfigSchema = createGoalConfigSchema.partial();

// ─── Types ────────────────────────────────────────────────────────

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
export type CreateListeningParams = z.infer<typeof createListeningSchema>;
export type CreateJournalParams = z.infer<typeof createJournalSchema>;
export type UpdateJournalParams = z.infer<typeof updateJournalSchema>;
export type CreateMemoryParams = z.infer<typeof createMemorySchema>;
export type CreateRatingParams = z.infer<typeof createRatingSchema>;
export type UpdateRatingParams = z.infer<typeof updateRatingSchema>;
export type CreateFavoriteParams = z.infer<typeof createFavoriteSchema>;
export type CreateCollectionParams = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionParams = z.infer<typeof updateCollectionSchema>;
export type AddCollectionItemParams = z.infer<typeof addCollectionItemSchema>;
export type UpdateMemoryParams = z.infer<typeof updateMemorySchema>;
export type AddJournalSongParams = z.infer<typeof addJournalSongSchema>;
export type CreateMoodEntryParams = z.infer<typeof createMoodEntrySchema>;
export type AddMemorySongParams = z.infer<typeof addMemorySongSchema>;
export type AddToLibraryParams = z.infer<typeof addToLibrarySchema>;
export const createNoteSchema = z.object({
  entityType: z.enum(["track", "album", "artist", "memory"]),
  entityId: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1).max(10000),
});

export type CreateGoalConfigParams = z.infer<typeof createGoalConfigSchema>;
export type UpdateGoalConfigParams = z.infer<typeof updateGoalConfigSchema>;
export type CreateNoteParams = z.infer<typeof createNoteSchema>;
export type UpdateNoteParams = z.infer<typeof updateNoteSchema>;

// ─── Search (MusicBrainz + local cache) ───────────────────────────

async function syncArtist(mbid: string) {
  const existing = await repo.getArtistByMusicBrainzId(mbid);
  if (existing) return existing;

  const mbArtist = await mb.lookupArtist(mbid);
  const genres = mb.parseGenres(mbArtist.tags);

  return repo.createArtist({
    musicBrainzId: mbArtist.id,
    name: mbArtist.name,
    country: mbArtist.country ?? undefined,
    type: mbArtist.type?.toLowerCase() ?? undefined,
    genres: genres.length > 0 ? genres : [],
  });
}

async function syncAlbum(mbid: string) {
  const existing = await repo.getAlbumByMusicBrainzId(mbid);
  if (existing) return existing;

  const mbAlbum = await mb.lookupAlbum(mbid);

  const artistCredit = mbAlbum["artist-credit"]?.[0];
  if (!artistCredit) return null;

  const artist = await syncArtist(artistCredit.artist.id);

  const coverArtUrl = await getCoverArtUrl(mbid).catch(() => null) ?? undefined;
  return repo.createAlbum({
    musicBrainzId: mbAlbum.id,
    artistId: artist.id,
    title: mbAlbum.title,
    releaseDate: mbAlbum["first-release-date"] ? new Date(mbAlbum["first-release-date"]) : undefined,
    coverArtUrl,
    totalTracks: undefined,
  });
}

async function tryMusicBrainz<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function searchArtists(query: string) {
  const local = await repo.searchArtistsByName(query);
  if (local.length > 0) return local;

  const results = await tryMusicBrainz(() => mb.searchArtists(query));
  if (!results) return [];

  const artists = await Promise.all(
    results.results.slice(0, 5).map((r) => tryMusicBrainz(() => syncArtist(r.entity.id))),
  );
  return artists.filter(Boolean);
}

export async function searchAlbums(query: string) {
  const local = await repo.searchAlbumsByTitle(query);
  if (local.length > 0) return local;

  const results = await tryMusicBrainz(() => mb.searchAlbums(query));
  if (!results) return [];

  const albums = await Promise.all(
    results.results.slice(0, 5).map(async (r) => {
      const existing = await repo.getAlbumByMusicBrainzId(r.entity.id);
      if (existing) return existing;

      const artistCredit = r.entity["artist-credit"]?.[0];
      if (!artistCredit) return null;

      const artist = await tryMusicBrainz(() => syncArtist(artistCredit.artist.id));
      if (!artist) return null;

      const coverArtUrl = await getCoverArtUrl(r.entity.id).catch(() => null) ?? undefined;
      return repo.createAlbum({
        musicBrainzId: r.entity.id,
        artistId: artist.id,
        title: r.entity.title,
        releaseDate: r.entity["first-release-date"]
          ? new Date(r.entity["first-release-date"])
          : undefined,
        coverArtUrl,
        totalTracks: undefined,
      });
    }),
  );
  return albums.filter(Boolean);
}

export async function searchTracks(query: string) {
  const local = await repo.searchTracksByTitle(query);
  if (local.length > 0) return local;

  const results = await tryMusicBrainz(() => mb.searchTracks(query));
  if (!results) return [];

  const tracks = await Promise.all(
    results.results.slice(0, 5).map(async (r) => {
      const mbid = r.entity.id;
      const existing = await repo.getTrackByMusicBrainzId(mbid);
      if (existing) return existing;

      const artistCredit = r.entity["artist-credit"]?.[0];
      if (!artistCredit) return null;

      const artist = await tryMusicBrainz(() => syncArtist(artistCredit.artist.id));
      if (!artist) return null;

      return repo.createTrack({
        musicBrainzId: mbid,
        albumId: undefined,
        artistId: artist.id,
        title: r.entity.title,
        duration: r.entity.length ? Math.round(r.entity.length / 1000) : undefined,
      });
    }),
  );
  return tracks.filter(Boolean);
}

// ─── Listening History ────────────────────────────────────────────

export async function logListening(userId: string, params: CreateListeningParams) {
  const validated = createListeningSchema.parse(params);
  return repo.createListeningEntry({
    userId,
    trackId: validated.trackId ?? undefined,
    artistName: validated.artistName ?? undefined,
    trackName: validated.trackName ?? undefined,
    listenedAt: validated.listenedAt ? new Date(validated.listenedAt) : new Date(),
    duration: validated.duration ?? undefined,
    sessionId: validated.sessionId ?? undefined,
  });
}

export async function getListeningHistory(userId: string, limit = 50, offset = 0) {
  return repo.getListeningHistory(userId, limit, offset);
}

// ─── Journal ──────────────────────────────────────────────────────

export async function createJournalEntry(userId: string, params: CreateJournalParams) {
  const validated = createJournalSchema.parse(params);
  return repo.createJournalEntry({
    userId,
    trackId: validated.trackId ?? undefined,
    albumId: validated.albumId ?? undefined,
    artistId: validated.artistId ?? undefined,
    mood: validated.mood ?? undefined,
    journalEntry: validated.journalEntry,
  });
}

export async function getJournalEntries(userId: string, limit = 50, offset = 0) {
  return repo.getJournalEntries(userId, limit, offset);
}

export async function getJournalEntry(id: string, userId: string) {
  return repo.getJournalEntryById(id, userId);
}

export async function updateJournalEntry(id: string, userId: string, params: UpdateJournalParams) {
  const validated = updateJournalSchema.parse(params);
  return repo.updateJournalEntry(id, userId, validated);
}

export async function deleteJournalEntry(id: string, userId: string) {
  return repo.deleteJournalEntry(id, userId);
}

// ─── Memories ─────────────────────────────────────────────────────

export async function createMemory(userId: string, params: CreateMemoryParams) {
  const validated = createMemorySchema.parse(params);
  return repo.createMemory({
    userId,
    trackId: validated.trackId ?? undefined,
    albumId: validated.albumId ?? undefined,
    artistId: validated.artistId ?? undefined,
    title: validated.title ?? undefined,
    contextText: validated.contextText,
    mood: validated.mood ?? undefined,
    photoUrls: validated.photoUrls ?? [],
    memoryDate: validated.memoryDate ? new Date(validated.memoryDate) : undefined,
    linkedEventId: validated.linkedEventId ?? undefined,
  });
}

export async function updateMemory(id: string, userId: string, params: UpdateMemoryParams) {
  const validated = updateMemorySchema.parse(params);
  return repo.updateMemory(id, userId, {
    ...(validated.title !== undefined && { title: validated.title }),
    ...(validated.contextText !== undefined && { contextText: validated.contextText }),
    ...(validated.mood !== undefined && { mood: validated.mood }),
    ...(validated.photoUrls !== undefined && { photoUrls: validated.photoUrls }),
    ...(validated.memoryDate !== undefined && { memoryDate: new Date(validated.memoryDate) }),
    ...(validated.trackId !== undefined && { trackId: validated.trackId }),
    ...(validated.albumId !== undefined && { albumId: validated.albumId }),
    ...(validated.artistId !== undefined && { artistId: validated.artistId }),
    ...(validated.linkedEventId !== undefined && { linkedEventId: validated.linkedEventId }),
  } as any);
}

export async function getMemories(userId: string, limit = 50, offset = 0) {
  return repo.getMemories(userId, limit, offset);
}

export async function getMemoryById(id: string, userId: string) {
  return repo.getMemoryById(id, userId);
}

export async function getMemoriesByMood(userId: string, mood: string) {
  return repo.getMemoriesByMood(userId, mood);
}

export async function getMemoriesByDateRange(userId: string, dateFrom: Date, dateTo: Date) {
  return repo.getMemoriesByDateRange(userId, dateFrom, dateTo);
}

export async function deleteMemory(id: string, userId: string) {
  return repo.deleteMemory(id, userId);
}

// ─── Memory Songs ────────────────────────────────────────────────

export async function addSongToMemory(
  userId: string,
  memoryId: string,
  params: AddMemorySongParams,
) {
  const validated = addMemorySongSchema.parse(params);
  const memory = await repo.getMemoryById(memoryId, userId);
  if (!memory) throw new Error("Memory not found");
  return repo.addSongToMemory({
    memoryId,
    trackId: validated.trackId,
    position: validated.position ?? 0,
  });
}

export async function getMemorySongs(memoryId: string) {
  return repo.getMemorySongs(memoryId);
}

export async function removeSongFromMemory(id: string) {
  return repo.removeSongFromMemory(id);
}

// ─── Library ─────────────────────────────────────────────────────────

export async function addToLibrary(userId: string, params: AddToLibraryParams) {
  const validated = addToLibrarySchema.parse(params);
  const exists = await repo.isInLibrary(userId, validated.trackId);
  if (exists) return null;
  return repo.addToLibrary({
    userId,
    trackId: validated.trackId,
  });
}

export async function getLibrary(userId: string, limit = 100, offset = 0) {
  return repo.getLibrary(userId, limit, offset);
}

export async function removeFromLibrary(id: string, userId: string) {
  return repo.removeFromLibrary(id, userId);
}

export async function removeTrackFromLibrary(userId: string, trackId: string) {
  return repo.removeTrackFromLibrary(userId, trackId);
}

export async function isInLibrary(userId: string, trackId: string) {
  return repo.isInLibrary(userId, trackId);
}

export async function getLibraryTrackIds(userId: string) {
  return repo.getLibraryTrackIds(userId);
}

// ─── Journal Songs ────────────────────────────────────────────────

export async function addSongToJournal(
  userId: string,
  journalId: string,
  params: AddJournalSongParams,
) {
  const validated = addJournalSongSchema.parse(params);
  return repo.addSongToJournal({
    journalId,
    trackId: validated.trackId ?? undefined,
    albumId: validated.albumId ?? undefined,
    artistId: validated.artistId ?? undefined,
    position: validated.position ?? 0,
  });
}

export async function getJournalSongs(journalId: string) {
  return repo.getJournalSongs(journalId);
}

export async function removeSongFromJournal(id: string) {
  return repo.removeSongFromJournal(id);
}

// ─── Mood Entries ─────────────────────────────────────────────────

export async function createMoodEntry(userId: string, params: CreateMoodEntryParams) {
  const validated = createMoodEntrySchema.parse(params);
  return repo.createMoodEntry({
    userId,
    mood: validated.mood,
    note: validated.note ?? undefined,
    date: validated.date ? new Date(validated.date) : new Date(),
  });
}

export async function getMoodEntries(
  userId: string,
  options?: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number },
) {
  return repo.getMoodEntries(userId, {
    dateFrom: options?.dateFrom ? new Date(options.dateFrom) : undefined,
    dateTo: options?.dateTo ? new Date(options.dateTo) : undefined,
    limit: options?.limit,
    offset: options?.offset,
  });
}

export async function getMoodAnalytics(userId: string, days = 90) {
  return repo.getMoodAnalytics(userId, days);
}

// ─── Ratings ──────────────────────────────────────────────────────

export async function createRating(userId: string, params: CreateRatingParams) {
  const validated = createRatingSchema.parse(params);
  return repo.createRating({
    userId,
    entityType: validated.entityType,
    entityId: validated.entityId,
    score: validated.score,
    review: validated.review ?? undefined,
  });
}

export async function getRatings(userId: string, entityType?: string) {
  if (entityType) return repo.getRatingsByType(userId, entityType);
  return repo.getRatingsByUser(userId);
}

export async function updateRating(id: string, userId: string, params: UpdateRatingParams) {
  const validated = updateRatingSchema.parse(params);
  return repo.updateRating(id, userId, validated);
}

export async function deleteRating(id: string, userId: string) {
  return repo.deleteRating(id, userId);
}

// ─── Favorites ────────────────────────────────────────────────────

export async function addFavorite(userId: string, params: CreateFavoriteParams) {
  const validated = createFavoriteSchema.parse(params);
  const exists = await repo.isFavorite(userId, validated.entityType, validated.entityId);
  if (exists) return repo.getFavoritesByType(userId, validated.entityType);
  await repo.createFavorite({
    userId,
    entityType: validated.entityType,
    entityId: validated.entityId,
  });
  return repo.getFavoritesByType(userId, validated.entityType);
}

import { lookupItunesEntity } from "./itunes";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getFavorites(userId: string) {
  const favorites = await repo.getFavorites(userId);
  if (favorites.length === 0) return [];

  const trackIds = favorites
    .filter((f: any) => f.entityType === "track" && uuidRegex.test(f.entityId))
    .map((f: any) => f.entityId);
  const albumIds = favorites
    .filter((f: any) => f.entityType === "album" && uuidRegex.test(f.entityId))
    .map((f: any) => f.entityId);
  const artistIds = favorites
    .filter((f: any) => f.entityType === "artist" && uuidRegex.test(f.entityId))
    .map((f: any) => f.entityId);

  const [tracks, albums, artists] = await Promise.all([
    trackIds.length > 0 ? repo.getTracksByIds(trackIds) : [],
    albumIds.length > 0 ? repo.getAlbumsByIds(albumIds) : [],
    artistIds.length > 0 ? repo.getArtistsByIds(artistIds) : [],
  ]);

  const trackMap = new Map<string, any>(tracks.map((t: any) => [t.id, t]));
  const albumMap = new Map<string, any>(albums.map((a: any) => [a.id, a]));
  const artistMap = new Map<string, any>(artists.map((a: any) => [a.id, a]));

  const itunesFavorites = favorites.filter(
    (f: any) => !uuidRegex.test(f.entityId) && f.entityId.startsWith("itunes-"),
  );
  const itunesResults = new Map<string, { entityName: string | null; imageUrl: string | null }>();
  if (itunesFavorites.length > 0) {
    const itunesIds = [...new Set(itunesFavorites.map((f: any) => f.entityId.replace("itunes-", "")))];
    const results = await Promise.allSettled((itunesIds as string[]).map((id) => lookupItunesEntity(id) as any));
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        itunesResults.set(result.value.id, {
          entityName: result.value.title ?? null,
          imageUrl: result.value.imageUrl ?? null,
        });
      }
    }
  }

  return favorites.map((fav: any) => {
    let entityName: string | null = null;
    let imageUrl: string | null = null;

    if (fav.entityType === "track") {
      const track = trackMap.get(fav.entityId);
      entityName = track?.title ?? null;
      imageUrl = track?.albumCoverArtUrl ?? null;
    } else if (fav.entityType === "album") {
      const album = albumMap.get(fav.entityId);
      entityName = album?.title ?? null;
      imageUrl = album?.coverArtUrl ?? null;
    } else if (fav.entityType === "artist") {
      const artist = artistMap.get(fav.entityId);
      entityName = artist?.name ?? null;
      imageUrl = artist?.imageUrl ?? null;
    }

    if (!entityName && !imageUrl) {
      const itunes = itunesResults.get(fav.entityId);
      if (itunes) {
        entityName ??= itunes.entityName;
        imageUrl ??= itunes.imageUrl;
      }
    }

    return {
      ...fav,
      entityName,
      imageUrl,
    };
  });
}

export async function removeFavorite(userId: string, entityType: string, entityId: string) {
  return repo.deleteFavorite(userId, entityType, entityId);
}

// ─── Collections ──────────────────────────────────────────────────

export async function createCollection(userId: string, params: CreateCollectionParams) {
  const validated = createCollectionSchema.parse(params);
  return repo.createCollection({
    userId,
    title: validated.title,
    description: validated.description ?? undefined,
    isSmart: validated.isSmart ?? false,
    smartFilter: validated.smartFilter ?? undefined,
  });
}

export async function getCollections(userId: string) {
  return repo.getCollections(userId);
}

export async function getCollection(id: string, userId: string) {
  const collection = await repo.getCollectionById(id, userId);
  if (!collection) return null;
  const items = await repo.getCollectionItems(id, userId);
  return { ...collection, items };
}

export async function updateCollection(id: string, userId: string, params: UpdateCollectionParams) {
  const validated = updateCollectionSchema.parse(params);
  return repo.updateCollection(id, userId, validated);
}

export async function deleteCollection(id: string, userId: string) {
  return repo.deleteCollection(id, userId);
}

export async function addCollectionItem(
  collectionId: string,
  userId: string,
  params: AddCollectionItemParams,
) {
  const validated = addCollectionItemSchema.parse(params);
  return repo.addCollectionItem(
    {
      collectionId,
      entityType: validated.entityType,
      entityId: validated.entityId,
      position: validated.position ?? 0,
    },
    userId,
  );
}

export async function removeCollectionItem(id: string, userId: string) {
  return repo.removeCollectionItem(id, userId);
}

// ─── Goal Config ──────────────────────────────────────────────────

export async function createGoalConfig(userId: string, params: CreateGoalConfigParams) {
  const validated = createGoalConfigSchema.parse(params);
  return repo.createGoalConfig({
    userId,
    goalId: validated.goalId,
    targetType: validated.targetType,
    targetValue: validated.targetValue ?? undefined,
    targetCount: validated.targetCount ?? undefined,
    currentCount: 0,
  });
}

export async function getGoalConfigs(userId: string) {
  return repo.getGoalConfigs(userId);
}

export async function updateGoalConfig(id: string, userId: string, params: UpdateGoalConfigParams) {
  const validated = updateGoalConfigSchema.parse(params);
  return repo.updateGoalConfig(id, userId, validated);
}

export async function deleteGoalConfig(id: string, userId: string) {
  return repo.deleteGoalConfig(id, userId);
}

// ─── Notes ─────────────────────────────────────────────────────────

export async function createNote(userId: string, params: CreateNoteParams) {
  const validated = createNoteSchema.parse(params);
  return repo.createNote({ ...validated, userId });
}

export async function getNotesByEntity(userId: string, entityType: string, entityId: string) {
  return repo.getNotesByEntity(userId, entityType, entityId);
}

export async function getNoteById(id: string, userId: string) {
  return repo.getNoteById(id, userId);
}

export async function updateNote(id: string, userId: string, params: UpdateNoteParams) {
  const validated = updateNoteSchema.parse(params);
  return repo.updateNote(id, userId, validated);
}

export async function deleteNote(id: string, userId: string) {
  return repo.deleteNote(id, userId);
}

// ─── Spotify Sync ─────────────────────────────────────────────────

export async function syncArtistFromSpotify(spotifyId: string) {
  const existing = await repo.getArtistBySpotifyId(spotifyId);
  if (existing) return existing;

  const [artistData, topTracks, albums] = await Promise.all([
    spotify.getArtist(spotifyId),
    spotify.getArtistTopTracks(spotifyId),
    spotify.getArtistAlbums(spotifyId),
  ]);

  const artist = await repo.upsertArtistBySpotifyId({
    spotifyId: artistData.id,
    name: artistData.name,
    genres: artistData.genres,
    imageUrl: artistData.imageUrl,
    spotifyPopularity: artistData.popularity,
  } as repo.CreateArtistInput);

  for (const t of topTracks) {
    let albumId: string | null = null;
    if (t.albumId) {
      const existingAlbum = await repo.getAlbumBySpotifyId(t.albumId);
      if (existingAlbum) {
        albumId = existingAlbum.id;
      }
    }

    await repo.upsertTrackBySpotifyId({
      spotifyId: t.id,
      albumId,
      artistId: artist.id,
      title: t.title,
      duration: t.duration,
      trackNumber: t.trackNumber,
      explicit: t.explicit,
      spotifyPopularity: t.popularity,
    } as repo.CreateTrackInput);
  }

  for (const a of albums) {
    await repo.upsertAlbumBySpotifyId({
      spotifyId: a.id,
      artistId: artist.id,
      title: a.title,
      releaseDate: a.releaseDate ? new Date(a.releaseDate) : null,
      coverArtUrl: a.imageUrl,
      totalTracks: a.totalTracks,
    } as repo.CreateAlbumInput);
  }

  return artist;
}

export async function syncAlbumFromSpotify(spotifyId: string) {
  const existing = await repo.getAlbumBySpotifyId(spotifyId);
  if (existing) return existing;

  const albumData = await spotify.getAlbum(spotifyId);

  const artist = await syncArtistFromSpotify(albumData.artistId);

  const album = await repo.upsertAlbumBySpotifyId({
    spotifyId: albumData.id,
    artistId: artist.id,
    title: albumData.title,
    releaseDate: albumData.releaseDate ? new Date(albumData.releaseDate) : null,
    coverArtUrl: albumData.imageUrl,
    totalTracks: albumData.totalTracks,
    label: albumData.label ?? null,
    spotifyPopularity: albumData.popularity ?? null,
  } as repo.CreateAlbumInput);

  for (const t of albumData.tracks) {
    await repo.upsertTrackBySpotifyId({
      spotifyId: t.id,
      albumId: album.id,
      artistId: artist.id,
      title: t.title,
      duration: t.duration,
      trackNumber: t.trackNumber,
      explicit: t.explicit ?? false,
      spotifyPopularity: t.popularity ?? null,
    } as repo.CreateTrackInput);
  }

  return album;
}

export async function syncTrackFromSpotify(spotifyId: string) {
  const existing = await repo.getTrackBySpotifyId(spotifyId);
  if (existing) return existing;

  const trackData = await spotify.getTrack(spotifyId);

  const artist = await syncArtistFromSpotify(trackData.artistId);

  let album = null;
  if (trackData.albumId) {
    album = await repo.getAlbumBySpotifyId(trackData.albumId);
    if (!album) {
      const albumData = await spotify.getAlbum(trackData.albumId);
      album = await repo.upsertAlbumBySpotifyId({
        spotifyId: albumData.id,
        artistId: artist.id,
        title: albumData.title,
        releaseDate: albumData.releaseDate ? new Date(albumData.releaseDate) : null,
        coverArtUrl: albumData.imageUrl,
        totalTracks: albumData.totalTracks,
        label: albumData.label ?? null,
        spotifyPopularity: albumData.popularity ?? null,
      } as repo.CreateAlbumInput);
    }
  }

  const track = await repo.upsertTrackBySpotifyId({
    spotifyId: trackData.id,
    albumId: album?.id ?? null,
    artistId: artist.id,
    title: trackData.title,
    duration: trackData.duration,
    trackNumber: trackData.trackNumber,
    explicit: trackData.explicit ?? false,
    spotifyPopularity: trackData.popularity ?? null,
  } as repo.CreateTrackInput);

  return track;
}

// ─── Smart Collections ───────────────────────────────────────────

export async function evaluateSmartFilter(userId: string, filter: Record<string, unknown>) {
  return repo.evaluateSmartFilter(userId, filter);
}

// ─── Analytics ────────────────────────────────────────────────────

export async function getAnalytics(userId: string) {
  const [topArtists, streaks, totalHours] = await Promise.all([
    repo.getMostListenedArtists(userId),
    repo.getListeningStreaks(userId),
    repo.getTotalListeningHours(userId),
  ]);

  const currentStreak = calculateStreak(streaks.map((s) => s.date));
  const latestYear = new Date().getFullYear();
  const yearlyStats = await repo.getYearlyListeningStats(userId, latestYear);

  return {
    topArtists,
    totalListeningHours: totalHours,
    currentStreak: currentStreak.days,
    longestStreak: currentStreak.longest,
    yearlyStats,
  };
}

export function calculateStreak(dates: string[]) {
  if (dates.length === 0) return { days: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort().reverse();
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = tempStreak;
  return { days: currentStreak, longest: longestStreak };
}
