import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDailyWord } from "@/modules/english";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const today = new Date().toISOString().split("T")[0];
    const word = await getDailyWord(today);
    if (!word) return NextResponse.json({ error: "No daily word for today" }, { status: 404 });
    return NextResponse.json({
      id: word.id,
      word: word.word,
      pronunciation: word.pronunciation ?? "",
      definition: word.definition ?? "",
      partOfSpeech: word.partOfSpeech ?? "",
      exampleSentence: word.example ?? "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch daily word" }, { status: 500 });
  }
}
