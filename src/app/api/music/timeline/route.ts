import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  MusicMemoryModel,
  MusicJournalModel,
  MusicListeningHistoryModel,
  MusicFavoriteModel,
  MusicTrackModel,
  MusicArtistModel,
} from "@/lib/models";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();

    const [memories, journalEntries, history, favorites] = await Promise.all([
      MusicMemoryModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      MusicJournalModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      MusicListeningHistoryModel.find({ userId })
        .sort({ listenedAt: -1 })
        .limit(50)
        .lean(),

      MusicFavoriteModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    // Resolve track/artist names for memories
    const memoryTrackIds = [...new Set(memories.filter((m: any) => m.trackId).map((m: any) => String(m.trackId)))];
    const memoryArtistIds = [...new Set(memories.filter((m: any) => m.artistId).map((m: any) => String(m.artistId)))];

    const [memoryTracks, memoryArtists] = await Promise.all([
      memoryTrackIds.length > 0
        ? MusicTrackModel.find({ _id: { $in: memoryTrackIds } }).lean()
        : [],
      memoryArtistIds.length > 0
        ? MusicArtistModel.find({ _id: { $in: memoryArtistIds } }).lean()
        : [],
    ]);

    const trackMap = new Map(memoryTracks.map((t: any) => [String(t._id), t.title]));
    const artistMap = new Map(memoryArtists.map((a: any) => [String(a._id), a.name]));

    // Resolve track/artist names for journal entries
    const journalTrackIds = [...new Set(journalEntries.filter((j: any) => j.trackId).map((j: any) => String(j.trackId)))];
    const journalArtistIds = [...new Set(journalEntries.filter((j: any) => j.artistId).map((j: any) => String(j.artistId)))];

    const [journalTracks, journalArtists] = await Promise.all([
      journalTrackIds.length > 0
        ? MusicTrackModel.find({ _id: { $in: journalTrackIds } }).lean()
        : [],
      journalArtistIds.length > 0
        ? MusicArtistModel.find({ _id: { $in: journalArtistIds } }).lean()
        : [],
    ]);

    const journalTrackMap = new Map(journalTracks.map((t: any) => [String(t._id), t.title]));
    const journalArtistMap = new Map(journalArtists.map((a: any) => [String(a._id), a.name]));

    // Resolve track/artist names for listening history via trackId
    const historyTrackIds = [...new Set(history.filter((h: any) => h.trackId).map((h: any) => String(h.trackId)))];

    const historyTracks = historyTrackIds.length > 0
      ? await MusicTrackModel.find({ _id: { $in: historyTrackIds } }).lean()
      : [];

    const historyTrackMap = new Map(historyTracks.map((t: any) => [String(t._id), t.title]));

    // Resolve artist names from history tracks
    const historyArtistIds = [...new Set(historyTracks.map((t: any) => String(t.artistId)).filter(Boolean))];
    const historyArtists = historyArtistIds.length > 0
      ? await MusicArtistModel.find({ _id: { $in: historyArtistIds } }).lean()
      : [];
    const historyArtistMap = new Map(historyArtists.map((a: any) => [String(a._id), a.name]));

    const timeline = [
      ...memories.map((m: any) => ({
        id: String(m._id),
        date: new Date(m.createdAt).toISOString().slice(0, 10),
        title: m.trackId
          ? `Memory: ${trackMap.get(String(m.trackId)) ?? "Unknown"}${m.artistId ? ` · ${artistMap.get(String(m.artistId)) ?? ""}` : ""}`
          : "Music Memory",
        description: (m.contextText ?? "").slice(0, 150),
        type: "memory" as const,
      })),
      ...journalEntries.map((j: any) => ({
        id: String(j._id),
        date: new Date(j.createdAt).toISOString().slice(0, 10),
        title: j.trackId
          ? `Journal: ${journalTrackMap.get(String(j.trackId)) ?? "Unknown"}${j.artistId ? ` · ${journalArtistMap.get(String(j.artistId)) ?? ""}` : ""}`
          : "Journal Entry",
        description: (j.journalEntry ?? "").slice(0, 150),
        type: "journal" as const,
      })),
      ...history.map((h: any) => {
        const resolvedTrackName = h.trackId ? historyTrackMap.get(String(h.trackId)) : null;
        const track = h.trackId ? historyTracks.find((t: any) => String(t._id) === String(h.trackId)) : null;
        const resolvedArtistName = track?.artistId ? historyArtistMap.get(String(track.artistId)) : null;
        return {
          id: String(h._id),
          date: new Date(h.listenedAt).toISOString().slice(0, 10),
          title: `Listened: ${resolvedTrackName ?? h.trackName ?? "Unknown"}`,
          description: `by ${resolvedArtistName ?? h.artistName ?? "Unknown"}`,
          type: "listen" as const,
        };
      }),
      ...favorites.map((f: any) => ({
        id: String(f._id),
        date: new Date(f.createdAt).toISOString().slice(0, 10),
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
