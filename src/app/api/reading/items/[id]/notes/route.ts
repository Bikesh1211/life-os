import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  createReadingNote,
  getReadingNotes,
  createNoteSchema,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const notes = await getReadingNotes(userId, { readingItemId: id });
  return NextResponse.json(notes);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const parsed = createNoteSchema.parse({ ...body, readingItemId: id });
    const note = await createReadingNote(userId, parsed);
    return NextResponse.json(note, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
