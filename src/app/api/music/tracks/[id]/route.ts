import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import * as repo from "@/modules/music/repository";
import * as service from "@/modules/music/service";
import { syncTrackFromSpotify } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
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
        isInLibrary: false,
        rating: null,
        journalEntries: [],
        memories: [],
        collections: [],
        notes: [],
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

    const [journalEntries, memories, favorite, rating, inLibrary, notes, memorySongLinks, collections] =
      await Promise.all([
        repo.getJournalEntriesByTrack(userId, track.id),
        repo.getMemoriesByTrack(userId, track.id),
        repo.getFavoritesByType(userId, "track"),
        repo.getRatingByEntity(userId, "track", track.id),
        service.isInLibrary(userId, track.id),
        repo.getNotesByEntity(userId, "track", track.id),
        repo.getMemoriesByTrackViaSongs(userId, track.id),
        repo.getCollectionItems(track.id).catch(() => []),
      ]);

    const isFavorited = favorite.some((f) => f.entityId === track.id);

    // Find collections containing this track
    const collectionIds = collections.map((ci) => ci.collectionId);
    const collectionDetails = collectionIds.length > 0
      ? await Promise.all(collectionIds.map((cid) => repo.getCollectionById(cid, userId)))
      : [];
    const validCollections = collectionDetails.filter(Boolean);

    // Merge direct memories + memory-song-linked memories
    const memorySongMemoryIds = memorySongLinks.map((l) => l.memoryId);
    const memorySongMemories = memorySongMemoryIds.length > 0
      ? await Promise.all(memorySongMemoryIds.map((mid) => repo.getMemoryById(mid, userId)))
      : [];
    const allMemories = [...memories, ...memorySongMemories.filter(Boolean)];

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
      isInLibrary: inLibrary,
      rating: rating?.score ?? null,
      journalEntries: journalEntries.map((e) => ({
        id: e.id,
        mood: e.mood,
        journalEntry: e.journalEntry,
        createdAt: e.createdAt.toISOString(),
      })),
      memories: allMemories.map((m) => ({
        id: m.id,
        title: m.title,
        contextText: m.contextText,
        mood: m.mood,
        memoryDate: m.memoryDate?.toISOString() ?? null,
        linkedEventId: m.linkedEventId,
        createdAt: m.createdAt.toISOString(),
      })),
      collections: validCollections.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
      })),
      notes: notes.map((n) => ({
        id: n.id,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load track:", error);
    return NextResponse.json({ error: "Failed to load track" }, { status: 500 });
  }
}
