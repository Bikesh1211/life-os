import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, ratingsStats, watchlistStats, memoriesPerMonth] = await Promise.all([
      repo.getDashboardStats(userId),
      repo.getRatingsStats(userId),
      repo.getWatchlistStats(userId),
      repo.getMoviesWatchedPerMonth(userId),
    ]);

    const favoritesCount = Number((await repo.countFavorites(userId)));
    const memoriesCount = Number((await repo.countMemories(userId)));

    return NextResponse.json({
      ...stats,
      completedCount: watchlistStats.completed,
      watchingCount: watchlistStats.watching,
      favoritesCount,
      memoriesCount,
      ratingsCount: Number(ratingsStats.count),
      watchlistCount: Number(watchlistStats.total),
      memoriesPerMonth,
      averageRating: Number(ratingsStats.average),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
