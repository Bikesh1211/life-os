import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  getKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  updateEntrySchema,
} from "@/modules/knowledge";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const entry = await getKnowledgeEntry(id, userId);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateEntrySchema.parse(body);
    const entry = await updateKnowledgeEntry(id, userId, parsed);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const entry = await deleteKnowledgeEntry(id, userId);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
