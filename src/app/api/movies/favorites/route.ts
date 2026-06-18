import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { toggleFavorite } from "@/modules/movies/service";
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
  const items = await repo.getFavorites(userId);
  const hydrated = await Promise.all(
    items.map(async (fav) => {
      const tmdbId = parseCompositeId(fav.mediaId);
      if (!tmdbId) return { ...fav, mediaTitle: null, mediaPosterUrl: null };
      const media = await repo.getMediaByTmdbId(tmdbId);
      return {
        ...fav,
        mediaTitle: media?.title ?? null,
        mediaPosterUrl: media?.posterPath ? `${TMDB_IMAGE_BASE_URL}/w342${media.posterPath}` : null,
      };
    }),
  );
  return NextResponse.json(hydrated);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { mediaId } = await request.json();
  const result = await toggleFavorite(userId, mediaId);
  return NextResponse.json(result);
}
