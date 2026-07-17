import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { searchEnglishWords } from "@/modules/english";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  try {
    if (q) {
      const words = await searchEnglishWords(q);
      const mapped = words.map((w) => ({
        id: w.id,
        word: w.word,
        pronunciation: w.pronunciation ?? "",
        definition: (w.definitions as string[])?.[0] ?? "",
        partOfSpeech: w.partOfSpeech ?? "",
      }));
      return NextResponse.json(mapped);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to search words" }, { status: 500 });
  }
}
