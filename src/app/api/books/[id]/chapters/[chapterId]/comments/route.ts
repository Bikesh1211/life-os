import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getChapter, getChapterComments, addComment, createCommentSchema } from "@/modules/books";

type Params = { params: Promise<{ id: string; chapterId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comments = await getChapterComments(chapterId, userId);
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, chapterId } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createCommentSchema.parse({ ...body, chapterId });
    const comment = await addComment(parsed);
    return NextResponse.json(comment, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
