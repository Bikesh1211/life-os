import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getNote, updateNoteEntry, deleteNoteEntry, togglePinNote, toggleArchiveNote } from "@/modules/notes";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const entry = await getNote(id, userId);
    if (!entry) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    let result;
    if (body._action === "togglePin") {
      result = await togglePinNote(id, userId);
    } else if (body._action === "toggleArchive") {
      result = await toggleArchiveNote(id, userId);
    } else {
      result = await updateNoteEntry(id, userId, body);
    }

    if (!result) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const entry = await deleteNoteEntry(id, userId);
    if (!entry) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
