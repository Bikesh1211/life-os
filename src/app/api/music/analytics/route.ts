import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [topArtists, streaks, totalHours, yearlyStats] = await Promise.all([
      repo.getMostListenedArtists(userId),
      repo.getListeningStreaks(userId),
      repo.getTotalListeningHours(userId),
      repo.getYearlyListeningStats(userId, new Date().getFullYear()),
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
            const track = await repo.getTrackById(a.artistId);
            if (track) {
              const artist = await repo.getArtistById(track.artistId);
              return { name: artist?.name ?? "Unknown", count: Number(a.count) ?? 0 };
            }
          }
          return { name: "Unknown", count: Number(a.count) ?? 0 };
        }),
      ),
      yearlyStats: {
        totalSongs,
        uniqueArtists: 0,
        uniqueAlbums: 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

function calculateStreak(dates: string[]) {
  if (dates.length === 0) return { days: 0, longest: 0 };
  const sorted = [...new Set(dates)].sort().reverse();
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.abs(diff - 1) < 0.1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (diff === 0) {
      continue;
    } else {
      break;
    }
  }
  currentStreak = tempStreak;
  return { days: currentStreak, longest: longestStreak };
}
