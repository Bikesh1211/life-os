import * as repo from "./repository";
import { SEED_ACHIEVEMENTS, SEED_BADGES, generateChallenges } from "./seed";
import { db } from "@/core/database";
import { habitCompletions } from "@/modules/habits/schema";
import { tasks } from "@/modules/tasks/schema";
import { routineExecutions } from "@/modules/routines/schema";
import { integrityCommitments } from "@/modules/integrity/schema";
import { and, eq, count, gte, lte, isNull } from "drizzle-orm";

export type LevelInfo = {
  level: number;
  currentXp: number;
  xpForNext: number;
  progress: number;
  totalXp: number;
};

export function getLevelInfo(totalXp: number): LevelInfo {
  const thresholds = [0, 100, 250, 500, 1000];

  for (let i = 0; i < thresholds.length; i++) {
    if (totalXp < thresholds[i]) {
      const prev = i > 0 ? thresholds[i - 1] : 0;
      return {
        level: i,
        currentXp: totalXp - prev,
        xpForNext: thresholds[i] - prev,
        progress: Math.round(((totalXp - prev) / (thresholds[i] - prev)) * 100),
        totalXp,
      };
    }
  }

  let cumulative = thresholds[thresholds.length - 1];
  let levelNum = thresholds.length;

  while (true) {
    const delta = 250 * (levelNum - 2);
    const nextCumulative = cumulative + delta;

    if (totalXp < nextCumulative) {
      return {
        level: levelNum + 1,
        currentXp: totalXp - cumulative,
        xpForNext: delta,
        progress: Math.round(((totalXp - cumulative) / delta) * 100),
        totalXp,
      };
    }

    cumulative = nextCumulative;
    levelNum++;
  }
}

async function seedSystemData() {
  try {
    const existingAchievements = await repo.getAchievements();
    if (existingAchievements.length === 0) {
      for (const achievement of SEED_ACHIEVEMENTS) {
        await repo.createAchievement(achievement);
      }
    }

    const existingBadges = await repo.getBadges();
    if (existingBadges.length === 0) {
      for (const badge of SEED_BADGES) {
        await repo.createBadge(badge);
      }
    }

    const existingChallenges = await repo.getActiveChallenges();
    if (existingChallenges.length === 0) {
      const challenges = generateChallenges();
      for (const challenge of challenges) {
        await repo.createChallenge(challenge);
      }
    }
  } catch (error) {
    console.warn("[gamification] Tables not yet available, skipping seed:", error instanceof Error ? error.message : error);
  }
}

type UserCounts = {
  habitCompletions: number;
  taskCompletions: number;
  routineCompletions: number;
  commitmentCompletions: number;
  integrityScore: number;
};

async function getUserCompletionCounts(userId: string): Promise<UserCounts> {
  const [habitResult] = await db
    .select({ value: count() })
    .from(habitCompletions)
    .where(eq(habitCompletions.userId, userId));

  const [taskResult] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "done" as any)));

  const [routineResult] = await db
    .select({ value: count() })
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        eq(routineExecutions.status, "completed" as any),
      ),
    );

  const [commitmentResult] = await db
    .select({ value: count() })
    .from(integrityCommitments)
    .where(
      and(
        eq(integrityCommitments.userId, userId),
        isNull(integrityCommitments.deletedAt),
        eq(integrityCommitments.status, "completed_verified" as any),
      ),
    );

  const activeCommitments = await db
    .select({ status: integrityCommitments.status, difficulty: integrityCommitments.difficulty })
    .from(integrityCommitments)
    .where(and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)));

  let integrityScore = 100;
  if (activeCommitments.length > 0) {
    let penalty = 0;
    for (const c of activeCommitments) {
      const mult = c.difficulty === "easy" ? 0.5 : c.difficulty === "hard" ? 1.5 : c.difficulty === "extreme" ? 2.0 : 1.0;
      if (c.status === "missed") penalty += 15 * mult;
      else if (c.status === "failed") penalty += 10 * mult;
      else if (c.status === "cancelled") penalty += 5 * mult;
    }
    integrityScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  }

  return {
    habitCompletions: Number(habitResult?.value ?? 0),
    taskCompletions: Number(taskResult?.value ?? 0),
    routineCompletions: Number(routineResult?.value ?? 0),
    commitmentCompletions: Number(commitmentResult?.value ?? 0),
    integrityScore,
  };
}

