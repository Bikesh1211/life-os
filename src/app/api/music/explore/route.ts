import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getExploreAlbums } from "@/modules/music/itunes";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") ?? "all";

    if (section === "new-releases") {
      const albums = await getExploreAlbums(10);
      return NextResponse.json({ section: "new-releases", items: albums });
    }

    const topAlbums = await getExploreAlbums(12);

    return NextResponse.json({
      newReleases: topAlbums,
      trending: [],
      recommendations: [],
    });
  } catch (error) {
    return NextResponse.json({
      newReleases: [],
      trending: [],
      recommendations: [],
    });
  }
}
