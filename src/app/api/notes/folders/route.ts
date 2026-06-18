import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createNoteFolder, getNoteFolders, updateNoteFolder, deleteNoteFolder } from "@/modules/notes";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const folders = await getNoteFolders(userId);
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const folder = await createNoteFolder(userId, body);
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Folder ID required" }, { status: 400 });

    const folder = await updateNoteFolder(id, userId, data);
    if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    return NextResponse.json(folder);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Folder ID required" }, { status: 400 });

    const folder = await deleteNoteFolder(id, userId);
    if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
