import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getJournalEntryVersions, saveJournalEntryVersion } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const versions = await getJournalEntryVersions(id);
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const version = await saveJournalEntryVersion(id, userId, body);
    if (!version) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json(version, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}
