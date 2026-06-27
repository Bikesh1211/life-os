import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getBookBookmarks, addBookmark, createBookmarkSchema, removeBookmark } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const bookmarks = await getBookBookmarks(id, userId);
  return NextResponse.json(bookmarks);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createBookmarkSchema.parse({ ...body, bookId: id });
    const bookmark = await addBookmark(userId, parsed);
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create bookmark";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
