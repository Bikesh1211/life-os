import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [collection, items] = await Promise.all([repo.getCollectionById(id, userId), repo.getCollectionItems(id)]);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...collection, items });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await repo.deleteCollection(id, userId);
  return NextResponse.json({ success: true });
}
