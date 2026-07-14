import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBooks, createNewBook, createBookSchema } from "@/modules/books";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};
    for (const key of ["status", "search", "sortBy", "sortOrder"] as const) {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    }

    const view = searchParams.get("view");
    if (view === "trash") filters.includeTrashed = true;
    else if (view === "drafts") filters.status = "draft";
    else if (view === "published") filters.status = "published";
    else if (view === "archive") filters.status = "archived";

    const tags = searchParams.get("tags");
    if (tags) filters.tags = tags.split(",");
    const limit = searchParams.get("limit");
    if (limit) filters.limit = parseInt(limit, 10);
    const offset = searchParams.get("offset");
    if (offset) filters.offset = parseInt(offset, 10);

    const items = await getBooks(userId, filters);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createBookSchema.parse(body);
    const book = await createNewBook(userId, parsed);
    return NextResponse.json(book, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create book";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
