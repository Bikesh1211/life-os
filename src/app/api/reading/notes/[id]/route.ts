import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  updateReadingNote,
  deleteReadingNote,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = await params;
  const note = await updateReadingNote(id, userId, body);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await deleteReadingNote(id, userId);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
