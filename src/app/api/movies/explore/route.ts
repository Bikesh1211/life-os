import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getTrending, getPopular, getTopRated, TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

async function map(items: any[]) {
  return items.slice(0, 12).map((r) => ({
    id: `${r.media_type}-${r.id}`,
    title: r.title ?? r.name ?? "",
    subtitle: r.media_type === "movie" ? "Movie" : "TV",
    imageUrl: r.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${r.poster_path}` : null,
    mediaType: r.media_type,
    voteAverage: r.vote_average ?? null,
  }));
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [trending, popular, topRated] = await Promise.allSettled([
      getTrending("all", "week"), getPopular("movie"), getTopRated("movie"),
    ]);
    return NextResponse.json({
      trending: await map(trending.status === "fulfilled" ? trending.value : []),
      popular: await map(popular.status === "fulfilled" ? popular.value : []),
      topRated: await map(topRated.status === "fulfilled" ? topRated.value : []),
    });
  } catch {
    return NextResponse.json({ trending: [], popular: [], topRated: [] });
  }
}
