import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addBookmark, getEntryBookmarksForUser, removeBookmark } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const bookmarks = await getEntryBookmarksForUser(userId, id);
    return NextResponse.json(bookmarks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const bookmark = await addBookmark(userId, id, body);
    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("bookmarkId");
    if (!bookmarkId) return NextResponse.json({ error: "bookmarkId query param required" }, { status: 400 });

    const deleted = await removeBookmark(bookmarkId, userId);
    if (!deleted) return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
