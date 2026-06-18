import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { addToWatchlist } from "@/modules/movies/service";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

function parseCompositeId(compositeId: string): string | null {
  const idx = compositeId.lastIndexOf("-");
  if (idx === -1) return /^\d+$/.test(compositeId) ? compositeId : null;
  const tmdbId = compositeId.slice(idx + 1);
  return /^\d+$/.test(tmdbId) ? tmdbId : null;
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const items = status
    ? await repo.getWatchlistByStatus(userId, status as any)
    : await repo.getWatchlist(userId);
  const hydrated = await Promise.all(
    items.map(async (item) => {
      const tmdbId = parseCompositeId(item.mediaId);
      if (!tmdbId) return { ...item, mediaTitle: null, mediaPosterUrl: null };
      const media = await repo.getMediaByTmdbId(tmdbId);
      return {
        ...item,
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
  const { mediaId, status } = await request.json();
  return NextResponse.json(await addToWatchlist(userId, mediaId, status));
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  return NextResponse.json(await repo.updateWatchlistItem(id, userId, data));
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await repo.removeFromWatchlist(id, userId);
  return NextResponse.json({ success: true });
}
