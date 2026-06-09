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
    // iTunes proxy IDs — skip DB, fetch tracks from iTunes
    if (id.startsWith("itunes-")) {
      const { getAlbumTracks } = await import("@/modules/music/itunes");
      const data = await getAlbumTracks(id.replace("itunes-", ""));
      return NextResponse.json({
        id,
        title: data.title,
        artistId: String(data.artistId ?? ""),
        artistName: data.artistName,
        artistViewUrl: data.artistViewUrl,
        coverArtUrl: data.coverArtUrl,
        collectionViewUrl: data.collectionViewUrl,
        releaseDate: data.releaseDate,
        totalTracks: data.totalTracks,
        genre: data.primaryGenreName,
        explicit: data.collectionExplicitness === "explicit",
        copyright: data.copyright,
        country: data.country,
        isFavorited: false,
        tracks: data.tracks.map((t) => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          trackNumber: t.trackNumber,
          discNumber: t.discNumber,
          explicit: t.explicit,
          previewUrl: t.previewUrl,
          trackViewUrl: t.trackViewUrl,
          artistName: t.artistName,
        })),
        stats: { plays: 0, rating: null, listeningHours: 0 },
      });
    }

    // Try local UUID first
    let album = await repo.getAlbumById(id);

    // Try Spotify ID next
    if (!album) {
      album = await repo.getAlbumBySpotifyId(id);
    }

    // Sync from Spotify if still not found
    if (!album) {
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
