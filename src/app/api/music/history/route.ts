import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { logListening, getListeningHistory, createListeningSchema } from "@/modules/music";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const entries = await getListeningHistory(userId, limit, offset);

    const mapped = entries.map((e: any) => ({
      id: e.id,
      trackName: e.trackName ?? null,
      artistName: e.artistName ?? null,
      listenedAt: e.listenedAt?.toISOString?.() ?? e.listenedAt,
      duration: e.duration ?? null,
    }));

    const nextOffset = mapped.length === limit ? offset + limit : null;

    return NextResponse.json({ entries: mapped, nextOffset });
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createListeningSchema.parse(body);
    const entry = await logListening(userId, parsed);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log listening" }, { status: 500 });
  }
}
