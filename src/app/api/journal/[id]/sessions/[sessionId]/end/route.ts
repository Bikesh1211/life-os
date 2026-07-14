import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { stopJournalWritingSession } from "@/modules/journal";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sessionId } = await params;
    const body = await request.json();
    const session = await stopJournalWritingSession(sessionId, userId, body.wordsAdded ?? 0);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
  }
}
