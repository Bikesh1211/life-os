import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { addSongToJournal, getJournalSongs, removeSongFromJournal, addJournalSongSchema } from "@/modules/music";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const songs = await getJournalSongs(id);
    return NextResponse.json(songs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addJournalSongSchema.parse(body);
    const song = await addSongToJournal(userId, id, parsed);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("songId");
    if (!songId) {
      return NextResponse.json({ error: "songId query param required" }, { status: 400 });
    }
    await removeSongFromJournal(songId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove song" }, { status: 500 });
  }
}
