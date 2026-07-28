import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { modifyQuestion, removeQuestion } from "@/modules/scripts";

type Params = { params: Promise<{ id: string; questionId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { questionId } = await params;
    const item = await modifyQuestion(questionId, userId, body);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update question";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await params;
  const item = await removeQuestion(questionId, userId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
