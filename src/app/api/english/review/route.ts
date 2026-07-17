import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getReviewWords } from "@/modules/english";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await getReviewWords(userId);
    const words = rows.map((r) => ({
      id: r.english_user_vocabulary.id,
      wordId: r.english_words.id,
      word: r.english_words.word,
      pronunciation: r.english_words.pronunciation ?? "",
      definition: (r.english_words.definitions as string[])?.[0] ?? "",
      partOfSpeech: r.english_words.partOfSpeech ?? "",
      exampleSentence: (r.english_words.exampleSentences as string[])?.[0] ?? "",
      mastery: r.english_user_vocabulary.mastery,
      reviewCount: r.english_user_vocabulary.reviewCount,
    }));
    return NextResponse.json(words);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch review words" }, { status: 500 });
  }
}
