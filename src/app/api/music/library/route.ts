import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import * as service from "@/modules/music/service";
import * as repo from "@/modules/music/repository";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200);
  const offset = Number(url.searchParams.get("offset")) || 0;

  try {
    const library = await service.getLibrary(userId, limit, offset);
    const trackIds = library.map((e) => e.trackId);

    const trackRows = await repo.getTracksByIds(trackIds);
    const artistIds = [...new Set(trackRows.map((t) => t.artistId))];
    const artistRows = await repo.getArtistsByIds(artistIds);

    const trackById = new Map(trackRows.map((t) => [t.id, t]));
    const artistById = new Map(artistRows.map((a) => [a.id, a]));
    const addedAtByTrack = new Map(library.map((e) => [e.trackId, e.addedAt]));

    const tracks = library.map((entry) => {
      const track = trackById.get(entry.trackId);
      if (!track) return null;
      const artist = artistById.get(track.artistId);
      return {
        id: track.id,
        title: track.title,
        artistId: track.artistId,
        artistName: artist?.name ?? "Unknown Artist",
        albumId: track.albumId,
        albumTitle: track.albumTitle,
        albumCoverUrl: track.albumCoverArtUrl,
        duration: track.duration,
        addedAt: addedAtByTrack.get(entry.trackId)?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ tracks: tracks.filter(Boolean), total: tracks.length });
  } catch (error) {
    console.error("Failed to fetch library:", error);
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await service.addToLibrary(userId, body);
    return NextResponse.json({ success: true, entry: result });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Failed to add to library:", error);
    return NextResponse.json({ error: "Failed to add to library" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const trackId = url.searchParams.get("trackId");
  const id = url.searchParams.get("id");

  try {
    if (trackId) {
      await service.removeTrackFromLibrary(userId, trackId);
    } else if (id) {
      await service.removeFromLibrary(id, userId);
    } else {
      return NextResponse.json({ error: "Provide trackId or id query param" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from library:", error);
    return NextResponse.json({ error: "Failed to remove from library" }, { status: 500 });
  }
}
