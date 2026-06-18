import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createNoteLinkEntry, getNoteLinksWithDetails, getNoteBacklinks, deleteNoteLinkEntry } from "@/modules/notes";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const noteId = request.nextUrl.searchParams.get("noteId");
    const type = request.nextUrl.searchParams.get("type") ?? "outgoing";

    if (!noteId) return NextResponse.json({ error: "Note ID required" }, { status: 400 });

    if (type === "backlinks") {
      const backlinks = await getNoteBacklinks(noteId);
      return NextResponse.json(backlinks);
    }

    const links = await getNoteLinksWithDetails(noteId);
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { noteId, linkedNoteId } = body;
    if (!noteId || !linkedNoteId) {
      return NextResponse.json({ error: "noteId and linkedNoteId required" }, { status: 400 });
    }

    const link = await createNoteLinkEntry(noteId, linkedNoteId);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Link ID required" }, { status: 400 });

    const link = await deleteNoteLinkEntry(id);
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
