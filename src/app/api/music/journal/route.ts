import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { createJournalEntry, getJournalEntries, createJournalSchema } from "@/modules/music";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entries = await getJournalEntries(userId);

    const mapped = entries.map((e: any) => ({
      id: e.id,
      mood: e.mood ?? null,
      journalEntry: e.journalEntry,
      trackName: e.trackName ?? null,
      artistName: e.artistName ?? null,
      createdAt: e.createdAt?.toISOString?.() ?? e.createdAt,
    }));

    return NextResponse.json({ entries: mapped });
  } catch {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createJournalSchema.parse(body);
    const entry = await createJournalEntry(userId, parsed);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 });
  }
}
