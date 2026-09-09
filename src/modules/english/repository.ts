import { connectToDatabase } from "@/lib/mongodb";
import {
  EnglishVocabularyModel,
  EnglishQuizModel,
  EnglishQuizQuestionModel,
  EnglishStudySessionModel,
} from "@/lib/models/english";

export type EnglishWord = {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string | null;
  pronunciation?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserVocabulary = {
  id: string;
  userId: string;
  wordId: string;
  mastery: string;
  isFavorite: boolean;
  nextReviewAt?: Date | null;
  addedAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type QuizAttempt = {
  id: string;
  userId: string;
  wordId: string;
  quizType: string;
  correct: boolean;
  responseTimeMs?: number | null;
  createdAt: Date;
};

export type DailyWord = {
  id: string;
  scheduledDate: string;
  wordId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function searchWords(query: string, limit = 20): Promise<EnglishWord[]> {
  await connectToDatabase();
  const docs = await EnglishVocabularyModel.find({
    word: { $regex: query, $options: "i" },
  })
    .sort({ word: 1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs) as EnglishWord[];
}

export async function getWordById(id: string): Promise<EnglishWord | null> {
  await connectToDatabase();
  const doc = await EnglishVocabularyModel.findOne({ _id: id }).lean();
  return toPlain(doc) as EnglishWord | null;
}

export async function getWordsByTopic(topic: string): Promise<EnglishWord[]> {
  await connectToDatabase();
  const docs = await EnglishVocabularyModel.find({ topic })
    .sort({ word: 1 })
    .lean();
  return toPlainArray(docs) as EnglishWord[];
}

export async function getWordsForQuiz(excludeIds: string[], limit = 4): Promise<EnglishWord[]> {
  await connectToDatabase();
  const filter: any = {};
  if (excludeIds.length > 0) {
    filter._id = { $nin: excludeIds };
  }
  const docs = await EnglishVocabularyModel.aggregate([
    { $match: filter },
    { $sample: { size: limit } },
  ]);
  return toPlainArray(docs) as EnglishWord[];
}

export async function createWord(input: Partial<EnglishWord>): Promise<EnglishWord> {
  await connectToDatabase();
  const doc = await EnglishVocabularyModel.create(input);
  return toPlain(doc) as EnglishWord;
}

export async function addWordToVocabulary(userId: string, wordId: string): Promise<UserVocabulary> {
  await connectToDatabase();
  const existing = await EnglishQuizModel.findOne({ userId, wordId }).lean();
  if (existing) return toPlain(existing) as UserVocabulary;

  const doc = await EnglishQuizModel.create({ userId, wordId });
  return toPlain(doc) as UserVocabulary;
}

export async function getUserVocabulary(userId: string) {
  await connectToDatabase();
  const docs = await EnglishQuizModel.find({ userId, deletedAt: null })
    .sort({ addedAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateVocabularyEntry(id: string, userId: string, updates: Partial<UserVocabulary>) {
  await connectToDatabase();
  const doc = await EnglishQuizModel.findOneAndUpdate(
    { _id: id, userId },
    { ...updates, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getVocabularyStats(userId: string) {
  await connectToDatabase();
  const results = await EnglishQuizModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        learning: { $sum: { $cond: [{ $eq: ["$mastery", "learning"] }, 1, 0] } },
        known: { $sum: { $cond: [{ $eq: ["$mastery", "known"] }, 1, 0] } },
        mastered: { $sum: { $cond: [{ $eq: ["$mastery", "mastered"] }, 1, 0] } },
        favorites: { $sum: { $cond: [{ $eq: ["$isFavorite", true] }, 1, 0] } },
      },
    },
  ]);
  const result = results[0];
  return result
    ? {
        total: result.total,
        learning: result.learning,
        known: result.known,
        mastered: result.mastered,
        favorites: result.favorites,
      }
    : { total: 0, learning: 0, known: 0, mastered: 0, favorites: 0 };
}

export async function getDailyStreak(userId: string): Promise<number> {
  await connectToDatabase();
  const results = await EnglishQuizModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 365 },
  ]);

  if (results.length === 0) return 0;

  const days = results.map((r: any) => r._id);
  let streak = 1;
  const today = new Date().toISOString().split("T")[0];
  if (days[0] !== today && days[0] !== getYesterday()) return 0;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
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
  await connectToDatabase();
  const doc = await EnglishQuizModel.create(attempt);
  return toPlain(doc) as QuizAttempt;
}

export async function getQuizAccuracy(userId: string, days = 7) {
  await connectToDatabase();
  const since = new Date(Date.now() - days * 86400000);
  const results = await EnglishQuizModel.aggregate([
    { $match: { userId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        correct: { $sum: { $cond: ["$correct", 1, 0] } },
      },
    },
  ]);
  const result = results[0];
  const total = result?.total ?? 0;
  const correct = result?.correct ?? 0;
  return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

export async function getQuizAttemptsThisWeek(userId: string) {
  await connectToDatabase();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const docs = await EnglishQuizModel.find({ userId, createdAt: { $gte: weekStart } })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getDailyWordForDate(date: string): Promise<EnglishWord | null> {
  await connectToDatabase();
  const daily = await EnglishStudySessionModel.findOne({ scheduledDate: date, isActive: true }).lean();
  if (!daily) return null;
  return getWordById(daily.wordId);
}

export async function getUserDailyWords(userId: string) {
  await connectToDatabase();
  const docs = await EnglishStudySessionModel.find({ isActive: true }).lean();
  return toPlainArray(docs);
}

export async function getWordsNeedingReview(userId: string, limit = 20) {
  await connectToDatabase();
  const now = new Date();
  const docs = await EnglishQuizModel.find({
    userId,
    deletedAt: null,
    nextReviewAt: { $ne: null, $lte: now },
  })
    .sort({ nextReviewAt: 1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function removeFromVocabulary(id: string, userId: string) {
  await connectToDatabase();
  const doc = await EnglishQuizModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}
