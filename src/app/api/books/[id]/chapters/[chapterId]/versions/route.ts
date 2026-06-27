import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getChapter, getChapterVersions, saveVersion } from "@/modules/books";

type Params = { params: Promise<{ id: string; chapterId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await getChapterVersions(chapterId);
  return NextResponse.json(versions);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json().catch(() => ({}));
    const version = await saveVersion(chapterId, body.note);
    if (!version) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    return NextResponse.json(version, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}
