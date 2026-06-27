import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, getBookCollaborators, inviteCollaborator, createCollaboratorSchema } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collaborators = await getBookCollaborators(id);
  return NextResponse.json(collaborators);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createCollaboratorSchema.parse({ ...body, bookId: id });
    const collaborator = await inviteCollaborator(parsed);
    return NextResponse.json(collaborator, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add collaborator";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
