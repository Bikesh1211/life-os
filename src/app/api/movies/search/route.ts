import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { searchMedia, searchPeople } from "@/modules/movies/service";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";

  try {
    let media: any[] = [];
    let people: any[] = [];

    if (type === "all" || type === "movie" || type === "tv") {
      media = await searchMedia(query);
    }
    if (type === "all" || type === "person") {
      people = await searchPeople(query);
    }

    return NextResponse.json({ media, people });
  } catch {
    return NextResponse.json({ media: [], people: [] });
  }
}
