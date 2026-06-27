import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { removeBookmark } from "@/modules/books";

type Params = { params: Promise<{ id: string; bookmarkId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookmarkId } = await params;
  const bookmark = await removeBookmark(bookmarkId, userId);
  if (!bookmark) return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
