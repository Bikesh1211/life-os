import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchQuerySchema } from "@/modules/music";
import { searchItunes } from "@/modules/music/itunes";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") ?? "track") as "artist" | "album" | "track";

  const parsed = searchQuerySchema.safeParse({ q, type });

  if (!parsed.success) {
    return NextResponse.json({ results: [], type, query: q, source: "error" });
  }

  try {
    const results = await searchItunes(parsed.data.q, parsed.data.type as "artist" | "album" | "track");
    return NextResponse.json({ results, type: parsed.data.type, query: parsed.data.q, source: "itunes" });
  } catch {
    return NextResponse.json({ results: [], type: parsed.data.type, query: parsed.data.q, source: "error" });
  }
}