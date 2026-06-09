import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";
import { syncArtistFromSpotify } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // iTunes proxy IDs — skip DB (no valid UUID) and iTunes lookup
    if (id.startsWith("itunes-")) {
      const { lookupItunesEntity } = await import("@/modules/music/itunes");
      const entity = await lookupItunesEntity(id.replace("itunes-", ""));
      if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        id: entity.id,
        name: entity.title,
        coverArtUrl: entity.imageUrl,
        imageUrl: entity.imageUrl,
        genres: [],
        popularity: null,
        albums: [],
        isFavorited: false,
        stats: { firstListened: "—", totalPlays: 0, listeningHours: 0 },
      });
    }

    // Try local UUID first
    let artist = await repo.getArtistById(id);

    // Try Spotify ID next (upsert)
    if (!artist) {
      artist = await repo.getArtistBySpotifyId(id);
    }

    // Sync from Spotify if still not found
    if (!artist) {
      try {
        artist = await syncArtistFromSpotify(id);
      } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const albums = await repo.getAlbumsByArtist(artist.id);
    const plays = await repo.getListeningHistoryByDateRange(
      userId,
      new Date(0),
      new Date(),
    );
    const totalPlays = plays.filter((p) => p.trackId).length;

    const favorite = await repo.getFavoritesByType(userId, "artist");
    const isFavorited = favorite.some((f) => f.entityId === artist.id);

    return NextResponse.json({
      id: artist.id,
      spotifyId: artist.spotifyId,
      name: artist.name,
      coverArtUrl: artist.imageUrl,
      imageUrl: artist.imageUrl,
      genres: artist.genres ?? [],
      popularity: artist.spotifyPopularity ?? null,
      isFavorited,
      albums: albums.map((a) => ({
        id: a.id,
        spotifyId: a.spotifyId,
        title: a.title,
        coverArtUrl: a.coverArtUrl,
        releaseDate: a.releaseDate?.toISOString() ?? null,
      })),
      stats: { firstListened: "—", totalPlays, listeningHours: 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load artist" }, { status: 500 });
  }
}
