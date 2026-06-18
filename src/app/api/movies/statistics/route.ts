import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, favorites, memories, ratings, watchlist, memoriesPerMonth] = await Promise.all([
      repo.getDashboardStats(userId),
      repo.getFavorites(userId),
      repo.getMemories(userId),
      repo.getRatings(userId),
      repo.getWatchlist(userId),
      repo.getMoviesWatchedPerMonth(userId),
    ]);

    const completedCount = watchlist.filter((w) => w.status === "completed").length;
    const watchingCount = watchlist.filter((w) => w.status === "watching").length;

    return NextResponse.json({
      ...stats,
      completedCount,
      watchingCount,
      favoritesCount: favorites.length,
      memoriesCount: memories.length,
      ratingsCount: ratings.length,
      watchlistCount: watchlist.length,
      memoriesPerMonth,
      averageRating: ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
        : 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
