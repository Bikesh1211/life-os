import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { modifyHighlight, removeHighlight } from "@/modules/journal";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; highlightId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { highlightId } = await params;
    const body = await request.json();
    const highlight = await modifyHighlight(highlightId, userId, body);
    if (!highlight) return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    return NextResponse.json(highlight);
  } catch {
    return NextResponse.json({ error: "Failed to update highlight" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; highlightId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { highlightId } = await params;
    const deleted = await removeHighlight(highlightId, userId);
    if (!deleted) return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete highlight" }, { status: 500 });
  }
}
