import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";
import { syncTrackFromSpotify } from "@/modules/music";

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
      const { lookupItunesEntity } = await import("@/modules/music/itunes");
      const entity = await lookupItunesEntity(id.replace("itunes-", ""));
      if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        id: entity.id,
        title: entity.title,
        artistName: entity.subtitle,
        artistId: String(entity.artistId ?? ""),
        albumId: entity.collectionId ? `itunes-${entity.collectionId}` : null,
        albumTitle: entity.collectionName,
        albumCoverUrl: entity.imageUrl,
        duration: entity.trackTimeMillis ? Math.round(entity.trackTimeMillis / 1000) : null,
        trackNumber: entity.trackNumber,
        discNumber: entity.discNumber,
        explicit: entity.trackExplicitness === "explicit" || entity.collectionExplicitness === "explicit",
        genre: entity.primaryGenreName,
        releaseDate: entity.releaseDate,
        previewUrl: entity.previewUrl,
        trackViewUrl: entity.trackViewUrl,
        albumViewUrl: entity.collectionViewUrl,
        artistViewUrl: entity.artistViewUrl,
        isStreamable: entity.isStreamable,
        popularity: null,
        isFavorited: false,
        rating: null,
        journalEntries: [],
        memories: [],
      });
    }

    // Try local UUID first
    let track = await repo.getTrackById(id);

    // Try Spotify ID next
    if (!track) {
      track = await repo.getTrackBySpotifyId(id);
    }

    // Sync from Spotify if still not found
    if (!track) {
      try {
        track = await syncTrackFromSpotify(id);
      } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const artist = await repo.getArtistById(track.artistId);
    let albumCover: string | null = null;
    let albumTitle: string | null = null;

    if (track.albumId) {
      const album = await repo.getAlbumById(track.albumId);
      if (album) {
        albumCover = album.coverArtUrl;
        albumTitle = album.title;
      }
    }

    const journalEntries = await repo.getJournalEntriesByTrack(userId, track.id);
    const memories = await repo.getMemoriesByTrack(userId, track.id);
    const favorite = await repo.getFavoritesByType(userId, "track");
    const isFavorited = favorite.some((f) => f.entityId === track.id);
    const rating = await repo.getRatingByEntity(userId, "track", track.id);

    return NextResponse.json({
      id: track.id,
      spotifyId: track.spotifyId,
      title: track.title,
      artistId: track.artistId,
      artistName: artist?.name ?? "Unknown Artist",
      albumId: track.albumId,
      albumTitle,
      albumCoverUrl: albumCover,
      duration: track.duration,
      explicit: track.explicit,
      popularity: track.spotifyPopularity,
      isFavorited,
      rating: rating?.score ?? null,
      journalEntries: journalEntries.map((e) => ({
        id: e.id,
        mood: e.mood,
        journalEntry: e.journalEntry,
        createdAt: e.createdAt.toISOString(),
      })),
      memories: memories.map((m) => ({
        id: m.id,
        contextText: m.contextText,
        linkedEventId: m.linkedEventId,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load track" }, { status: 500 });
  }
}
