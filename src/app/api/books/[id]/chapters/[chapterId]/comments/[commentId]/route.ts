import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { editComment, updateCommentSchema, removeComment } from "@/modules/books";

type Params = { params: Promise<{ id: string; chapterId: string; commentId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = updateCommentSchema.parse(body);
    const { commentId } = await params;
    const comment = await editComment(commentId, userId, parsed);
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json(comment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const comment = await removeComment(commentId, userId);
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
