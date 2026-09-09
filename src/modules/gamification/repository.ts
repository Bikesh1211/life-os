import { connectToDatabase } from "@/lib/mongodb";
import {
  GamificationUserMetric,
  GamificationXpTransaction,
  GamificationAchievement,
  GamificationUserAchievement,
  GamificationBadge,
  GamificationUserBadge,
  GamificationChallenge,
  GamificationUserChallenge,
} from "@/lib/models/gamification";

// ── Helpers ──

function toDoc(doc: any) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function toDocs(docs: any[]) {
  return docs.map(toDoc);
}

// ── Types ──

export type GamificationUserMetrics = {
  id: string;
  userId: string;
  totalXp: number;
  level: number;
  consistencyScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserMetricsInput = {
  userId: string;
  totalXp?: number;
  level?: number;
  consistencyScore?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: Date;
};

export type GamificationXpTransaction = {
  id: string;
  userId: string;
  amount: number;
  eventType: string;
  entityId?: string;
  entityTypeName?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateXpTransactionInput = {
  userId: string;
  amount: number;
  eventType: string;
  entityId?: string;
  entityTypeName?: string;
  description?: string;
};

export type GamificationAchievement = {
  id: string;
  name: string;
  title: string;
  description?: string;
  icon?: string;
  criteriaType: string;
  criteriaValue: number;
  xpReward: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GamificationBadge = {
  id: string;
  name: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GamificationChallenge = {
  id: string;
  title: string;
  description?: string;
  type: string;
  xpReward: number;
  targetValue: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GamificationUserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type GamificationUserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type GamificationUserChallenge = {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ── User Metrics ──

export async function getUserMetrics(userId: string) {
  await connectToDatabase();
  const doc = await GamificationUserMetric.findOne({ userId }).lean();
  return toDoc(doc);
}

export async function upsertUserMetrics(userId: string, data: Partial<CreateUserMetricsInput>) {
  await connectToDatabase();
  const existing = await GamificationUserMetric.findOne({ userId }).lean();
  if (existing) {
    const doc = await GamificationUserMetric.findOneAndUpdate(
      { userId },
      { ...data, updatedAt: new Date() },
      { new: true },
    ).lean();
    return toDoc(doc);
  }
  const doc = await GamificationUserMetric.create({ userId, ...data });
  return toDoc(doc);
}

// ── XP Transactions ──

export async function getXpTransactions(userId: string, limit = 50) {
  await connectToDatabase();
  const docs = await GamificationXpTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return toDocs(docs);
}

export async function createXpTransaction(input: CreateXpTransactionInput) {
  await connectToDatabase();
  const doc = await GamificationXpTransaction.create(input);
  return toDoc(doc);
}

export async function countXpTransactionsByEventType(userId: string, eventType: string) {
  await connectToDatabase();
  return GamificationXpTransaction.countDocuments({ userId, eventType });
}

// ── Achievements ──

export async function getAchievements() {
  await connectToDatabase();
  const docs = await GamificationAchievement.find()
    .sort({ criteriaValue: 1 })
    .lean();
  return toDocs(docs);
}

export async function createAchievement(
  input: Omit<GamificationAchievement, "id" | "createdAt">,
) {
  await connectToDatabase();
  const doc = await GamificationAchievement.create(input);
  return toDoc(doc);
}

export async function getUserAchievements(userId: string) {
  await connectToDatabase();
  const docs = await GamificationUserAchievement.find({ userId }).lean();
  return toDocs(docs);
}

export async function awardAchievement(userId: string, achievementId: string) {
  await connectToDatabase();
  const existing = await GamificationUserAchievement.findOne({
    userId,
    achievementId,
  }).lean();
  if (existing) return null;

  const doc = await GamificationUserAchievement.create({ userId, achievementId });
  return toDoc(doc);
}

// ── Badges ──

export async function getBadges() {
  await connectToDatabase();
  const docs = await GamificationBadge.find()
    .sort({ criteriaValue: 1 })
    .lean();
  return toDocs(docs);
}

export async function createBadge(input: Omit<GamificationBadge, "id" | "createdAt">) {
  await connectToDatabase();
  const doc = await GamificationBadge.create(input);
  return toDoc(doc);
}

export async function getUserBadges(userId: string) {
  await connectToDatabase();
  const docs = await GamificationUserBadge.find({ userId }).lean();
  return toDocs(docs);
}

export async function awardBadge(userId: string, badgeId: string) {
  await connectToDatabase();
  const existing = await GamificationUserBadge.findOne({
    userId,
    badgeId,
  }).lean();
  if (existing) return null;

  const doc = await GamificationUserBadge.create({ userId, badgeId });
  return toDoc(doc);
}

// ── Challenges ──

export async function getActiveChallenges() {
  await connectToDatabase();
  const now = new Date();
  const docs = await GamificationChallenge.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ type: 1 })
    .lean();
  return toDocs(docs);
}

export async function createChallenge(
  input: Omit<GamificationChallenge, "id" | "createdAt">,
) {
  await connectToDatabase();
  const doc = await GamificationChallenge.create(input);
  return toDoc(doc);
}

export async function getUserChallenges(userId: string) {
  await connectToDatabase();
  const docs = await GamificationUserChallenge.find({ userId }).lean();
  return toDocs(docs);
}

export async function upsertUserChallenge(
  userId: string,
  challengeId: string,
  data: Partial<Omit<GamificationUserChallenge, "id" | "userId" | "challengeId">>,
) {
  await connectToDatabase();
  const existing = await GamificationUserChallenge.findOne({
    userId,
    challengeId,
  }).lean();

  if (existing) {
    const doc = await GamificationUserChallenge.findOneAndUpdate(
      { userId, challengeId },
      data,
      { new: true },
    ).lean();
    return toDoc(doc);
  }

  const doc = await GamificationUserChallenge.create({ userId, challengeId, ...data });
  return toDoc(doc);
}

export async function clearUserChallenges(userId: string) {
  await connectToDatabase();
  await GamificationUserChallenge.deleteMany({ userId });
}
