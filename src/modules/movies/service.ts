import { z } from "zod";
import * as repo from "./repository";
import * as tmdb from "./tmdb";

// === VALIDATION SCHEMAS ===
export const createMemorySchema = z.object({
  mediaId: z.string().optional(),
  watchedWith: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  mood: z.string().max(50).nullable().optional(),
  contextText: z.string().min(1).max(5000),
  photoUrls: z.array(z.string().max(2000)).max(10).optional(),
  ticketUrls: z.array(z.string().max(2000)).max(10).optional(),
  screenshotUrls: z.array(z.string().max(2000)).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  watchDate: z.string().optional(),
  linkedEventId: z.string().optional(),
  title: z.string().max(200).optional(),
});

export const updateMemorySchema = createMemorySchema.partial();
export const addFavoriteSchema = z.object({ mediaId: z.string().min(1) });
export const ratingSchema = z.object({ mediaId: z.string().min(1), score: z.number().int().min(1).max(10), review: z.string().max(2000).optional() });
export const watchlistSchema = z.object({ mediaId: z.string().min(1), status: z.string().optional(), priority: z.string().optional() });
export const quoteSchema = z.object({ mediaId: z.string().optional(), quote: z.string().min(1).max(1000), character: z.string().max(200).optional(), timestamp: z.string().max(50).optional(), personalMeaning: z.string().max(2000).optional() });
export const collectionSchema = z.object({ name: z.string().min(1).max(200), description: z.string().max(2000).optional(), coverUrl: z.string().max(2000).optional(), tags: z.array(z.string().max(50)).max(20).optional() });

// === TMDB SYNC ===
export async function syncMediaFromTmdb(tmdbId: string, mediaType: "movie" | "tv") {
  const existing = await repo.getMediaByTmdbId(tmdbId);
  if (existing) return existing;
  const data = await tmdb.getMediaById(tmdbId, mediaType);
  if (!data) return null;
  return repo.upsertMedia({
    tmdbId: String(data.id),
    mediaType: data.media_type,
    title: data.title ?? data.name ?? "",
    overview: data.overview ?? null,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    releaseDate: data.release_date || data.first_air_date ? new Date(data.release_date ?? data.first_air_date!) : null,
    genres: [],
    voteAverage: data.vote_average ?? null,
    episodeRuntime: null, seasons: null, episodes: null,
  });
}

// === FAVORITES ===
export async function toggleFavorite(userId: string, mediaId: string) {
  const existing = await repo.getFavorites(userId);
  const found = existing.find((f) => f.mediaId === mediaId);
  if (found) {
    await repo.removeFavorite(userId, mediaId);
    return { favorited: false };
  }
  await repo.addFavorite(userId, mediaId);
  return { favorited: true };
}

// === WATCHLIST ===
export async function addToWatchlist(userId: string, mediaId: string, status: "plan_to_watch" | "watching" | "completed" | "dropped" | "rewatching" = "plan_to_watch") {
  return repo.addToWatchlist({ userId, mediaId, status });
}

// === MEMORIES ===
export async function createMemory(userId: string, params: z.infer<typeof createMemorySchema>) {
  const validated = createMemorySchema.parse(params);
  return repo.createMemory({
    userId,
    mediaId: validated.mediaId ?? null,
    watchedWith: validated.watchedWith ?? null,
    location: validated.location ?? null,
    mood: validated.mood ?? null,
    contextText: validated.contextText,
    photoUrls: validated.photoUrls ?? [],
    ticketUrls: validated.ticketUrls ?? [],
    screenshotUrls: validated.screenshotUrls ?? [],
    tags: validated.tags ?? [],
    watchDate: validated.watchDate ? new Date(validated.watchDate) : null,
    linkedEventId: validated.linkedEventId ?? null,
    title: validated.title ?? null,
  });
}

export async function searchMedia(query: string) {
  const local = await repo.searchLocalMedia(query);
  if (local.length > 0) return local;
  const results = await tmdb.searchAll(query);
  const synced = await Promise.all(
    results.media.map((r) =>
      repo.upsertMedia({
        tmdbId: String(r.id),
        mediaType: r.media_type,
        title: r.title ?? r.name ?? "",
        overview: r.overview ?? null,
        posterPath: r.poster_path,
        backdropPath: r.backdrop_path,
        releaseDate: r.release_date || r.first_air_date ? new Date(r.release_date ?? r.first_air_date!) : null,
        genres: [],
        voteAverage: r.vote_average ?? null,
        runtime: null, episodeRuntime: null, seasons: null, episodes: null,
      }),
    ),
  );
  return synced;
}

export async function searchPeople(query: string) {
  const local = await repo.searchLocalPeople(query);
  if (local.length > 0) return local;
  const results = await tmdb.searchPeople(query);
  return Promise.all(
    results.map((r) => repo.upsertPerson({
      tmdbId: String(r.id),
      name: r.name,
      profilePath: r.profile_path,
      knownForDepartment: r.known_for_department ?? null,
    })),
  );
}
