import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getBookProgress, saveReadingProgress, upsertProgressSchema } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const progress = await getBookProgress(userId, id);
  return NextResponse.json(progress ?? {});
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = upsertProgressSchema.parse({ ...body, bookId: (await params).id });
    const progress = await saveReadingProgress(userId, parsed);
    return NextResponse.json(progress);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save progress";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
