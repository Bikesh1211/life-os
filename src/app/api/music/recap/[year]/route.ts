import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getYearlyListeningStats } from "@/modules/music/repository";
import { getMemories, getMoodAnalytics } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const [monthlyListening, allMemories, moodAnalytics] = await Promise.all([
      getYearlyListeningStats(userId, yearNum),
      getMemories(userId, 1000, 0),
      getMoodAnalytics(userId, 365),
    ]);

    const yearMemories = allMemories.filter((m) => {
      if (!m.memoryDate) return false;
      const d = new Date(m.memoryDate);
      return d.getFullYear() === yearNum;
    });

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
