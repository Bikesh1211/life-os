import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { getYearlyListeningStats } from "@/modules/music/repository";
import { getMemoriesByDateRange, getMoodAnalytics } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const yearStart = new Date(Date.UTC(yearNum, 0, 1));
    const yearEnd = new Date(Date.UTC(yearNum + 1, 0, 1));

    const [monthlyListening, yearMemories, moodAnalytics] = await Promise.all([
      getYearlyListeningStats(userId, yearNum),
      getMemoriesByDateRange(userId, yearStart, yearEnd),
      getMoodAnalytics(userId, 365),
    ]);

    return NextResponse.json({
      year: yearNum,
      monthlyListening,
      memoryCount: yearMemories.length,
      memories: yearMemories,
      moodAnalytics,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch recap" }, { status: 500 });
  }
}
