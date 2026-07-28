import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getChapter, modifyChapter, removeChapter } from "@/modules/books";

type Params = { params: Promise<{ id: string; chapterId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const chapter = await getChapter(chapterId, userId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  return NextResponse.json(chapter);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const chapter = await modifyChapter(chapterId, userId, body);
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    return NextResponse.json(chapter);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update chapter";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const chapter = await removeChapter(chapterId, userId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
