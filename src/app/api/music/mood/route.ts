import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { createMoodEntry, getMoodEntries, getMoodAnalytics, createMoodEntrySchema } from "@/modules/music";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined;

  try {
    const entries = await getMoodEntries(userId, { dateFrom, dateTo, limit, offset });
    const analytics = await getMoodAnalytics(userId);
    return NextResponse.json({ entries, analytics });
  } catch {
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createMoodEntrySchema.parse(body);
    const entry = await createMoodEntry(userId, parsed);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create mood entry" }, { status: 500 });
  }
}
