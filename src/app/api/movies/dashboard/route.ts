import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

function parseCompositeId(compositeId: string): string | null {
  const idx = compositeId.lastIndexOf("-");
  if (idx === -1) return /^\d+$/.test(compositeId) ? compositeId : null;
  const tmdbId = compositeId.slice(idx + 1);
  return /^\d+$/.test(tmdbId) ? tmdbId : null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, recentMemories, favorites, watchlist, memoriesPerMonth] = await Promise.all([
      repo.getDashboardStats(userId),
      repo.getMemories(userId, 5),
      repo.getFavorites(userId),
      repo.getWatchlist(userId),
      repo.getMoviesWatchedPerMonth(userId),
    ]);

    const tmdbIds = [...new Set(recentMemories.map((m) => m.mediaId ? parseCompositeId(m.mediaId) : null).filter(Boolean))] as string[];
    const mediaRows = await repo.getMediaByTmdbIds(tmdbIds);
    const mediaByTmdbId = new Map(mediaRows.map((m) => [m.tmdbId, m]));
    const hydratedMemories = recentMemories.map((m) => {
      if (!m.mediaId) return { ...m, mediaTitle: null, mediaPosterUrl: null };
      const tmdbId = parseCompositeId(m.mediaId);
      if (!tmdbId) return { ...m, mediaTitle: null, mediaPosterUrl: null };
      const media = mediaByTmdbId.get(tmdbId);
      return {
        ...m,
        mediaTitle: media?.title ?? null,
        mediaPosterUrl: media?.posterPath ? `${TMDB_IMAGE_BASE_URL}/w92${media.posterPath}` : null,
      };
    });

    return NextResponse.json({ stats, recentMemories: hydratedMemories, favorites, watchlist, memoriesPerMonth });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
