import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getEnglishWord } from "@/modules/english";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const word = await getEnglishWord(id);
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json(word);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch word" }, { status: 500 });
  }
}
