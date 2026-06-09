import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [streaks, totalHoursResult, recentHistory] = await Promise.all([
      repo.getListeningStreaks(userId),
      repo.getTotalListeningHours(userId),
      repo.getListeningHistory(userId, 10, 0),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = streaks.filter((s) => s.date === today);
    const todayMinutes = totalHoursResult * 60;
    const streakDays = calculateStreak(streaks.map((s) => s.date));

    const albumIds = new Set(
      recentHistory.filter((e) => e.trackId).map((e) => e.trackId),
    );

    return NextResponse.json({
      stats: {
        listeningTime: `${Math.round(todayMinutes)}m`,
        songsPlayed: todayEntries.length,
        albumsExplored: albumIds.size,
        streak: streakDays.days,
      },
      recentlyPlayed: [],
      obsessions: [],
      memories: [],
      goals: [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
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
