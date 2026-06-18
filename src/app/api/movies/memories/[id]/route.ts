import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const memory = await repo.getMemoryById(id, userId);
  if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(memory);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  return NextResponse.json(await repo.updateMemory(id, userId, body));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await repo.deleteMemory(id, userId);
  return NextResponse.json({ success: true });
}
