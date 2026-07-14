import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { modifyCharacter, removeCharacter, updateCharacterSchema } from "@/modules/books";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; characterId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId } = await params;
  try {
    const body = await request.json();
    const parsed = updateCharacterSchema.parse(body);
    const character = await modifyCharacter(characterId, parsed);
    if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });
    return NextResponse.json(character);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update character";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; characterId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId } = await params;
  try {
    const result = await removeCharacter(characterId);
    if (!result) return NextResponse.json({ error: "Character not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}
