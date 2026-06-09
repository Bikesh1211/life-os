import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchQuerySchema } from "@/modules/music";
import { searchItunes } from "@/modules/music/itunes";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const type = (searchParams.get("type") ?? "track") as "artist" | "album" | "track";

    const parsed = searchQuerySchema.parse({ q, type });

    const results = await searchItunes(parsed.q, parsed.type as "artist" | "album" | "track");
    return NextResponse.json({ results, type: parsed.type, query: parsed.q, source: "itunes" });
  } catch (error) {
    return NextResponse.json({ error: "Search failed", detail: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
