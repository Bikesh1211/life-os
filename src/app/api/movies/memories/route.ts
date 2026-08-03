import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { createMemory } from "@/modules/movies/service";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

function parseCompositeId(compositeId: string): { tmdbId: string; mediaType: string } | null {
  const idx = compositeId.lastIndexOf("-");
  if (idx === -1) return { tmdbId: compositeId, mediaType: "movie" };
  const mediaType = compositeId.slice(0, idx);
  const tmdbId = compositeId.slice(idx + 1);
  if (!/^\d+$/.test(tmdbId)) return null;
  return { tmdbId, mediaType: mediaType === "tv" ? "tv" : "movie" };
}

async function hydrateMedia(memories: any[]) {
  const mediaIdToMemory = new Map<string, any>();
  for (const memory of memories) {
    if (!memory.mediaId) continue;
    const parsed = parseCompositeId(memory.mediaId);
    if (parsed && !mediaIdToMemory.has(parsed.tmdbId)) mediaIdToMemory.set(parsed.tmdbId, parsed);
  }
  const mediaRows = await repo.getMediaByTmdbIds([...mediaIdToMemory.keys()]);
  const mediaByTmdbId = new Map(mediaRows.map((m) => [m.tmdbId, m]));

  return memories.map((memory) => {
    if (!memory.mediaId) return { ...memory, mediaTitle: null, mediaPosterUrl: null };
    const parsed = parseCompositeId(memory.mediaId);
    if (!parsed) return { ...memory, mediaTitle: null, mediaPosterUrl: null };
    const media = mediaByTmdbId.get(parsed.tmdbId);
    return {
      ...memory,
      mediaTitle: media?.title ?? null,
      mediaPosterUrl: media?.posterPath ? `${TMDB_IMAGE_BASE_URL}/w342${media.posterPath}` : null,
      mediaType: parsed.mediaType,
    };
  });
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const onThisDay = searchParams.get("onThisDay");

  try {
    let memories;
    if (onThisDay === "true") {
      const now = new Date();
      memories = await repo.getMemoriesOnThisDay(userId, now.getMonth() + 1, now.getDate());
    } else {
      memories = await repo.getMemories(userId);
    }
    const hydrated = await hydrateMedia(memories);
    return NextResponse.json(hydrated);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const rawDate = body.watchDate ?? body.memoryDate;
    const mapped = {
      ...body,
      contextText: body.context ?? body.contextText,
      watchDate: rawDate ? (rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00Z`) : undefined,
    };
    const memory = await createMemory(userId, mapped);
    return NextResponse.json(memory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}
