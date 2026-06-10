import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getMemoryById, updateMemory, deleteMemory, updateMemorySchema, getMemorySongs } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const memory = await getMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    const songs = await getMemorySongs(id);
    return NextResponse.json({ ...memory, songs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch memory" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateMemorySchema.parse(body);
    const memory = await updateMemory(id, userId, parsed);
    return NextResponse.json(memory);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await deleteMemory(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
