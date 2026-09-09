import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  MusicListeningHistoryModel,
  MusicTrackModel,
  MusicAlbumModel,
  MusicArtistModel,
  MusicMemoryModel,
  MusicGoalConfigModel,
} from "@/lib/models";
import { calculateStreak } from "@/modules/music";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();

    const [historyResult, streaks, totalHoursResult, memoriesResult, goalsResult] = await Promise.all([
      // Recently played (last 10)
      MusicListeningHistoryModel.find({ userId })
        .sort({ listenedAt: -1 })
        .limit(10)
        .lean(),

      // Streaks
      MusicListeningHistoryModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$listenedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),

      // Total listening hours
      MusicListeningHistoryModel.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalSeconds: { $sum: { $ifNull: ["$duration", 0] } } } },
      ]),

      // Recent memories (unlinked)
      MusicMemoryModel.find({ userId, linkedEventId: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Goals
      MusicGoalConfigModel.find({ userId }).lean(),
    ]);

    const totalHours = ((totalHoursResult[0]?.totalSeconds ?? 0) as number) / 3600;

    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = streaks.filter((s: any) => s._id === today);
    const todayMinutes = totalHours * 60;
    const streakDays = calculateStreak(streaks.map((s: any) => s._id));

    // Resolve track/artist/album info for recently played
    const trackIds = [...new Set(historyResult.filter((r: any) => r.trackId).map((r: any) => String(r.trackId)))];
    const tracks = trackIds.length > 0
      ? await MusicTrackModel.find({ _id: { $in: trackIds } }).lean()
      : [];
    const trackMap = new Map(tracks.map((t: any) => [String(t._id), t]));

    const albumIds = [...new Set(tracks.filter((t: any) => t.albumId).map((t: any) => String(t.albumId)))];
    const albums = albumIds.length > 0
      ? await MusicAlbumModel.find({ _id: { $in: albumIds } }).lean()
      : [];
    const albumMap = new Map(albums.map((a: any) => [String(a._id), a]));

    const artistIds = [...new Set(tracks.filter((t: any) => t.artistId).map((t: any) => String(t.artistId)))];
    const artists = artistIds.length > 0
      ? await MusicArtistModel.find({ _id: { $in: artistIds } }).lean()
      : [];
    const artistMap = new Map(artists.map((a: any) => [String(a._id), a]));

    const seenTrackIds = new Set<string>();
    const recentlyPlayed = historyResult
      .filter((r: any) => {
        const tid = r.trackId ? String(r.trackId) : null;
        if (!tid) return true;
        if (seenTrackIds.has(tid)) return false;
        seenTrackIds.add(tid);
        return true;
      })
      .map((r: any) => {
        const tid = r.trackId ? String(r.trackId) : null;
        const track = tid ? trackMap.get(tid) : null;
        const album = track?.albumId ? albumMap.get(String(track.albumId)) : null;
        const artist = track?.artistId ? artistMap.get(String(track.artistId)) : null;
        return {
          id: tid ?? String(r._id),
          title: track?.title ?? r.trackName ?? "Unknown Track",
          coverArtUrl: album?.coverArtUrl,
          artistName: artist?.name ?? r.artistName,
        };
      });

    // Resolve memory track/artist names
    const memoryTrackIds = [...new Set(memoriesResult.filter((m: any) => m.trackId).map((m: any) => String(m.trackId)))];
    const memoryArtistIds = [...new Set(memoriesResult.filter((m: any) => m.artistId).map((m: any) => String(m.artistId)))];
    const [memTracks, memArtists] = await Promise.all([
      memoryTrackIds.length > 0 ? MusicTrackModel.find({ _id: { $in: memoryTrackIds } }).lean() : [],
      memoryArtistIds.length > 0 ? MusicArtistModel.find({ _id: { $in: memoryArtistIds } }).lean() : [],
    ]);
    const memTrackMap = new Map(memTracks.map((t: any) => [String(t._id), t.title]));
    const memArtistMap = new Map(memArtists.map((a: any) => [String(a._id), a.name]));

    const now = new Date();
    const memories = memoriesResult.map((r: any) => {
      const createdAt = new Date(r.createdAt);
      const yearsAgo = now.getFullYear() - createdAt.getFullYear();
      return {
        id: String(r._id),
        year: Math.max(1, yearsAgo),
        trackName: r.trackId ? (memTrackMap.get(String(r.trackId)) ?? undefined) : undefined,
        artistName: r.artistId ? (memArtistMap.get(String(r.artistId)) ?? undefined) : undefined,
        contextText: r.contextText,
      };
    });

    const goals = goalsResult.map((g: any) => ({
      id: String(g._id),
      label: g.targetValue ? `${capitalize(g.targetType)}: ${g.targetValue}` : capitalize(g.targetType),
      current: g.currentCount,
      target: g.targetCount ?? 0,
      unit: g.targetType,
    }));

    return NextResponse.json({
      stats: {
        listeningTime: `${Math.round(todayMinutes)}m`,
        songsPlayed: todayEntries.length ?? 0,
        albumsExplored: seenTrackIds.size,
        streak: streakDays.days,
      },
      recentlyPlayed,
      obsessions: [],
      memories,
      goals,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
