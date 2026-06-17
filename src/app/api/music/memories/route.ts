import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import {
  createMemory,
  getMemories,
  getMemoriesByMood,
  getMemoriesByDateRange,
  createMemorySchema,
} from "@/modules/music";
import { lookupItunesEntity } from "@/modules/music/itunes";
import * as repo from "@/modules/music/repository";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hydrateTrack(
  trackId: string,
): Promise<{ trackId: string; trackName: string | null; artistName: string | null; trackImageUrl: string | null }> {
  let trackName: string | null = null;
  let artistName: string | null = null;
  let trackImageUrl: string | null = null;

  if (uuidRegex.test(trackId)) {
    const track = await repo.getTrackById(trackId);
    if (track) {
      trackName = track.title;
      if (track.artistId) {
        const artist = await repo.getArtistById(track.artistId);
        artistName = artist?.name ?? null;
      }
      if (track.albumId) {
        const album = await repo.getAlbumById(track.albumId);
        trackImageUrl = album?.coverArtUrl ?? null;
      }
    }
  } else if (trackId.startsWith("itunes-")) {
    const entity = await lookupItunesEntity(trackId.replace("itunes-", ""));
    if (entity) {
      trackName = entity.title;
      artistName = entity.artistName ?? null;
      trackImageUrl = entity.imageUrl;
    }
  }

  return { trackId, trackName, artistName, trackImageUrl };
}

async function hydrateMemories(memories: Array<{ trackId: string | null }>) {
  return Promise.all(
    memories.map(async (memory) => {
      let track = null;
      if (memory.trackId) {
        track = await hydrateTrack(memory.trackId);
      }
      return { ...memory, track };
    }),
  );
}

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const onThisDay = searchParams.get("onThisDay");

  try {
    let memories;
    if (onThisDay === "true") {
      const now = new Date();
      memories = await repo.getMemoriesOnThisDay(userId, now.getMonth() + 1, now.getDate());
    } else if (mood) {
      memories = await getMemoriesByMood(userId, mood);
    } else if (dateFrom && dateTo) {
      memories = await getMemoriesByDateRange(userId, new Date(dateFrom), new Date(dateTo));
    } else {
      memories = await getMemories(userId);
    }
    const hydrated = await hydrateMemories(memories);
    return NextResponse.json(hydrated);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // Transform frontend field names to schema names
    const mapped = {
      title: body.title,
      contextText: body.context ?? body.contextText,
      mood: body.mood,
      memoryDate: body.memoryDate
        ? body.memoryDate.includes("T")
          ? body.memoryDate
          : `${body.memoryDate}T00:00:00Z`
        : undefined,
      trackId: body.trackId,
      albumId: body.albumId,
      artistId: body.artistId,
      photoUrls: body.photoUrls,
      linkedEventId: body.linkedEventId,
    };

    const parsed = createMemorySchema.parse(mapped);
    const memory = await createMemory(userId, parsed);
    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
