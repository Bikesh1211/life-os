import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as service from "@/modules/music/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const memory = await service.getMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    const songs = await service.getMemorySongs(id);
    return NextResponse.json({ songs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch memory songs" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const song = await service.addSongToMemory(userId, id, body);
    return NextResponse.json({ success: true, song });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Memory not found") {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }
    console.error("Failed to add song to memory:", error);
    return NextResponse.json({ error: "Failed to add song to memory" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const songId = url.searchParams.get("songId");

  if (!songId) {
    return NextResponse.json({ error: "Provide songId query param" }, { status: 400 });
  }

  try {
    await service.removeSongFromMemory(songId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove song from memory" }, { status: 500 });
  }
}
