import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getNote, updateNoteEntry, deleteNoteEntry, togglePinNote, toggleArchiveNote, restoreNoteEntry, duplicateNoteEntry } from "@/modules/notes";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const entry = await getNote(id, userId);
    if (!entry) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    let result;
    if (body._action === "togglePin") {
      result = await togglePinNote(id, userId);
    } else if (body._action === "toggleArchive") {
      result = await toggleArchiveNote(id, userId);
    } else if (body._action === "restore") {
      result = await restoreNoteEntry(id, userId);
    } else if (body._action === "duplicate") {
      result = await duplicateNoteEntry(id, userId);
    } else {
      result = await updateNoteEntry(id, userId, body);
    }

    if (!result) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const entry = await deleteNoteEntry(id, userId);
    if (!entry) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