async function getStreakInfo(userId: string) {
  const completions = await db
    .select({ completedDate: habitCompletions.completedDate })
    .from(habitCompletions)
    .where(eq(habitCompletions.userId, userId))
    .orderBy(habitCompletions.completedDate)
    .then((rows) => rows.map((r) => r.completedDate));

  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDays = [...new Set(completions)].sort();
  let longest = 1;
  let current = 1;
  let streak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  const lastDate = new Date(uniqueDays[uniqueDays.length - 1]);
  const today = new Date();
  const daysSinceLast = Math.round(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  current = daysSinceLast <= 1 ? streak : 0;

  return { currentStreak: current, longestStreak: longest };
}

async function computeConsistencyScore(
  userId: string,
  counts: UserCounts,
): Promise<number> {
  const totalActions = counts.habitCompletions + counts.taskCompletions + counts.routineCompletions;
  if (totalActions === 0) return 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [recentHabits] = await db
    .select({ value: count() })
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.createdAt!, thirtyDaysAgo),
      ),
    );

  const [recentTasks] = await db
    .select({ value: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "done" as any),
        gte(tasks.updatedAt!, thirtyDaysAgo),
      ),
    );

  const [recentRoutines] = await db
    .select({ value: count() })
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        eq(routineExecutions.status, "completed" as any),
        gte(routineExecutions.createdAt!, thirtyDaysAgo),
      ),
    );

  const recentTotal =
    Number(recentHabits?.value ?? 0) +
    Number(recentTasks?.value ?? 0) +
    Number(recentRoutines?.value ?? 0);

  return Math.min(100, Math.round((recentTotal / Math.max(1, totalActions * 0.3)) * 100));
}

const XP_VALUES = {
  habit_completed: 10,
  task_completed: 15,
  routine_completed: 25,
  daily_login: 5,
  streak_bonus: 0,
  achievement_bonus: 0,
  badge_bonus: 0,
  challenge_completed: 0,
  mood_logged: 2,
  sleep_logged: 3,
  hydration_logged: 1,
  confidence_checkin: 2,
  wellness_streak_bonus: 10,
  workout_logged: 5,
  steps_logged: 1,
  connection_added: 5,
  meetup_logged: 3,
  event_logged: 3,
  memory_created: 5,
  commitment_completed: 25,
  commitment_streak_bonus: 10,
  integrity_milestone: 50,
} as const;

export function getXpValue(eventType: keyof typeof XP_VALUES): number {
  return XP_VALUES[eventType];
}

