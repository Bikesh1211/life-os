import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";
import { syncAlbumFromSpotify } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Try local UUID first
    let album = await repo.getAlbumById(id);

    // Try Spotify ID next
    if (!album) {
      album = await repo.getAlbumBySpotifyId(id);
    }

    // Sync from Spotify if still not found
    if (!album) {
      if (id.startsWith("itunes-")) {
        const { lookupItunesEntity } = await import("@/modules/music/itunes");
        const entity = await lookupItunesEntity(id.replace("itunes-", ""));
        return NextResponse.json({
          id: entity.id,
          title: entity.title,
          artistName: entity.subtitle,
          coverArtUrl: entity.imageUrl,
          releaseDate: entity.releaseDate,
          totalTracks: null,
          tracks: [],
          isFavorited: false,
          stats: { plays: 0, rating: null, listeningHours: 0 },
        });
      }
      try {
        album = await syncAlbumFromSpotify(id);
      } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const artist = await repo.getArtistById(album.artistId);
    const tracks = await repo.getTracksByAlbum(album.id);
    const rating = await repo.getRatingByEntity(userId, "album", album.id);
    const favorite = await repo.getFavoritesByType(userId, "album");
    const isFavorited = favorite.some((f) => f.entityId === album.id);

    return NextResponse.json({
      id: album.id,
      spotifyId: album.spotifyId,
      title: album.title,
      artistId: album.artistId,
      artistName: artist?.name ?? "Unknown Artist",
      coverArtUrl: album.coverArtUrl,
      releaseDate: album.releaseDate?.toISOString() ?? null,
      totalTracks: album.totalTracks ?? tracks.length,
      isFavorited,
      tracks: tracks.map((t) => ({
        id: t.id,
        spotifyId: t.spotifyId,
        title: t.title,
        duration: t.duration,
        trackNumber: t.trackNumber,
      })),
      stats: { plays: 0, rating: rating?.score ?? null, listeningHours: 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load album" }, { status: 500 });
  }
}
