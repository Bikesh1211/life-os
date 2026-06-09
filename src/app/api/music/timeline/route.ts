import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [memories, journalEntries] = await Promise.all([
      repo.getMemories(userId, 50, 0),
      repo.getJournalEntries(userId, 50, 0),
    ]);

    const timeline = [
      ...memories.map((m) => ({
        id: m.id,
        year: m.createdAt.getFullYear(),
        title: "Music Memory",
        description: m.contextText.slice(0, 100),
        type: "memory" as const,
      })),
      ...journalEntries.map((j) => ({
        id: j.id,
        year: j.createdAt.getFullYear(),
        title: "Journal Entry",
        description: j.journalEntry.slice(0, 100),
        type: "journal" as const,
      })),
    ];

    timeline.sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));

    return NextResponse.json({ timeline });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load timeline" }, { status: 500 });
  }
}
