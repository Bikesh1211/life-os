import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addCharacter, getCharacters, createCharacterSchema } from "@/modules/books";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const characters = await getCharacters(id);
    return NextResponse.json(characters);
  } catch {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = createCharacterSchema.parse({ ...body, bookId: id });
    const character = await addCharacter(userId, parsed);
    return NextResponse.json(character, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create character";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
