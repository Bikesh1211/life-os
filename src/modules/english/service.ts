import { cache } from "react";
import { z } from "zod";
import {
  searchWords,
  getWordById,
  getWordsForQuiz as getWordsForQuizFromRepo,
  addWordToVocabulary,
  getUserVocabulary,
  updateVocabularyEntry,
  getVocabularyStats,
  recordQuizAttempt,
  getQuizAccuracy,
  getQuizAttemptsThisWeek,
  getDailyStreak,
  getDailyWordForDate,
  getWordsNeedingReview,
  removeFromVocabulary,
  getWordsByTopic,
} from "./repository";

// ── Zod schemas ──

export const wordSchema = z.object({
  word: z.string().min(1).max(100),
  pronunciation: z.string().max(200).optional(),
  partOfSpeech: z.string().max(50).optional(),
  definitions: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  collocations: z.array(z.string()).optional(),
  exampleSentences: z.array(z.string()).optional(),
  topic: z.string().max(50).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

export const vocabularyUpdateSchema = z.object({
  mastery: z.enum(["new", "learning", "known", "mastered"]).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().optional(),
});

export type CreateWordParams = z.infer<typeof wordSchema>;
export type UpdateVocabularyParams = z.infer<typeof vocabularyUpdateSchema>;

// ── Word lookup ──

export const searchEnglishWords = cache(async (query: string) => {
  return searchWords(query);
});

export const getEnglishWord = cache(async (id: string) => {
  return getWordById(id);
});

// ── Vocabulary management ──

export async function addWord(userId: string, wordId: string) {
  const existing = await addWordToVocabulary(userId, wordId);
  if (!existing) return { error: "Word already in vocabulary" };
  return existing;
}

export const getVocabulary = cache(async (userId: string) => {
  return getUserVocabulary(userId);
});

export async function updateWord(id: string, userId: string, updates: UpdateVocabularyParams) {
  return updateVocabularyEntry(id, userId, updates);
}

export async function deleteWord(id: string, userId: string) {
  return removeFromVocabulary(id, userId);
}

// ── Quiz ──

export async function submitQuizAnswer(params: {
  userId: string;
  wordId: string;
  quizType: string;
  correct: boolean;
  responseTimeMs?: number;
}) {
  const attempt = await recordQuizAttempt(params);

  if (params.correct) {
    const vocab = await getUserVocabulary(params.userId);
    const entry = vocab.find((v) => v.english_words.id === params.wordId);
    if (entry) {
      const reviewCount = (entry.english_user_vocabulary.reviewCount ?? 0) + 1;
      let mastery = entry.english_user_vocabulary.mastery;
      if (mastery === "new" && reviewCount >= 2) mastery = "learning";
      else if (mastery === "learning" && reviewCount >= 5) mastery = "known";
      else if (mastery === "known" && reviewCount >= 10) mastery = "mastered";

      const nextReviewMs = getNextReviewInterval(reviewCount);
      await updateVocabularyEntry(entry.english_user_vocabulary.id, params.userId, {
        mastery: mastery as any,
        reviewCount,
        lastReviewedAt: new Date(),
        nextReviewAt: new Date(Date.now() + nextReviewMs),
      });
    }
  }

  return attempt;
}

function getNextReviewInterval(reviewCount: number): number {
  if (reviewCount <= 2) return 86400000;
  if (reviewCount <= 4) return 3 * 86400000;
  if (reviewCount <= 6) return 7 * 86400000;
  if (reviewCount <= 8) return 14 * 86400000;
  return 30 * 86400000;
}

// ── Quiz generators ──

export function getWordsForQuiz(wordIds: string[], limit: number) {
  return getWordsForQuizFromRepo(wordIds, limit);
}

export function generateMultipleChoice(correctWord: { word: string; definitions: string[] }, distractors: string[]): {
  question: string;
  options: { text: string; isCorrect: boolean }[];
} {
  const correctDefinition = correctWord.definitions?.[0] ?? "";
  const options = [
    { text: correctDefinition, isCorrect: true },
    ...distractors.map((d) => ({ text: d, isCorrect: false })),
  ].sort(() => Math.random() - 0.5);

  return {
    question: `What does "${correctWord.word}" mean?`,
    options,
  };
}

export function generateFillBlank(
  word: string,
  exampleSentences: string[],
): { sentence: string; answer: string } | null {
  const sentence = exampleSentences?.[0];
  if (!sentence) return null;
  const blanked = sentence.replace(new RegExp(word, "gi"), "______");
  return { sentence: blanked, answer: word };
}

// ── Analytics ──

export const getEnglishStats = cache(async (userId: string) => {
  const [stats, accuracy, weeklyAttempts, dailyStreak] = await Promise.all([
    getVocabularyStats(userId),
    getQuizAccuracy(userId),
    getQuizAttemptsThisWeek(userId),
    getDailyStreak(userId),
  ]);
  return { ...stats, ...accuracy, weeklyAttempts: weeklyAttempts.length, dailyStreak };
});

// ── Daily Word ──

export const getDailyWord = cache(async (date: string) => {
  return getDailyWordForDate(date);
});

// ── Review ──

export const getReviewWords = cache(async (userId: string) => {
  return getWordsNeedingReview(userId);
});
