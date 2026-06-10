import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createMemory, getMemories, getMemoriesByMood, getMemoriesByDateRange, createMemorySchema } from "@/modules/music";
import { getMemoriesOnThisDay } from "@/modules/music/repository";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const onThisDay = searchParams.get("onThisDay");

  try {
    if (onThisDay === "true") {
      const now = new Date();
      const memories = await getMemoriesOnThisDay(userId, now.getMonth() + 1, now.getDate());
      return NextResponse.json(memories);
    }
    if (mood) {
      const memories = await getMemoriesByMood(userId, mood);
      return NextResponse.json(memories);
    }
    if (dateFrom && dateTo) {
      const memories = await getMemoriesByDateRange(userId, new Date(dateFrom), new Date(dateTo));
      return NextResponse.json(memories);
    }
    const memories = await getMemories(userId);
    return NextResponse.json(memories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // Transform frontend field names to schema names
    const mapped = {
      title: body.title,
      contextText: body.context ?? body.contextText,
      mood: body.mood,
      memoryDate: body.memoryDate
        ? body.memoryDate.includes("T")
          ? body.memoryDate
          : `${body.memoryDate}T00:00:00Z`
        : undefined,
      trackId: body.trackId,
      albumId: body.albumId,
      artistId: body.artistId,
      photoUrls: body.photoUrls,
      linkedEventId: body.linkedEventId,
    };

    const parsed = createMemorySchema.parse(mapped);
    const memory = await createMemory(userId, parsed);
    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
