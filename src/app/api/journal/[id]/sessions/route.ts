import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { startJournalWritingSession, getJournalEntrySessions } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const sessions = await getJournalEntrySessions(id, userId);
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const session = await startJournalWritingSession(userId, id);
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
