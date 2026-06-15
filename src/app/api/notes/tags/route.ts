import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNoteTag, getNoteTags, updateNoteTag, deleteNoteTag } from "@/modules/notes";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tags = await getNoteTags(userId);
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tag = await createNoteTag(userId, body);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Tag ID required" }, { status: 400 });
    }
    const tag = await updateNoteTag(id, userId, data);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Tag ID required" }, { status: 400 });
    }
    const tag = await deleteNoteTag(id, userId);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
