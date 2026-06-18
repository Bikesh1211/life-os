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
  const memory = await repo.getMemoryById(id, userId);
  if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let mediaTitle = null;
  let mediaPosterUrl = null;
  if (memory.mediaId) {
    const tmdbId = parseCompositeId(memory.mediaId);
    if (tmdbId) {
      const media = await repo.getMediaByTmdbId(tmdbId);
      mediaTitle = media?.title ?? null;
      mediaPosterUrl = media?.posterPath ? `${TMDB_IMAGE_BASE_URL}/w342${media.posterPath}` : null;
    }
  }

  return NextResponse.json({ ...memory, mediaTitle, mediaPosterUrl });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const sanitized = {
    ...body,
    watchDate: body.watchDate ? new Date(body.watchDate) : body.watchDate,
  };
  return NextResponse.json(await repo.updateMemory(id, userId, sanitized));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await repo.deleteMemory(id, userId);
  return NextResponse.json({ success: true });
}
