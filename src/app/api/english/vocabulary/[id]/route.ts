import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { updateWord, deleteWord } from "@/modules/english";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const result = await updateWord(id, userId, body);
    if (!result) return NextResponse.json({ error: "Vocabulary entry not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await deleteWord(id, userId);
    if (!result) return NextResponse.json({ error: "Vocabulary entry not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
