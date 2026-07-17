import { db } from "@/core/database/client";
import { englishWords, englishUserVocabulary, englishQuizAttempts, englishDailyWords } from "./schema";
import { and, eq, isNull, asc, desc, inArray, sql, gte, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type EnglishWord = InferSelectModel<typeof englishWords>;
export type UserVocabulary = InferSelectModel<typeof englishUserVocabulary>;
export type QuizAttempt = InferSelectModel<typeof englishQuizAttempts>;
export type DailyWord = InferSelectModel<typeof englishDailyWords>;

export async function searchWords(query: string, limit = 20): Promise<EnglishWord[]> {
  return db
    .select()
    .from(englishWords)
    .where(sql`LOWER(${englishWords.word}) LIKE ${`%${query.toLowerCase()}%`}`)
    .limit(limit)
    .orderBy(asc(englishWords.word));
}

export async function getWordById(id: string): Promise<EnglishWord | null> {
  const [word] = await db.select().from(englishWords).where(eq(englishWords.id, id));
  return word ?? null;
}

export async function getWordsByTopic(topic: string): Promise<EnglishWord[]> {
  return db
    .select()
    .from(englishWords)
    .where(eq(englishWords.topic, topic))
    .orderBy(asc(englishWords.word));
}

export async function getWordsForQuiz(excludeIds: string[], limit = 4): Promise<EnglishWord[]> {
  if (excludeIds.length === 0) {
    return db.select().from(englishWords).orderBy(sql`RANDOM()`).limit(limit);
  }
  return db
    .select()
    .from(englishWords)
    .where(sql`${englishWords.id} NOT IN (${sql.join(excludeIds.map((id) => sql`${id}::uuid`), sql`, `)})`)
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

export async function createWord(input: Partial<EnglishWord>): Promise<EnglishWord> {
  const [word] = await db.insert(englishWords).values(input as any).returning();
  return word;
}

export async function addWordToVocabulary(userId: string, wordId: string): Promise<UserVocabulary> {
  const [entry] = await db
    .insert(englishUserVocabulary)
    .values({ userId, wordId })
    .onConflictDoNothing()
    .returning();
  return entry;
}

export async function getUserVocabulary(userId: string) {
  return db
    .select()
    .from(englishUserVocabulary)
    .where(and(eq(englishUserVocabulary.userId, userId), isNull(englishUserVocabulary.deletedAt)))
    .innerJoin(englishWords, eq(englishUserVocabulary.wordId, englishWords.id))
    .orderBy(desc(englishUserVocabulary.addedAt));
}

export async function updateVocabularyEntry(id: string, userId: string, updates: Partial<UserVocabulary>) {
  const [entry] = await db
    .update(englishUserVocabulary)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(englishUserVocabulary.id, id), eq(englishUserVocabulary.userId, userId)))
    .returning();
  return entry ?? null;
}

export async function getVocabularyStats(userId: string) {
  const [result] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      learning: sql<number>`COUNT(*) FILTER (WHERE mastery = 'learning')`,
      known: sql<number>`COUNT(*) FILTER (WHERE mastery = 'known')`,
      mastered: sql<number>`COUNT(*) FILTER (WHERE mastery = 'mastered')`,
      favorites: sql<number>`COUNT(*) FILTER (WHERE is_favorite = true)`,
    })
    .from(englishUserVocabulary)
    .where(and(eq(englishUserVocabulary.userId, userId), isNull(englishUserVocabulary.deletedAt)));
  return result;
}

export async function getDailyStreak(userId: string): Promise<number> {
  const days = await db
    .select({
      date: sql<string>`DISTINCT DATE(created_at)`,
    })
    .from(englishQuizAttempts)
    .where(eq(englishQuizAttempts.userId, userId))
    .orderBy(sql`DATE(created_at) DESC`)
    .limit(365);

  if (days.length === 0) return 0;

  let streak = 1;
  const today = new Date().toISOString().split("T")[0];
  if (days[0].date !== today && days[0].date !== getYesterday()) return 0;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1].date);
    const curr = new Date(days[i].date);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export async function recordQuizAttempt(attempt: {
  userId: string;
  wordId: string;
  quizType: string;
  correct: boolean;
  responseTimeMs?: number;
}): Promise<QuizAttempt> {
  const [record] = await db.insert(englishQuizAttempts).values(attempt).returning();
  return record;
}

export async function getQuizAccuracy(userId: string, days = 7) {
  const since = new Date(Date.now() - days * 86400000);
  const [result] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      correct: sql<number>`COUNT(*) FILTER (WHERE correct = true)`,
    })
    .from(englishQuizAttempts)
    .where(and(eq(englishQuizAttempts.userId, userId), gte(englishQuizAttempts.createdAt, since)));
  return { total: result.total, correct: result.correct, accuracy: result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0 };
}

export async function getQuizAttemptsThisWeek(userId: string) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return db
    .select()
    .from(englishQuizAttempts)
    .where(and(eq(englishQuizAttempts.userId, userId), gte(englishQuizAttempts.createdAt, weekStart)))
    .orderBy(desc(englishQuizAttempts.createdAt));
}

export async function getDailyWordForDate(date: string): Promise<EnglishWord | null> {
  const [daily] = await db
    .select()
    .from(englishDailyWords)
    .where(and(eq(englishDailyWords.scheduledDate, date), eq(englishDailyWords.isActive, true)))
    .limit(1);
  if (!daily) return null;
  return getWordById(daily.wordId);
}

export async function getUserDailyWords(userId: string) {
  return db
    .select()
    .from(englishDailyWords)
    .where(eq(englishDailyWords.isActive, true))
    .innerJoin(englishWords, eq(englishDailyWords.wordId, englishWords.id));
}

export async function getWordsNeedingReview(userId: string, limit = 20) {
  return db
    .select()
    .from(englishUserVocabulary)
    .where(
      and(
        eq(englishUserVocabulary.userId, userId),
        isNull(englishUserVocabulary.deletedAt),
        sql`${englishUserVocabulary.nextReviewAt} IS NOT NULL AND ${englishUserVocabulary.nextReviewAt} <= NOW()`,
      ),
    )
    .innerJoin(englishWords, eq(englishUserVocabulary.wordId, englishWords.id))
    .limit(limit)
    .orderBy(asc(englishUserVocabulary.nextReviewAt));
}

export async function removeFromVocabulary(id: string, userId: string) {
  const [entry] = await db
    .update(englishUserVocabulary)
    .set({ deletedAt: new Date() })
    .where(and(eq(englishUserVocabulary.id, id), eq(englishUserVocabulary.userId, userId)))
    .returning();
  return entry ?? null;
}
