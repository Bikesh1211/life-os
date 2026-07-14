import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { modifyResearchNote, removeResearchNote, updateResearchNoteSchema } from "@/modules/books";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  try {
    const body = await request.json();
    const parsed = updateResearchNoteSchema.parse(body);
    const note = await modifyResearchNote(noteId, parsed);
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  try {
    const result = await removeResearchNote(noteId);
    if (!result) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
