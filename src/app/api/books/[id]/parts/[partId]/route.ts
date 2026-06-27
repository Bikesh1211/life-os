import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, modifyPart, removePart } from "@/modules/books";

type Params = { params: Promise<{ id: string; partId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, partId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const part = await modifyPart(partId, body);
    if (!part) return NextResponse.json({ error: "Part not found" }, { status: 404 });
    return NextResponse.json(part);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update part";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, partId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const part = await removePart(partId);
  if (!part) return NextResponse.json({ error: "Part not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
