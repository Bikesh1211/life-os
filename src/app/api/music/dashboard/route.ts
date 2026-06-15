import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/core/database";
import { eq, and, desc, sql, gte, isNull } from "drizzle-orm";
import {
  musicListeningHistory,
  musicTracks,
  musicAlbums,
  musicArtists,
  musicMemories,
  musicGoalConfig,
  calculateStreak,
} from "@/modules/music";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [historyResult, streaks, totalHoursResult, memoriesResult, goalsResult] = await Promise.all([
      // Recently played (last 10, deduplicated by trackId, with JOINs)
      db
        .select({
          id: musicListeningHistory.id,
          trackId: musicListeningHistory.trackId,
          title: musicTracks.title,
          coverArtUrl: musicAlbums.coverArtUrl,
          artistName: musicArtists.name,
          listenedAt: musicListeningHistory.listenedAt,
        })
        .from(musicListeningHistory)
        .leftJoin(musicTracks, eq(musicListeningHistory.trackId, musicTracks.id))
        .leftJoin(musicAlbums, eq(musicTracks.albumId, musicAlbums.id))
        .leftJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
        .where(eq(musicListeningHistory.userId, userId))
        .orderBy(desc(musicListeningHistory.listenedAt))
        .limit(10),

      // Streaks
      db
        .select({
          date: sql<string>`DATE(${musicListeningHistory.listenedAt})`,
          count: sql<number>`count(*)`,
        })
        .from(musicListeningHistory)
        .where(eq(musicListeningHistory.userId, userId))
        .groupBy(sql`DATE(${musicListeningHistory.listenedAt})`)
        .orderBy(desc(sql`DATE(${musicListeningHistory.listenedAt})`)),

      // Total listening hours
      db
        .select({ hours: sql<number>`COALESCE(SUM(${musicListeningHistory.duration}) / 3600.0, 0)` })
        .from(musicListeningHistory)
        .where(eq(musicListeningHistory.userId, userId)),

      // Recent memories with JOINs
      db
        .select({
          id: musicMemories.id,
          contextText: musicMemories.contextText,
          trackName: musicTracks.title,
          artistName: musicArtists.name,
          createdAt: musicMemories.createdAt,
        })
        .from(musicMemories)
        .leftJoin(musicTracks, eq(musicMemories.trackId, musicTracks.id))
        .leftJoin(musicArtists, eq(musicMemories.artistId, musicArtists.id))
        .where(and(eq(musicMemories.userId, userId), isNull(musicMemories.linkedEventId)))
        .orderBy(desc(musicMemories.createdAt))
        .limit(5),

      // Goals
      db
        .select({
          id: musicGoalConfig.id,
          targetType: musicGoalConfig.targetType,
          targetValue: musicGoalConfig.targetValue,
          targetCount: musicGoalConfig.targetCount,
          currentCount: musicGoalConfig.currentCount,
        })
        .from(musicGoalConfig)
        .where(eq(musicGoalConfig.userId, userId)),
    ]);

    const totalHours = totalHoursResult[0]?.hours ?? 0;

    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = streaks.filter((s) => s.date === today);
    const todayMinutes = totalHours * 60;
    const streakDays = calculateStreak(streaks.map((s) => s.date));

    const seenTrackIds = new Set<string>();
    const recentlyPlayed = historyResult
      .filter((r) => {
        if (!r.trackId) return true;
        if (seenTrackIds.has(r.trackId)) return false;
        seenTrackIds.add(r.trackId);
        return true;
      })
      .map((r) => ({
        id: r.trackId ?? r.id,
        title: r.title ?? "Unknown Track",
        coverArtUrl: r.coverArtUrl,
        artistName: r.artistName,
      }));

    const now = new Date();
    const memories = memoriesResult.map((r) => {
      const createdAt = new Date(r.createdAt);
      const yearsAgo = now.getFullYear() - createdAt.getFullYear();
      return {
        id: r.id,
        year: Math.max(1, yearsAgo),
        trackName: r.trackName ?? undefined,
        artistName: r.artistName ?? undefined,
        contextText: r.contextText,
      };
    });

    const goals = goalsResult.map((g) => ({
      id: g.id,
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
