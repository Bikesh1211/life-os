import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { searchItunes } from "@/modules/music/itunes";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ artists: [], albums: [], tracks: [], query: q, source: "itunes" });
  }

  const [artistsRes, albumsRes, tracksRes] = await Promise.allSettled([
    searchItunes(q, "artist"),
    searchItunes(q, "album"),
    searchItunes(q, "track"),
  ]);

  return NextResponse.json({
    artists: artistsRes.status === "fulfilled" ? artistsRes.value : [],
    albums: albumsRes.status === "fulfilled" ? albumsRes.value : [],
    tracks: tracksRes.status === "fulfilled" ? tracksRes.value : [],
    query: q,
    source: "itunes",
  });
}