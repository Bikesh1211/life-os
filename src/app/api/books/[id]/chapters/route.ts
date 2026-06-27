import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getChapters, addChapter, createChapterSchema, reorderBookChapters } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const chapters = await getChapters(id);
  return NextResponse.json(chapters);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createChapterSchema.parse({ ...body, bookId: id });
    const chapter = await addChapter(parsed);
    return NextResponse.json(chapter, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create chapter";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected array of reorder items" }, { status: 400 });
    }
    await reorderBookChapters(body);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reorder chapters";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
