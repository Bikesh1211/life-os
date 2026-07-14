import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addResearchNote, getResearchNotes, createResearchNoteSchema } from "@/modules/books";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const notes = await getResearchNotes(id);
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch research notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = createResearchNoteSchema.parse({ ...body, bookId: id });
    const note = await addResearchNote(userId, parsed);
    return NextResponse.json(note, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
