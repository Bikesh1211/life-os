import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/core/database";
import { eq, desc, sql } from "drizzle-orm";
import {
  musicMemories,
  musicJournal,
  musicListeningHistory,
  musicFavorites,
  musicTracks,
  musicArtists,
  musicAlbums,
} from "@/modules/music";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [memories, journalEntries, history, favorites] = await Promise.all([
      db
        .select({
          id: musicMemories.id,
          createdAt: musicMemories.createdAt,
          contextText: musicMemories.contextText,
          trackName: musicTracks.title,
          artistName: musicArtists.name,
        })
        .from(musicMemories)
        .leftJoin(musicTracks, eq(musicMemories.trackId, musicTracks.id))
        .leftJoin(musicArtists, eq(musicMemories.artistId, musicArtists.id))
        .where(eq(musicMemories.userId, userId))
        .orderBy(desc(musicMemories.createdAt))
        .limit(50),

      db
        .select({
          id: musicJournal.id,
          createdAt: musicJournal.createdAt,
          journalEntry: musicJournal.journalEntry,
          mood: musicJournal.mood,
          trackName: musicTracks.title,
          artistName: musicArtists.name,
        })
        .from(musicJournal)
        .leftJoin(musicTracks, eq(musicJournal.trackId, musicTracks.id))
        .leftJoin(musicArtists, eq(musicJournal.artistId, musicArtists.id))
        .where(eq(musicJournal.userId, userId))
        .orderBy(desc(musicJournal.createdAt))
        .limit(50),

      db
        .select({
          id: musicListeningHistory.id,
          artistName: musicListeningHistory.artistName,
          trackName: musicListeningHistory.trackName,
          listenedAt: musicListeningHistory.listenedAt,
          resolvedTrackName: musicTracks.title,
          resolvedArtistName: musicArtists.name,
        })
        .from(musicListeningHistory)
        .leftJoin(musicTracks, eq(musicListeningHistory.trackId, musicTracks.id))
        .leftJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
        .where(eq(musicListeningHistory.userId, userId))
        .orderBy(desc(musicListeningHistory.listenedAt))
        .limit(50),

      db
        .select({
          id: musicFavorites.id,
          createdAt: musicFavorites.createdAt,
          entityType: musicFavorites.entityType,
          entityId: musicFavorites.entityId,
        })
        .from(musicFavorites)
        .where(eq(musicFavorites.userId, userId))
        .orderBy(desc(musicFavorites.createdAt))
        .limit(50),
    ]);

    const timeline = [
      ...memories.map((m) => ({
        id: m.id,
        date: m.createdAt.toISOString().slice(0, 10),
        title: m.trackName
          ? `Memory: ${m.trackName}${m.artistName ? ` · ${m.artistName}` : ""}`
          : "Music Memory",
        description: m.contextText.slice(0, 150),
        type: "memory" as const,
      })),
      ...journalEntries.map((j) => ({
        id: j.id,
        date: j.createdAt.toISOString().slice(0, 10),
        title: j.trackName
          ? `Journal: ${j.trackName}${j.artistName ? ` · ${j.artistName}` : ""}`
          : "Journal Entry",
        description: j.journalEntry.slice(0, 150),
        type: "journal" as const,
      })),
      ...history.map((h) => ({
        id: h.id,
        date: h.listenedAt.toISOString().slice(0, 10),
        title: `Listened: ${h.resolvedTrackName ?? h.trackName ?? "Unknown"}`,
        description: `by ${h.resolvedArtistName ?? h.artistName ?? "Unknown"}`,
        type: "listen" as const,
      })),
      ...favorites.map((f) => ({
        id: f.id,
        date: f.createdAt.toISOString().slice(0, 10),
        title: `Favorited ${f.entityType}`,
        description: f.entityId,
        type: "favorite" as const,
      })),
    ];

    timeline.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    return NextResponse.json({ timeline });
  } catch {
    return NextResponse.json({ error: "Failed to load timeline" }, { status: 500 });
  }
}
