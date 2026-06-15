import { db } from "@/core/database";
import { and, eq, asc, desc, gte, lte, sql, count } from "drizzle-orm";
import {
  gamificationUserMetrics,
  gamificationXpTransactions,
  gamificationAchievements,
  gamificationUserAchievements,
  gamificationBadges,
  gamificationUserBadges,
  gamificationChallenges,
  gamificationUserChallenges,
} from "./schema";

export type GamificationUserMetrics = typeof gamificationUserMetrics.$inferSelect;
export type CreateUserMetricsInput = typeof gamificationUserMetrics.$inferInsert;

export type GamificationXpTransaction = typeof gamificationXpTransactions.$inferSelect;
export type CreateXpTransactionInput = typeof gamificationXpTransactions.$inferInsert;

export type GamificationAchievement = typeof gamificationAchievements.$inferSelect;
export type GamificationBadge = typeof gamificationBadges.$inferSelect;
export type GamificationChallenge = typeof gamificationChallenges.$inferSelect;

export type GamificationUserAchievement = typeof gamificationUserAchievements.$inferSelect;
export type GamificationUserBadge = typeof gamificationUserBadges.$inferSelect;
export type GamificationUserChallenge = typeof gamificationUserChallenges.$inferSelect;

export async function getUserMetrics(userId: string) {
  return db
    .select()
    .from(gamificationUserMetrics)
    .where(eq(gamificationUserMetrics.userId, userId))
    .then((r) => r[0] ?? null);
}

export async function upsertUserMetrics(userId: string, data: Partial<CreateUserMetricsInput>) {
  const existing = await getUserMetrics(userId);
  if (existing) {
    return db
      .update(gamificationUserMetrics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gamificationUserMetrics.userId, userId))
      .returning()
      .then((r) => r[0]);
  }
  return db
    .insert(gamificationUserMetrics)
    .values({ userId, ...data } as CreateUserMetricsInput)
    .returning()
    .then((r) => r[0]);
}

export async function getXpTransactions(userId: string, limit = 50) {
  return db
    .select()
    .from(gamificationXpTransactions)
    .where(eq(gamificationXpTransactions.userId, userId))
    .orderBy(desc(gamificationXpTransactions.createdAt))
    .limit(limit);
}

export async function createXpTransaction(input: CreateXpTransactionInput) {
  return db
    .insert(gamificationXpTransactions)
    .values(input)
    .returning()
    .then((r) => r[0]);
}

export async function countXpTransactionsByEventType(userId: string, eventType: string) {
  return db
    .select({ value: count() })
    .from(gamificationXpTransactions)
    .where(
      and(
        eq(gamificationXpTransactions.userId, userId),
        eq(gamificationXpTransactions.eventType, eventType as any),
      ),
    )
    .then((r) => Number(r[0]?.value ?? 0));
}

export async function getAchievements() {
  return db
    .select()
    .from(gamificationAchievements)
    .orderBy(asc(gamificationAchievements.criteriaValue));
}

export async function createAchievement(
  input: Omit<GamificationAchievement, "id" | "createdAt">,
) {
  return db
    .insert(gamificationAchievements)
    .values(input as any)
    .returning()
    .then((r) => r[0]);
}

export async function getUserAchievements(userId: string) {
  return db
    .select()
    .from(gamificationUserAchievements)
    .where(eq(gamificationUserAchievements.userId, userId));
}

export async function awardAchievement(userId: string, achievementId: string) {
  return db
    .insert(gamificationUserAchievements)
    .values({ userId, achievementId })
    .onConflictDoNothing()
    .returning()
    .then((r) => r[0] ?? null);
}

export async function getBadges() {
  return db.select().from(gamificationBadges).orderBy(asc(gamificationBadges.criteriaValue));
}

export async function createBadge(input: Omit<GamificationBadge, "id" | "createdAt">) {
  return db
    .insert(gamificationBadges)
    .values(input as any)
    .returning()
    .then((r) => r[0]);
}

export async function getUserBadges(userId: string) {
  return db
    .select()
    .from(gamificationUserBadges)
    .where(eq(gamificationUserBadges.userId, userId));
}

export async function awardBadge(userId: string, badgeId: string) {
  return db
    .insert(gamificationUserBadges)
    .values({ userId, badgeId })
    .onConflictDoNothing()
    .returning()
    .then((r) => r[0] ?? null);
}

export async function getActiveChallenges() {
  const now = new Date();
  return db
    .select()
    .from(gamificationChallenges)
    .where(
      and(
        eq(gamificationChallenges.isActive, true),
        lte(gamificationChallenges.startsAt, now),
        gte(gamificationChallenges.endsAt, now),
      ),
    )
    .orderBy(asc(gamificationChallenges.challengeType));
}

export async function createChallenge(
  input: Omit<GamificationChallenge, "id" | "createdAt">,
) {
  return db
    .insert(gamificationChallenges)
    .values(input as any)
    .returning()
    .then((r) => r[0]);
}

export async function getUserChallenges(userId: string) {
  return db
    .select()
    .from(gamificationUserChallenges)
    .where(eq(gamificationUserChallenges.userId, userId));
}

export async function upsertUserChallenge(
  userId: string,
  challengeId: string,
  data: Partial<Omit<GamificationUserChallenge, "id" | "userId" | "challengeId">>,
) {
  const existing = await db
    .select()
    .from(gamificationUserChallenges)
    .where(
      and(
        eq(gamificationUserChallenges.userId, userId),
        eq(gamificationUserChallenges.challengeId, challengeId),
      ),
    )
    .then((r) => r[0] ?? null);

  if (existing) {
    return db
      .update(gamificationUserChallenges)
      .set(data)
      .where(eq(gamificationUserChallenges.id, existing.id))
      .returning()
      .then((r) => r[0]);
  }
  return db
    .insert(gamificationUserChallenges)
    .values({ userId, challengeId, ...data } as any)
    .returning()
    .then((r) => r[0]);
}

export async function clearUserChallenges(userId: string) {
  return db
    .delete(gamificationUserChallenges)
    .where(eq(gamificationUserChallenges.userId, userId));
}
