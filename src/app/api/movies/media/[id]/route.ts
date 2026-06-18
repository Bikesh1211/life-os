import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";
import { getMediaByTmdbId } from "@/modules/movies/repository";

function parseCompositeId(id: string) {
  const idx = id.lastIndexOf("-");
  if (idx === -1) return null;
  const mediaType = id.slice(0, idx) as "movie" | "tv";
  const tmdbId = id.slice(idx + 1);
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  if (!/^\d+$/.test(tmdbId)) return null;
  return { tmdbId, mediaType };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = parseCompositeId(id);
  if (!parsed) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const [local, mediaDetail] = await Promise.all([
      getMediaByTmdbId(parsed.tmdbId),
      fetch(`${TMDB_BASE_URL}/${parsed.mediaType}/${parsed.tmdbId}?language=en-US&append_to_response=credits,videos,external_ids&api_key=${process.env.TMDB_API_KEY}`)
        .then((r) => (r.ok ? r.json() : null)),
    ]);

    if (!mediaDetail) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id, tmdbId: parsed.tmdbId, mediaType: parsed.mediaType,
      title: mediaDetail.title ?? mediaDetail.name ?? "",
      overview: mediaDetail.overview ?? null,
      tagline: mediaDetail.tagline ?? null,
      posterUrl: mediaDetail.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${mediaDetail.poster_path}` : null,
      backdropUrl: mediaDetail.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${mediaDetail.backdrop_path}` : null,
      releaseDate: mediaDetail.release_date ?? mediaDetail.first_air_date ?? null,
      runtime: mediaDetail.runtime ?? null,
      episodeRuntime: mediaDetail.episode_run_time?.[0] ?? null,
      voteAverage: mediaDetail.vote_average ?? null,
      genres: (mediaDetail.genres ?? []).map((g: any) => g.name),
      seasons: mediaDetail.number_of_seasons ?? null,
      episodes: mediaDetail.number_of_episodes ?? null,
      imdbId: mediaDetail.external_ids?.imdb_id ?? null,
      cast: (mediaDetail.credits?.cast ?? []).slice(0, 10).map((c: any) => ({
        id: String(c.id), name: c.name, character: c.character ?? "",
        imageUrl: c.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${c.profile_path}` : null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
