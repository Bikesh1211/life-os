import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { restoreJournalEntryVersion } from "@/modules/journal";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, versionId } = await params;
    const entry = await restoreJournalEntryVersion(versionId, id, userId);
    if (!entry) return NextResponse.json({ error: "Version or entry not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
