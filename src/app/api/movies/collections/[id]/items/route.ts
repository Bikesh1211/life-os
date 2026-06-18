import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const collection = await repo.getCollectionById(id, userId);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { mediaId } = await request.json();
  return NextResponse.json(await repo.addCollectionItem(id, mediaId), { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (itemId) await repo.removeCollectionItem(itemId);
  return NextResponse.json({ success: true });
}
