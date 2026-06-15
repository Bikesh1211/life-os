import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/core/database";
import { eq, sql, count, desc } from "drizzle-orm";
import { musicJournal, calculateStreak } from "@/modules/music";
import * as repo from "@/modules/music/repository";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [topArtists, streaks, totalHours, yearlyStats, moodData] = await Promise.all([
      repo.getMostListenedArtists(userId),
      repo.getListeningStreaks(userId),
      repo.getTotalListeningHours(userId),
      repo.getYearlyListeningStats(userId, new Date().getFullYear()),
      db
        .select({
          mood: musicJournal.mood,
          count: count(),
        })
        .from(musicJournal)
        .where(eq(musicJournal.userId, userId))
        .groupBy(musicJournal.mood)
        .orderBy(desc(count())),
    ]);

    const streakDates = streaks.map((s: any) => s.date);

    // Today's stats
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = streaks.find((s: any) => s.date === today);
    const todayMinutes = Math.round((totalHours ?? 0) * 60);
    const streak = calculateStreak(streakDates);

    const totalSongs = yearlyStats.reduce((sum: number, m: any) => sum + Number(m.count), 0);

    return NextResponse.json({
      totalListeningHours: totalHours ?? 0,
      todayMinutes,
      songsPlayed: Number(todayEntry?.count ?? 0),
      currentStreak: streak.days,
      longestStreak: streak.longest,
      topArtists: await Promise.all(
        (topArtists ?? []).map(async (a: any) => {
          if (a.artistId) {
            const artist = await repo.getArtistById(a.artistId);
            return { name: artist?.name ?? "Unknown", count: Number(a.count) ?? 0 };
          }
          return { name: "Unknown", count: Number(a.count) ?? 0 };
        }),
      ),
      yearlyStats: {
        totalSongs,
        uniqueArtists: 0,
        uniqueAlbums: 0,
      },
      moodData: moodData.map((m) => ({ mood: m.mood ?? "unset", count: Number(m.count) })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}


