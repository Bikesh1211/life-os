import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { addCollectionItem, removeCollectionItem, addCollectionItemSchema } from "@/modules/music";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addCollectionItemSchema.parse(body);
    const item = await addCollectionItem(id, parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }
    await removeCollectionItem(itemId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
