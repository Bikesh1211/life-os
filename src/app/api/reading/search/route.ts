import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReadingItems, getReadingAnnotations } from "@/modules/reading";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const [items, annotations] = await Promise.all([
      getReadingItems(userId, { search: q, limit: 20 }),
      getReadingAnnotations(userId, { search: q }),
    ]);

    return NextResponse.json({ items, annotations });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
