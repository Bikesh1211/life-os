const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 250;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  const separator = url.includes("?") ? "&" : "?";
  return fetch(`${url}${separator}api_key=${TMDB_API_KEY}`, {
    signal: AbortSignal.timeout(5000),
  });
}

export function getImageUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export type TmdbMediaResult = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  original_language: string;
};

export type TmdbPersonResult = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
};

export type TmdbSearchResults = {
  media: TmdbMediaResult[];
  people: TmdbPersonResult[];
};

export async function searchMovies(query: string): Promise<TmdbMediaResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: TmdbMediaResult) => ({ ...r, media_type: "movie" }));
}

export async function searchTv(query: string): Promise<TmdbMediaResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: TmdbMediaResult) => ({ ...r, media_type: "tv" }));
}

export async function searchPeople(query: string): Promise<TmdbPersonResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&language=en-US&page=1`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function searchAll(query: string): Promise<TmdbSearchResults> {
  const [movies, tv, people] = await Promise.all([
    searchMovies(query),
    searchTv(query),
    searchPeople(query),
  ]);
  return { media: [...movies, ...tv], people };
}

export async function getMediaById(tmdbId: string, mediaType: "movie" | "tv"): Promise<TmdbMediaResult | null> {
  const endpoint = mediaType === "movie" ? "movie" : "tv";
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/${endpoint}/${tmdbId}?language=en-US`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { ...data, media_type: mediaType };
}

export async function getPersonById(tmdbId: string): Promise<TmdbPersonResult | null> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/person/${tmdbId}?language=en-US`,
  );
  if (!res.ok) return null;
  return res.json();
}

export type TmdbCreditCast = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

export type TmdbCreditsResult = {
  cast: TmdbCreditCast[];
};

export async function getMediaCredits(tmdbId: string, mediaType: "movie" | "tv"): Promise<TmdbCreditsResult> {
  const endpoint = mediaType === "movie" ? "movie" : "tv";
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/${endpoint}/${tmdbId}/credits?language=en-US`,
  );
  if (!res.ok) return { cast: [] };
  const data = await res.json();
  return {
    cast: (data.cast ?? []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? "",
      profile_path: c.profile_path,
      order: c.order ?? 0,
    })),
  };
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week"): Promise<TmdbMediaResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?language=en-US`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    ...r,
    media_type: r.media_type ?? mediaType,
  }));
}

export async function getPopular(mediaType: "movie" | "tv" = "movie"): Promise<TmdbMediaResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/${mediaType}/popular?language=en-US`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({ ...r, media_type: mediaType }));
}

export async function getTopRated(mediaType: "movie" | "tv" = "movie"): Promise<TmdbMediaResult[]> {
  const res = await rateLimitedFetch(
    `${TMDB_BASE_URL}/${mediaType}/top_rated?language=en-US`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({ ...r, media_type: mediaType }));
}
