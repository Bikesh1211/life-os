"use server";

import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getVocabulary, addWord } from "@/modules/english";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await getVocabulary(userId);
    const vocabulary = rows.map((r) => ({
      id: r.english_user_vocabulary.id,
      wordId: r.english_words.id,
      word: r.english_words.word,
      pronunciation: r.english_words.pronunciation ?? "",
      definition: (r.english_words.definitions as string[])?.[0] ?? "",
      partOfSpeech: r.english_words.partOfSpeech ?? "",
      mastery: r.english_user_vocabulary.mastery,
      isFavorite: r.english_user_vocabulary.isFavorite,
      addedAt: r.english_user_vocabulary.addedAt.toISOString(),
    }));
    return NextResponse.json(vocabulary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { wordId } = await request.json();
    if (!wordId) return NextResponse.json({ error: "wordId is required" }, { status: 400 });

    const result = await addWord(userId, wordId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add word" }, { status: 500 });
  }
}
