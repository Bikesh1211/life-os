import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  getReadingItem,
  updateReadingItem,
  deleteReadingItem,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getReadingItem(id, userId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const item = await updateReadingItem(id, userId, body);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await deleteReadingItem(id, userId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
