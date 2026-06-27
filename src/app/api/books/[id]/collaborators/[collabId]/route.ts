import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, modifyCollaborator, updateCollaboratorSchema, removeCollaborator } from "@/modules/books";

type Params = { params: Promise<{ id: string; collabId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = updateCollaboratorSchema.parse(body);
    const { collabId } = await params;
    const collaborator = await modifyCollaborator(collabId, parsed);
    if (!collaborator) return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    return NextResponse.json(collaborator);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update collaborator";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { collabId } = await params;
  const collaborator = await removeCollaborator(collabId);
  if (!collaborator) return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
