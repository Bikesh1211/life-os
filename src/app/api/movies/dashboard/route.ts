import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, recentMemories, favorites, watchlist, memoriesPerMonth] = await Promise.all([
      repo.getDashboardStats(userId),
      repo.getMemories(userId, 5),
      repo.getFavorites(userId),
      repo.getWatchlist(userId),
      repo.getMoviesWatchedPerMonth(userId),
    ]);

    return NextResponse.json({ stats, recentMemories, favorites, watchlist, memoriesPerMonth });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