export async function syncUser(userId: string) {
  await seedSystemData();

  const counts = await getUserCompletionCounts(userId);
  const streakInfo = await getStreakInfo(userId);
  const consistencyScore = await computeConsistencyScore(userId, counts);

  const existingTransactionCounts = {
    habit: await repo.countXpTransactionsByEventType(userId, "habit_completed"),
    task: await repo.countXpTransactionsByEventType(userId, "task_completed"),
    routine: await repo.countXpTransactionsByEventType(userId, "routine_completed"),
  };

  const newHabitXp = (counts.habitCompletions - existingTransactionCounts.habit) * XP_VALUES.habit_completed;
  const newTaskXp = (counts.taskCompletions - existingTransactionCounts.task) * XP_VALUES.task_completed;
  const newRoutineXp = (counts.routineCompletions - existingTransactionCounts.routine) * XP_VALUES.routine_completed;

  const existingMetrics = await repo.getUserMetrics(userId);
  let totalXp = existingMetrics?.totalXp ?? 0;

  if (newHabitXp > 0) {
    await repo.createXpTransaction({
      userId,
      eventType: "habit_completed",
      eventSource: "sync",
      xpAmount: newHabitXp,
      description: `XP for ${counts.habitCompletions} habit completions`,
    });
    totalXp += newHabitXp;
  }

  if (newTaskXp > 0) {
    await repo.createXpTransaction({
      userId,
      eventType: "task_completed",
      eventSource: "sync",
      xpAmount: newTaskXp,
      description: `XP for ${counts.taskCompletions} task completions`,
    });
    totalXp += newTaskXp;
  }

  if (newRoutineXp > 0) {
    await repo.createXpTransaction({
      userId,
      eventType: "routine_completed",
      eventSource: "sync",
      xpAmount: newRoutineXp,
      description: `XP for ${counts.routineCompletions} routine completions`,
    });
    totalXp += newRoutineXp;
  }

  const levelInfo = getLevelInfo(totalXp);

  await repo.upsertUserMetrics(userId, {
    totalXp,
    currentLevel: levelInfo.level,
    currentStreak: streakInfo.currentStreak,
    longestStreak: streakInfo.longestStreak,
    consistencyScore,
    lastSyncedAt: new Date(),
  });

  const allAchievements = await repo.getAchievements();
  const userAchievements = await repo.getUserAchievements(userId);
  const userAchievementIds = new Set(userAchievements.map((a) => a.achievementId));

  const unlockedAchievements: typeof allAchievements = [];

  for (const achievement of allAchievements) {
    if (userAchievementIds.has(achievement.id)) continue;

    let met = false;
    switch (achievement.criteriaType) {
      case "habit_count":
        met = counts.habitCompletions >= achievement.criteriaValue;
        break;
      case "task_count":
        met = counts.taskCompletions >= achievement.criteriaValue;
        break;
      case "routine_count":
        met = counts.routineCompletions >= achievement.criteriaValue;
        break;
      case "level_reached":
        met = levelInfo.level >= achievement.criteriaValue;
        break;
      case "streak_days":
        met = streakInfo.longestStreak >= achievement.criteriaValue;
        break;
      case "challenge_completed": {
        const completedChallenges = await repo
          .getUserChallenges(userId)
          .then((c) => c.filter((ch) => ch.isCompleted));
        met = completedChallenges.length >= achievement.criteriaValue;
        break;
      }
      case "commitment_count":
        met = counts.commitmentCompletions >= achievement.criteriaValue;
        break;
      case "integrity_score":
        met = counts.integrityScore >= achievement.criteriaValue;
        break;
    }

    if (met) {
      await repo.awardAchievement(userId, achievement.id);
      if (achievement.xpReward > 0) {
        await repo.createXpTransaction({
          userId,
          eventType: "achievement_bonus",
          eventSource: achievement.id,
          xpAmount: achievement.xpReward,
          description: `Achievement unlocked: ${achievement.name}`,
        });
        totalXp += achievement.xpReward;
      }
      unlockedAchievements.push(achievement);
    }
  }

  const allBadges = await repo.getBadges();
  const userBadges = await repo.getUserBadges(userId);
  const userBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  const unlockedBadges: typeof allBadges = [];

  for (const badge of allBadges) {
    if (userBadgeIds.has(badge.id)) continue;

    let met = false;
    switch (badge.criteriaType) {
      case "habit_count":
        met = counts.habitCompletions >= badge.criteriaValue;
        break;
      case "task_count":
        met = counts.taskCompletions >= badge.criteriaValue;
        break;
      case "routine_count":
        met = counts.routineCompletions >= badge.criteriaValue;
        break;
      case "streak_days":
        met = streakInfo.longestStreak >= badge.criteriaValue;
        break;
      case "commitment_count":
        met = counts.commitmentCompletions >= badge.criteriaValue;
        break;
      case "integrity_score":
        met = counts.integrityScore >= badge.criteriaValue;
        break;
      default:
        break;
    }

    if (met) {
      await repo.awardBadge(userId, badge.id);
      if (badge.xpReward > 0) {
        await repo.createXpTransaction({
          userId,
          eventType: "badge_bonus",
          eventSource: badge.id,
          xpAmount: badge.xpReward,
          description: `Badge earned: ${badge.name}`,
        });
        totalXp += badge.xpReward;
      }
      unlockedBadges.push(badge);
    }
  }

  if (unlockedAchievements.length > 0 || unlockedBadges.length > 0) {
    const finalLevelInfo = getLevelInfo(totalXp);
    await repo.upsertUserMetrics(userId, {
      totalXp,
      currentLevel: finalLevelInfo.level,
    });
  }

  const activeChallenges = await repo.getActiveChallenges();
  const userChallenges = await repo.getUserChallenges(userId);
  const userChallengeMap = new Map(userChallenges.map((c) => [c.challengeId, c]));

  const updatedChallenges: Array<{
    challenge: (typeof activeChallenges)[0];
    progress: number;
    completed: boolean;
  }> = [];

  for (const challenge of activeChallenges) {
    let progress = 0;
    switch (challenge.criteriaType) {
      case "habit_count":
        progress = Math.min(challenge.criteriaValue, counts.habitCompletions);
        break;
      case "task_count":
        progress = Math.min(challenge.criteriaValue, counts.taskCompletions);
        break;
      case "routine_count":
        progress = Math.min(challenge.criteriaValue, counts.routineCompletions);
        break;
      default:
        break;
    }

    const isCompleted = progress >= challenge.criteriaValue;
    const existing = userChallengeMap.get(challenge.id);
    const wasJustCompleted = isCompleted && (!existing || !existing.isCompleted);

    await repo.upsertUserChallenge(userId, challenge.id, {
      progress,
      isCompleted,
      completedAt: wasJustCompleted ? new Date() : existing?.completedAt ?? null,
    });

    if (wasJustCompleted && challenge.xpReward > 0) {
      await repo.createXpTransaction({
        userId,
        eventType: "challenge_completed",
        eventSource: challenge.id,
        xpAmount: challenge.xpReward,
        description: `Challenge completed: ${challenge.name}`,
      });
      totalXp += challenge.xpReward;
    }

    updatedChallenges.push({ challenge, progress, completed: isCompleted });
  }

  if (updatedChallenges.some((c) => c.completed)) {
    const finalLevelInfo = getLevelInfo(totalXp);
    await repo.upsertUserMetrics(userId, {
      totalXp,
      currentLevel: finalLevelInfo.level,
    });
  }

  const finalMetrics = await repo.getUserMetrics(userId);
  const finalLevelInfo = getLevelInfo(finalMetrics?.totalXp ?? totalXp);

  return {
    metrics: finalMetrics,
    levelInfo: finalLevelInfo,
    completions: counts,
    streakInfo,
    unlockedAchievements,
    unlockedBadges,
    updatedChallenges,
  };
}

