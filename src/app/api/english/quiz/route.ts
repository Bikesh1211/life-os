import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getWordsForQuiz, submitQuizAnswer, generateFillBlank } from "@/modules/english";

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function getExampleSentence(word: { exampleSentences: unknown }): string {
  const sentences = word.exampleSentences as string[] | undefined;
  return sentences?.[0] ?? "";
}

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "multiple_choice";

  try {
    const words = await getWordsForQuiz([], 4);
    if (words.length === 0) {
      return NextResponse.json({ error: "No words available for quiz" }, { status: 404 });
    }

    if (type === "fill_blank") {
      const word = words[0];
      const exampleSentence = getExampleSentence(word);
      if (!exampleSentence) {
        return NextResponse.json({ error: "No example sentences available" }, { status: 404 });
      }
      const result = generateFillBlank(word.word, [exampleSentence]);
      if (!result) {
        return NextResponse.json({ error: "Could not generate fill-blank question" }, { status: 404 });
      }
      return NextResponse.json({
        wordId: word.id,
        word: word.word,
        sentence: result.sentence,
        hint: (word.definitions as string[])?.[0] ?? null,
      });
    }

    const correct = words[0];
    const distractors = words.slice(1).map((w) => ((w.definitions as string[])?.[0] ?? w.word));
    const question = {
      wordId: correct.id,
      word: correct.word,
      definition: (correct.definitions as string[])?.[0] ?? "",
      options: shuffle([(correct.definitions as string[])?.[0] ?? "", ...distractors]),
    };
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await submitQuizAnswer({ userId, ...body });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
