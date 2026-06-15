import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  getMemoryById,
  updateMemory,
  deleteMemory,
  updateMemorySchema,
  getMemorySongs,
} from "@/modules/music";
import * as repo from "@/modules/music/repository";
import { lookupItunesEntity } from "@/modules/music/itunes";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hydrateTrack(
  trackId: string,
): Promise<{ trackId: string; trackName: string | null; trackImageUrl: string | null }> {
  let trackName: string | null = null;
  let trackImageUrl: string | null = null;

  if (uuidRegex.test(trackId)) {
    const track = await repo.getTrackById(trackId);
    if (track) {
      trackName = track.title;
      if (track.albumId) {
        const album = await repo.getAlbumById(track.albumId);
        trackImageUrl = album?.coverArtUrl ?? null;
      }
    }
  } else if (trackId.startsWith("itunes-")) {
    const entity = await lookupItunesEntity(trackId.replace("itunes-", ""));
    if (entity) {
      trackName = entity.title;
      trackImageUrl = entity.imageUrl;
    }
  }

  return { trackId, trackName, trackImageUrl };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const memory = await getMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    const songs = await getMemorySongs(id);
    const hydratedSongs = await Promise.all(songs.map((s) => hydrateTrack(s.trackId)));
    return NextResponse.json({ ...memory, songs: hydratedSongs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch memory" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateMemorySchema.parse(body);
    const memory = await updateMemory(id, userId, parsed);
    return NextResponse.json(memory);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await deleteMemory(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
