import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { updateNote, deleteNote, getNoteById, updateNoteSchema } from "@/modules/music";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const note = await getNoteById(id, userId);
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateNoteSchema.parse(body);
    const note = await updateNote(id, userId, parsed);
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const note = await deleteNote(id, userId);
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
