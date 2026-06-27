import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getParts, addPart, createPartSchema } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parts = await getParts(id);
  return NextResponse.json(parts);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createPartSchema.parse({ ...body, bookId: id });
    const part = await addPart(parsed);
    return NextResponse.json(part, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create part";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
