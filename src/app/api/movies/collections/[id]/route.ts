import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

function parseCompositeId(compositeId: string): string | null {
  const idx = compositeId.lastIndexOf("-");
  if (idx === -1) return /^\d+$/.test(compositeId) ? compositeId : null;
  const tmdbId = compositeId.slice(idx + 1);
  return /^\d+$/.test(tmdbId) ? tmdbId : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [collection, items] = await Promise.all([repo.getCollectionById(id, userId), repo.getCollectionItems(id)]);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hydratedItems = await Promise.all(
    items.map(async (item: any) => {
      const tmdbId = parseCompositeId(item.mediaId);
      if (!tmdbId) return { ...item, mediaTitle: null, mediaPosterUrl: null };
      const media = await repo.getMediaByTmdbId(tmdbId);
      return {
        ...item,
        mediaTitle: media?.title ?? null,
        mediaPosterUrl: media?.posterPath ? `${TMDB_IMAGE_BASE_URL}/w185${media.posterPath}` : null,
      };
    }),
  );

  return NextResponse.json({ ...collection, items: hydratedItems });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await repo.deleteCollection(id, userId);
  return NextResponse.json({ success: true });
}