export async function getProfile(userId: string) {
  await seedSystemData();

  const metrics = await repo.getUserMetrics(userId);
  const levelInfo = getLevelInfo(metrics?.totalXp ?? 0);

  const allAchievements = await repo.getAchievements();
  const userAchievements = await repo.getUserAchievements(userId);
  const userAchievementIds = new Set(userAchievements.map((a) => a.achievementId));

  const allBadges = await repo.getBadges();
  const userBadges = await repo.getUserBadges(userId);
  const userBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  const activeChallenges = await repo.getActiveChallenges();
  const userChallenges = await repo.getUserChallenges(userId);
  const userChallengeMap = new Map(userChallenges.map((c) => [c.challengeId, c]));

  return {
    metrics,
    levelInfo,
    achievements: {
      all: allAchievements,
      unlocked: userAchievements,
      locked: allAchievements.filter((a) => !userAchievementIds.has(a.id)),
    },
    badges: {
      all: allBadges,
      unlocked: userBadges,
      locked: allBadges.filter((b) => !userBadgeIds.has(b.id)),
    },
    challenges: activeChallenges.map((challenge) => {
      const userChallenge = userChallengeMap.get(challenge.id);
      return {
        ...challenge,
        progress: userChallenge?.progress ?? 0,
        isCompleted: userChallenge?.isCompleted ?? false,
        completedAt: userChallenge?.completedAt ?? null,
      };
    }),
  };
}

export async function getAchievements(userId: string) {
  const [all, unlocked] = await Promise.all([
    repo.getAchievements(),
    repo.getUserAchievements(userId),
  ]);

  const unlockedMap = new Map(unlocked.map((a) => [a.achievementId, a]));

  return all.map((achievement) => ({
    ...achievement,
    unlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id)?.unlockedAt ?? null,
  }));
}

export async function getBadges(userId: string) {
  const [all, unlocked] = await Promise.all([
    repo.getBadges(),
    repo.getUserBadges(userId),
  ]);

  const unlockedMap = new Map(unlocked.map((b) => [b.badgeId, b]));

  return all.map((badge) => ({
    ...badge,
    unlocked: unlockedMap.has(badge.id),
    unlockedAt: unlockedMap.get(badge.id)?.unlockedAt ?? null,
  }));
}

export async function getChallenges(userId: string) {
  const [active, userChallenges] = await Promise.all([
    repo.getActiveChallenges(),
    repo.getUserChallenges(userId),
  ]);

  const userMap = new Map(userChallenges.map((c) => [c.challengeId, c]));

  return active.map((challenge) => ({
    ...challenge,
    progress: userMap.get(challenge.id)?.progress ?? 0,
    isCompleted: userMap.get(challenge.id)?.isCompleted ?? false,
    completedAt: userMap.get(challenge.id)?.completedAt ?? null,
  }));
}

export async function getXpHistory(userId: string, limit = 100) {
  return repo.getXpTransactions(userId, limit);
}

export async function awardXp(
  userId: string,
  eventType: keyof typeof XP_VALUES,
  eventSource: string,
  description: string,
  customAmount?: number,
) {
  const amount = customAmount ?? XP_VALUES[eventType];
  if (amount <= 0) return null;

  await repo.createXpTransaction({
    userId,
    eventType,
    eventSource,
    xpAmount: amount,
    description,
  });

  const metrics = await repo.getUserMetrics(userId);
  const newTotalXp = (metrics?.totalXp ?? 0) + amount;
  const levelInfo = getLevelInfo(newTotalXp);

  await repo.upsertUserMetrics(userId, {
    totalXp: newTotalXp,
    currentLevel: levelInfo.level,
  });

  return { xpAmount: amount, totalXp: newTotalXp, levelInfo };
}
