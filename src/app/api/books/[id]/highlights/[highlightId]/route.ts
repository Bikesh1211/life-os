import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { modifyHighlight, updateHighlightSchema, removeHighlight } from "@/modules/books";

type Params = { params: Promise<{ id: string; highlightId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = updateHighlightSchema.parse(body);
    const { highlightId } = await params;
    const highlight = await modifyHighlight(highlightId, userId, parsed);
    if (!highlight) return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    return NextResponse.json(highlight);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update highlight";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { highlightId } = await params;
  const highlight = await removeHighlight(highlightId, userId);
  if (!highlight) return NextResponse.json({ error: "Highlight not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
