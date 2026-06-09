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
    // iTunes proxy IDs — skip DB, fetch from iTunes
    if (id.startsWith("itunes-")) {
      const { getArtistAlbumsAndTracks } = await import("@/modules/music/itunes");
      const data = await getArtistAlbumsAndTracks(id.replace("itunes-", ""));
      return NextResponse.json({
        id,
        name: data.name,
        imageUrl: data.imageUrl,
        coverArtUrl: data.imageUrl,
        genres: data.genres,
        popularity: null,
        isFavorited: false,
        albums: data.albums.map((a) => ({
          id: a.id,
          title: a.title,
          coverArtUrl: a.coverArtUrl,
          releaseDate: a.releaseDate,
        })),
        topTracks: data.tracks,
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
    const topTracks = await repo.getTracksByArtist(artist.id);
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
      topTracks: topTracks.map((t) => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
      })),
      stats: { firstListened: "—", totalPlays, listeningHours: 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load artist" }, { status: 500 });
  }
}
