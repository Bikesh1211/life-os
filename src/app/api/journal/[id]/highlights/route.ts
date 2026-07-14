import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addHighlight, getEntryHighlightsForUser } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const highlights = await getEntryHighlightsForUser(userId, id);
    return NextResponse.json(highlights);
  } catch {
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const highlight = await addHighlight(userId, id, body);
    return NextResponse.json(highlight, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create highlight" }, { status: 500 });
  }
}
