import { z } from "zod";
import dayjs from "dayjs";
import * as repo from "./repository";
import { getTasks } from "@/modules/tasks";
import { getGoals } from "@/modules/goals";
import { EXCUSE_TAGS, DISCIPLINE_LEVELS, SCORE_WEIGHTS } from "./constants";

export const commitmentCategories = [
  "personal",
  "career",
  "health",
  "finance",
  "relationships",
  "education",
  "creative",
  "other",
] as const;

export const createCommitmentSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  category: z.enum(commitmentCategories).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  difficulty: z.enum(["easy", "medium", "hard", "extreme"]).default("medium"),
  estimatedTime: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  dueTime: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  evidenceRequired: z.boolean().default(false),
  location: z.string().optional(),
  repeatRule: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  reminderMinutesBefore: z.number().int().optional(),
  linkedEntityType: z.string().optional().nullable(),
  linkedEntityId: z.string().optional().nullable(),
});

export const updateCommitmentSchema = createCommitmentSchema.partial().extend({
  status: z.enum([
    "pending",
    "in_progress",
    "completed_unverified",
    "completed_verified",
    "failed",
    "missed",
    "cancelled",
  ]).optional(),
  cancellationReason: z.string().optional(),
});

export const createCheckinSchema = z.object({
  date: z.string(),
  accomplishments: z.string().optional(),
  excuses: z.string().optional(),
  distractions: z.string().optional(),
  proudOf: z.string().optional(),
  improvement: z.string().optional(),
  excuseTags: z.array(z.enum(EXCUSE_TAGS)).optional(),
});

export const disciplineDashboardSchema = z.object({
  period: z.enum(["today", "week", "month", "year"]).default("today"),
});

export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;

const DIFFICULTY_XP: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  extreme: 100,
};

function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty) {
    case "easy": return 0.5;
    case "medium": return 1.0;
    case "hard": return 1.5;
    case "extreme": return 2.0;
    default: return 1.0;
  }
}

export async function getCommitments(
  userId: string,
  status?: string,
  category?: string,
  difficulty?: string,
  priority?: string,
) {
  return repo.getCommitments(userId, status, category, difficulty, priority);
}

export async function getCommitmentById(userId: string, commitmentId: string) {
  return repo.getCommitmentById(userId, commitmentId);
}

export async function createCommitment(userId: string, input: CreateCommitmentInput) {
  const data = createCommitmentSchema.parse(input);
  const commitment = await repo.createCommitment({
    ...data,
    userId,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    startDate: data.startDate ? new Date(data.startDate) : null,
  });

  await repo.createEvent({
    commitmentId: commitment.id,
    eventType: "created",
    metadata: JSON.stringify({ title: data.title }),
  });

  return commitment;
}

export async function updateCommitment(
  userId: string,
  commitmentId: string,
  input: UpdateCommitmentInput,
) {
  const existing = await repo.getCommitmentById(userId, commitmentId);
  if (!existing) return null;

  const data = updateCommitmentSchema.parse(input);
  const updateData: Record<string, any> = { ...data };

  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }

  const statusChanged = data.status && data.status !== existing.status;
  if (data.status === "cancelled" && !data.cancellationReason) {
    throw new Error("Cancellation reason is required when cancelling a commitment");
  }

  const commitment = await repo.updateCommitment(userId, commitmentId, updateData);

  if (statusChanged && commitment) {
    await repo.createEvent({
      commitmentId: commitment.id,
      eventType: data.status === "completed_unverified" || data.status === "completed_verified"
        ? "completed"
        : data.status === "failed"
          ? "failed"
          : data.status === "missed"
            ? "missed"
            : data.status === "cancelled"
              ? "cancelled"
              : data.status === "in_progress"
                ? "started"
                : "progress_updated",
      metadata: JSON.stringify({ from: existing.status, to: data.status }),
    });

    if (
      data.status === "completed_unverified" ||
      data.status === "completed_verified" ||
      data.status === "failed"
    ) {
      await awardIntegrityXp(userId, commitment, data.status);
    }
  }

  return commitment;
}

export async function deleteCommitment(userId: string, commitmentId: string) {
  const existing = await repo.getCommitmentById(userId, commitmentId);
  if (!existing) return null;

  const commitment = await repo.deleteCommitment(userId, commitmentId);
  if (commitment) {
    await repo.createEvent({
      commitmentId: commitment.id,
      eventType: "cancelled",
      metadata: JSON.stringify({ reason: "Deleted by user" }),
    });
  }
  return commitment;
}

export async function getOverview(userId: string) {
  const counts = await repo.getCommitmentCounts(userId);
  const all = await repo.getAllCommitmentsForUser(userId);

  const now = dayjs();
  const todayStr = now.format("YYYY-MM-DD");

  const todayCommitments = all.filter((c) =>
    dayjs(c.createdAt).format("YYYY-MM-DD") === todayStr,
  );

  const upcomingDeadlines = all.filter((c) => {
    if (!c.dueDate || c.status === "completed_verified" || c.status === "completed_unverified" || c.status === "cancelled") return false;
    return dayjs(c.dueDate).isAfter(now);
  }).sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return dayjs(a.dueDate).diff(dayjs(b.dueDate));
  }).slice(0, 10);

  const completedCount = (counts.completed_unverified ?? 0) + (counts.completed_verified ?? 0);
  const failedCount = (counts.failed ?? 0) + (counts.missed ?? 0);
  const totalResolved = completedCount + failedCount + (counts.cancelled ?? 0);
  const promiseRatio = totalResolved > 0
    ? Math.round((completedCount / totalResolved) * 100)
    : 0;

  return {
    counts,
    total: counts.all ?? 0,
    active: (counts.pending ?? 0) + (counts.in_progress ?? 0),
    completed: completedCount,
    failed: failedCount,
    cancelled: counts.cancelled ?? 0,
    promiseRatio,
    todayCommitments: todayCommitments.length,
    upcomingDeadlines,
  };
}

export async function getDashboard(userId: string) {
  const overview = await getOverview(userId);
  const all = await repo.getAllCommitmentsForUser(userId);

  const currentStreak = calculateCurrentStreak(all);
  const longestStreak = calculateLongestStreak(all);
  const score = calculateIntegrityScore(all);

  const recentEvents = await repo.getRecentEvents(userId, 20);

  return {
    ...overview,
    integrityScore: score,
    currentStreak,
    longestStreak,
    recentEvents,
  };
}

export function calculateCurrentStreak(commitments: repo.Commitment[]): number {
  const completed = commitments
    .filter((c) => c.status === "completed_unverified" || c.status === "completed_verified")
    .map((c) => dayjs(c.updatedAt).format("YYYY-MM-DD"))
    .sort()
    .reverse();

  if (completed.length === 0) return 0;

  const uniqueDays = [...new Set(completed)].sort().reverse();
  let streak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = dayjs(uniqueDays[i - 1]).diff(dayjs(uniqueDays[i]), "day");
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  const mostRecentDate = uniqueDays[0];
  const daysSinceLastCompletion = dayjs().diff(dayjs(mostRecentDate), "day");

  if (daysSinceLastCompletion > 1) {
    return 0;
  }

  return streak;
}

export function calculateLongestStreak(commitments: repo.Commitment[]): number {
  const completed = commitments
    .filter((c) => c.status === "completed_unverified" || c.status === "completed_verified")
    .map((c) => dayjs(c.updatedAt).format("YYYY-MM-DD"))
    .sort();

  if (completed.length === 0) return 0;

  const uniqueDays = [...new Set(completed)].sort();
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = dayjs(uniqueDays[i]).diff(dayjs(uniqueDays[i - 1]), "day");
    if (diff === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  return longest;
}

export function calculateIntegrityScore(commitments: repo.Commitment[]): number {
  if (commitments.length === 0) return 100;

  let baseScore = 100;
  let totalPenalty = 0;
  let totalBonus = 0;

  for (const c of commitments) {
    const multiplier = getDifficultyMultiplier(c.difficulty);

    switch (c.status) {
      case "missed":
        totalPenalty += 15 * multiplier;
        break;
      case "failed":
        totalPenalty += 10 * multiplier;
        break;
      case "cancelled":
        totalPenalty += c.cancellationReason ? 5 * multiplier : 10 * multiplier;
        break;
      case "completed_unverified":
      case "completed_verified": {
        const wasEarly = c.dueDate
          ? dayjs(c.updatedAt).isBefore(dayjs(c.dueDate))
          : false;
        if (wasEarly) totalBonus += 1;
        const wasLate = c.dueDate
          ? dayjs(c.updatedAt).isAfter(dayjs(c.dueDate))
          : false;
        if (wasLate) totalPenalty += 3 * multiplier;
        break;
      }
    }
  }

  const currentStreak = calculateCurrentStreak(commitments);
  const streakBonus = Math.min(currentStreak * 0.5, 15);
  totalBonus += streakBonus;

  const last7Days = commitments.filter((c) =>
    dayjs(c.createdAt).isAfter(dayjs().subtract(7, "day")),
  );
  const recentCompleted = last7Days.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  );
  const recentRate = last7Days.length > 0
    ? recentCompleted.length / last7Days.length
    : 1;
  if (recentRate > 0.9) totalBonus += 5;
  else if (recentRate < 0.5) totalBonus -= 5;

  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - totalPenalty + totalBonus)));
  return finalScore;
}

async function awardIntegrityXp(
  userId: string,
  commitment: repo.Commitment,
  newStatus: string,
) {
  try {
    const { awardXp } = await import("@/modules/gamification");
    if (newStatus === "completed_unverified" || newStatus === "completed_verified") {
      const xpAmount = DIFFICULTY_XP[commitment.difficulty] ?? 25;
      // Early completion bonus
      const wasEarly = commitment.dueDate
        ? dayjs().isBefore(dayjs(commitment.dueDate))
        : false;
      const finalXp = wasEarly ? xpAmount + 10 : xpAmount;
      await awardXp(userId, "commitment_completed", commitment.id, `Completed commitment: ${commitment.title}`, finalXp);
    }
  } catch {
    // Gamification module not available
  }
}

export async function addEvidence(
  userId: string,
  commitmentId: string,
  evidence: { text?: string; urls?: string[] },
) {
  const commitment = await repo.getCommitmentById(userId, commitmentId);
  if (!commitment) return null;

  await repo.createEvent({
    commitmentId,
    eventType: "evidence_uploaded",
    metadata: JSON.stringify(evidence),
  });

  if (commitment.status === "completed_unverified") {
    await repo.updateCommitment(userId, commitmentId, {
      status: "completed_verified" as any,
    });
  }

  return commitment;
}

export async function getCheckin(userId: string, date: string) {
  return repo.getCheckin(userId, date);
}

export async function upsertCheckin(
  userId: string,
  input: {
    date: string;
    accomplishments?: string;
    excuses?: string;
    distractions?: string;
    proudOf?: string;
    improvement?: string;
    excuseTags?: readonly string[];
  },
) {
  const existing = await repo.getCheckin(userId, input.date);
  const data = {
    userId,
    date: input.date,
    accomplishments: input.accomplishments ?? null,
    excuses: input.excuses ?? null,
    distractions: input.distractions ?? null,
    proudOf: input.proudOf ?? null,
    improvement: input.improvement ?? null,
    excuseTags: input.excuseTags ? [...input.excuseTags] : null,
    id: existing?.id,
  };
  return repo.upsertCheckin(data);
}

export async function getAnalytics(userId: string) {
  const all = await repo.getAllCommitmentsForUser(userId);
  const score = calculateIntegrityScore(all);
  const currentStreak = calculateCurrentStreak(all);
  const longestStreak = calculateLongestStreak(all);

  const completed = all.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  );
  const failed = all.filter((c) => c.status === "failed" || c.status === "missed");
  const cancelled = all.filter((c) => c.status === "cancelled");

  const completedBeforeDeadline = completed.filter((c) => {
    if (!c.dueDate) return false;
    return dayjs(c.updatedAt).isBefore(dayjs(c.dueDate));
  });

  const avgCompletionTime = completed
    .filter((c) => c.startDate)
    .reduce((sum, c) => {
      return sum + dayjs(c.updatedAt).diff(dayjs(c.startDate), "hour");
    }, 0) / (completed.filter((c) => c.startDate).length || 1);

  const categoryDist = await repo.getCategoryDistribution(userId);
  const difficultyDist = await repo.getDifficultyDistribution(userId);
  const dayOfWeekDist = await repo.getDayOfWeekDistribution(userId);

  const totalResolved = completed.length + failed.length + cancelled.length;
  const promiseRatio = totalResolved > 0
    ? Math.round((completed.length / totalResolved) * 100)
    : 0;
  const failureRate = totalResolved > 0
    ? Math.round(((failed.length) / totalResolved) * 100)
    : 0;

  return {
    totalCreated: all.length,
    totalCompleted: completed.length,
    totalFailed: failed.length,
    totalCancelled: cancelled.length,
    integrityScore: score,
    currentStreak,
    longestStreak,
    promiseRatio,
    failureRate,
    completedBeforeDeadline: completedBeforeDeadline.length,
    avgCompletionTimeHours: Math.round(avgCompletionTime),
    categoryDistribution: categoryDist.reduce((acc, c) => {
      acc[c.category ?? "uncategorized"] = Number(c.count);
      return acc;
    }, {} as Record<string, number>),
    difficultyDistribution: difficultyDist,
    dayOfWeekDistribution: dayOfWeekDist,
  };
}

export async function getTimeline(userId: string, limit = 50) {
  const events = await repo.getRecentEvents(userId, limit);
  const commitmentIds = [...new Set(events.map((e) => e.commitmentId))];

  const commitments = await repo.getCommitmentsByIds(userId, commitmentIds);

  const commitmentMap = new Map(commitments.map((c) => [c.id, c]));

  return events.map((event) => ({
    ...event,
    commitment: commitmentMap.get(event.commitmentId) ?? null,
    metadata: event.metadata ? JSON.parse(event.metadata) : null,
  }));
}

export async function getInsights(userId: string, analytics?: Awaited<ReturnType<typeof getAnalytics>>) {
  const resolvedAnalytics = analytics ?? (await getAnalytics(userId));
  const dayOfWeekDist = await repo.getDayOfWeekDistribution(userId);
  const categoryDist = await repo.getCategoryDistribution(userId);

  const insights: Array<{ type: "positive" | "negative" | "info"; message: string }> = [];

  if (resolvedAnalytics.integrityScore >= 90) {
    insights.push({ type: "positive", message: `Your integrity score is ${resolvedAnalytics.integrityScore}/100 — excellent reliability!` });
  } else if (resolvedAnalytics.integrityScore >= 70) {
    insights.push({ type: "positive", message: `Your integrity score is ${resolvedAnalytics.integrityScore}/100. You're building strong commitment habits.` });
  } else if (resolvedAnalytics.integrityScore >= 50) {
    insights.push({ type: "info", message: `Your integrity score is ${resolvedAnalytics.integrityScore}/100. There's room to improve your follow-through.` });
  } else {
    insights.push({ type: "negative", message: `Your integrity score is ${resolvedAnalytics.integrityScore}/100. Start with easier commitments to build momentum.` });
  }

  if (resolvedAnalytics.currentStreak >= 30) {
    insights.push({ type: "positive", message: `You're on an incredible ${resolvedAnalytics.currentStreak}-day integrity streak!` });
  } else if (resolvedAnalytics.currentStreak >= 7) {
    insights.push({ type: "positive", message: `You're on a ${resolvedAnalytics.currentStreak}-day streak! Keep the momentum going.` });
  } else if (resolvedAnalytics.currentStreak >= 3) {
    insights.push({ type: "info", message: `Current streak: ${resolvedAnalytics.currentStreak} days. Can you make it a week?` });
  }

  if (resolvedAnalytics.promiseRatio >= 90) {
    insights.push({ type: "positive", message: `You keep ${resolvedAnalytics.promiseRatio}% of your commitments — you're a person of your word.` });
  } else if (resolvedAnalytics.promiseRatio >= 70) {
    insights.push({ type: "info", message: `Promise success rate: ${resolvedAnalytics.promiseRatio}%. Aim for 90%+.` });
  } else {
    insights.push({ type: "negative", message: `Promise success rate: ${resolvedAnalytics.promiseRatio}%. Try making fewer, more realistic commitments.` });
  }

  const dayEntries = Object.entries(dayOfWeekDist).filter(([_, d]) => d.total > 0);
  if (dayEntries.length > 0) {
    const sortedByRate = dayEntries
      .map(([day, d]) => ({ day, rate: d.total > 0 ? d.completed / d.total : 0 }))
      .sort((a, b) => b.rate - a.rate);

    const bestDay = sortedByRate[0];
    const worstDay = sortedByRate[sortedByRate.length - 1];

    if (bestDay && bestDay.rate > 0) {
      insights.push({ type: "info", message: `Your best day for keeping commitments is ${bestDay.day} (${Math.round(bestDay.rate * 100)}% success rate).` });
    }
    if (worstDay && worstDay.rate < bestDay.rate) {
      insights.push({ type: "info", message: `${worstDay.day} has your lowest commitment success rate (${Math.round(worstDay.rate * 100)}%). Consider lighter commitments on this day.` });
    }
  }

  if (categoryDist.length > 0) {
    const bestCategory = categoryDist[0];
    const worstCategory = categoryDist[categoryDist.length - 1];

    if (bestCategory) {
      insights.push({ type: "info", message: `Your strongest category is "${bestCategory.category ?? "Other"}" with ${bestCategory.count} commitments.` });
    }
    if (worstCategory && worstCategory.category !== bestCategory?.category) {
      insights.push({ type: "info", message: `Your weakest category is "${worstCategory.category ?? "Other"}". Consider focusing more here.` });
    }
  }

  if (resolvedAnalytics.avgCompletionTimeHours > 0) {
    insights.push({ type: "info", message: `Average completion time: ${resolvedAnalytics.avgCompletionTimeHours} hours. Use this to estimate future commitments better.` });
  }

  return insights;
}

export async function convertToCommitment(
  userId: string,
  entityType: string,
  entityId: string,
  title: string,
  difficulty?: string,
) {
  const existingLinks = await repo.getLinkedCommitments(userId, entityType, entityId);
  if (existingLinks.length > 0) {
    return existingLinks[0];
  }

  const commitment = await repo.createCommitment({
    userId,
    title,
    linkedEntityType: entityType,
    linkedEntityId: entityId,
    difficulty: (difficulty as any) ?? "medium",
    status: "pending",
  });

  await repo.createEvent({
    commitmentId: commitment.id,
    eventType: "created",
    metadata: JSON.stringify({ title, linkedEntityType: entityType, linkedEntityId: entityId }),
  });

  return commitment;
}

export async function syncLinkedEntityStatus(
  userId: string,
  entityType: string,
  entityId: string,
  newStatus: string,
) {
  const linked = await repo.getLinkedCommitments(userId, entityType, entityId);
  for (const commitment of linked) {
    if (commitment.status === "pending" || commitment.status === "in_progress") {
      if (newStatus === "completed" || newStatus === "done") {
        await repo.updateCommitment(userId, commitment.id, {
          status: "completed_unverified" as any,
        });
        await repo.createEvent({
          commitmentId: commitment.id,
          eventType: "completed",
          metadata: JSON.stringify({ source: entityType, sourceId: entityId, autoTransitioned: true }),
        });
        await awardIntegrityXp(userId, commitment, "completed_unverified");
      } else if (newStatus === "cancelled" || newStatus === "deleted") {
        await repo.updateCommitment(userId, commitment.id, {
          status: "cancelled" as any,
          cancellationReason: `Linked ${entityType} was ${newStatus}`,
        });
        await repo.createEvent({
          commitmentId: commitment.id,
          eventType: "cancelled",
          metadata: JSON.stringify({ source: entityType, sourceId: entityId, reason: `Linked ${entityType} was ${newStatus}` }),
        });
      }
    }
  }
}

export async function getStreaks(userId: string) {
  const all = await repo.getAllCommitmentsForUser(userId);
  return {
    current: calculateCurrentStreak(all),
    longest: calculateLongestStreak(all),
  };
}

export function calculateAllOrNothingStreak(commitments: repo.Commitment[]): number {
  const byDate = new Map<string, repo.Commitment[]>();

  for (const c of commitments) {
    const dateKey = dayjs(c.createdAt).format("YYYY-MM-DD");
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(c);
  }

  const sortedDates = [...byDate.keys()].sort().reverse();
  if (sortedDates.length === 0) return 0;

  const today = dayjs().format("YYYY-MM-DD");
  let streak = 0;

  for (const date of sortedDates) {
    const daysAgo = dayjs(today).diff(dayjs(date), "day");
    if (daysAgo > streak) break;

    const dayCommitments = byDate.get(date)!;
    const allCompleted = dayCommitments.every(
      (c) => c.status === "completed_unverified" || c.status === "completed_verified",
    );

    if (allCompleted) {
      streak++;
    } else {
      if (streak === 0 && date === today) continue;
      break;
    }
  }

  return streak;
}

export function calculateLongestAllOrNothingStreak(commitments: repo.Commitment[]): number {
  const byDate = new Map<string, repo.Commitment[]>();

  for (const c of commitments) {
    const dateKey = dayjs(c.createdAt).format("YYYY-MM-DD");
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(c);
  }

  const sortedDates = [...byDate.keys()].sort();
  if (sortedDates.length === 0) return 0;

  let longest = 0;
  let current = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const dayCommitments = byDate.get(date)!;
    const allCompleted = dayCommitments.every(
      (c) => c.status === "completed_unverified" || c.status === "completed_verified",
    );

    if (i > 0) {
      const prevDate = sortedDates[i - 1];
      const diff = dayjs(date).diff(dayjs(prevDate), "day");
      if (diff !== 1) current = 0;
    }

    if (allCompleted) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }

  return longest;
}

export function getDisciplineLevel(score: number): { level: number; title: string } {
  let result: { level: number; title: string } = { level: 1, title: "Beginner" };
  for (const l of DISCIPLINE_LEVELS) {
    if (score >= l.minScore) result = { level: l.level, title: l.title };
  }
  return result;
}

export async function calculateDisciplineScore(userId: string): Promise<{
  score: number;
  subScores: Record<string, number>;
  commitmentRate: number;
  isAllCompleted: boolean;
}> {
  const all = await repo.getAllCommitmentsForUser(userId);
  const subScores: Record<string, number> = {};

  // Commitments (30%) — based on promise ratio
  const completed = all.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  );
  const failed = all.filter((c) => c.status === "failed" || c.status === "missed");
  const totalResolved = completed.length + failed.length;
  const promiseRatio = totalResolved > 0 ? completed.length / totalResolved : 1;
  const commitmentScore = Math.round(promiseRatio * 100);
  subScores.commitments = commitmentScore;

  // Check if all today's commitments are completed (all-or-nothing)
  const today = dayjs().format("YYYY-MM-DD");
  const todayCommitments = all.filter(
    (c) => dayjs(c.createdAt).format("YYYY-MM-DD") === today,
  );
  const pendingToday = todayCommitments.filter(
    (c) => c.status === "pending" || c.status === "in_progress",
  );
  const isAllCompleted = todayCommitments.length > 0 && pendingToday.length === 0;

  // Habits (15%) — read from Habits service
  let habitScore = 0;
  try {
    const { getDashboard } = await import("@/modules/habits");
    const habitDashboard = await getDashboard(userId, { period: "week" });
    if (habitDashboard && habitDashboard.completionRate !== undefined) {
      habitScore = Math.round(habitDashboard.completionRate);
    }
  } catch {
    habitScore = 0;
  }
  subScores.habits = habitScore;

  // Tasks (15%) — read from Tasks service
  let taskScore = 0;
  try {
    const taskStats = await getTasks(userId, { status: "done" });
    const allTasks = await getTasks(userId, {});
    const totalTasks = allTasks.length;
    const doneTasks = taskStats.length;
    taskScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  } catch {
    taskScore = 0;
  }
  subScores.tasks = taskScore;

  // Sleep (10%) — read from Wellness
  let sleepScore = 0;
  try {
    const { getSleepRecords } = await import("@/modules/wellness");
    const lastWeek = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    const records = await getSleepRecords(userId, { dateFrom: lastWeek });
    if (records.length > 0) {
      const avgQuality = records.reduce((s: number, r: any) => s + (r.quality ?? 0), 0) / records.length;
      sleepScore = Math.round((avgQuality / 10) * 100);
    }
  } catch {
    sleepScore = 0;
  }
  subScores.sleep = sleepScore;

  // Journaling (10%) — read from Journal service
  let journalScore = 0;
  try {
    const { getJournalStats } = await import("@/modules/journal");
    const stats = await getJournalStats(userId);
    if (stats && stats.totalEntries !== undefined) {
      const journalEntriesLast30 = stats.recentEntries?.length ?? 0;
      journalScore = Math.round(Math.min((journalEntriesLast30 / 30) * 100, 100));
    }
  } catch {
    journalScore = 0;
  }
  subScores.journaling = journalScore;

  // Goals (10%) — read from Goals service
  let goalScore = 0;
  try {
    const goals = await getGoals(userId);
    const active = goals.filter((g: any) => g.status === "active");
    if (active.length > 0) {
      const avgProgress = active.reduce((s: number, g: any) => s + (g.progress ?? 0), 0) / active.length;
      goalScore = Math.round(avgProgress);
    }
  } catch {
    goalScore = 0;
  }
  subScores.goals = goalScore;

  // Exercise (10%) — from Timeline activity entries
  let exerciseScore = 0;
  try {
    const { getTimelineEvents } = await import("@/modules/timeline");
    const events = await getTimelineEvents(userId);
    const weekAgo = dayjs().subtract(7, "day");
    const recentEvents = events.filter((e: any) =>
      e.createdAt && dayjs(e.createdAt).isAfter(weekAgo),
    );
    const exerciseEntries = recentEvents.filter((e: any) =>
      e.category === "health" || (e.activityType && e.activityType.toString().toLowerCase().includes("exercise")),
    );
    exerciseScore = Math.round(Math.min((exerciseEntries.length / 14) * 100, 100));
  } catch {
    exerciseScore = 0;
  }
  subScores.exercise = exerciseScore;

  // Calculate weighted score
  const weightedScore =
    (subScores.commitments * SCORE_WEIGHTS.commitments) +
    (subScores.habits * SCORE_WEIGHTS.habits) +
    (subScores.tasks * SCORE_WEIGHTS.tasks) +
    (subScores.sleep * SCORE_WEIGHTS.sleep) +
    (subScores.exercise * SCORE_WEIGHTS.exercise) +
    (subScores.journaling * SCORE_WEIGHTS.journaling) +
    (subScores.goals * SCORE_WEIGHTS.goals);

  // Streak bonus (capped)
  const currentStreak = calculateAllOrNothingStreak(all);
  const streakBonus = Math.min(currentStreak * 0.5, 15);

  const score = Math.max(0, Math.min(100, Math.round(weightedScore + streakBonus)));
  const commitmentRate = totalResolved > 0 ? Math.round((completed.length / totalResolved) * 100) : 100;

  return { score, subScores, commitmentRate, isAllCompleted };
}

export async function getDisciplineDashboard(userId: string, period: string = "today") {
  const all = await repo.getAllCommitmentsForUser(userId);

  const currentStreak = calculateCurrentStreak(all);
  const longestStreak = calculateLongestStreak(all);
  const allOrNothingStreak = calculateAllOrNothingStreak(all);
  const longestAllOrNothingStreak = calculateLongestAllOrNothingStreak(all);

  const { score, subScores, commitmentRate, isAllCompleted } = await calculateDisciplineScore(userId);
  const level = getDisciplineLevel(score);

  const today = dayjs().format("YYYY-MM-DD");
  const todayCheckin = await repo.getCheckin(userId, today);

  // Days stayed consistent (days with all commitments completed)
  const byDate = new Map<string, repo.Commitment[]>();
  for (const c of all) {
    const dateKey = dayjs(c.createdAt).format("YYYY-MM-DD");
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(c);
  }
  const daysConsistent = [...byDate.entries()].filter(([_, commitments]) =>
    commitments.every(
      (c) => c.status === "completed_unverified" || c.status === "completed_verified",
    ),
  ).length;

  const missedCount = all.filter((c) => c.status === "missed").length;
  const failedCount = all.filter((c) => c.status === "failed").length;
  const totalMissed = missedCount + failedCount;

  // Monthly improvement
  const thisMonth = dayjs().startOf("month");
  const lastMonth = thisMonth.subtract(1, "month");
  const thisMonthCommitments = all.filter((c) => dayjs(c.createdAt).isAfter(thisMonth));
  const lastMonthCommitments = all.filter(
    (c) =>
      dayjs(c.createdAt).isAfter(lastMonth) && dayjs(c.createdAt).isBefore(thisMonth),
  );

  const thisMonthCompleted = thisMonthCommitments.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  ).length;
  const lastMonthCompleted = lastMonthCommitments.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  ).length;

  const thisMonthRate = thisMonthCommitments.length > 0
    ? thisMonthCompleted / thisMonthCommitments.length
    : 0;
  const lastMonthRate = lastMonthCommitments.length > 0
    ? lastMonthCompleted / lastMonthCommitments.length
    : 0;
  const monthlyImprovement = Math.round((thisMonthRate - lastMonthRate) * 100);

  // Weekly rating
  const weekStart = dayjs().startOf("week");
  const weekCommitments = all.filter((c) => dayjs(c.createdAt).isAfter(weekStart));
  const weekCompleted = weekCommitments.filter(
    (c) => c.status === "completed_unverified" || c.status === "completed_verified",
  ).length;
  const weeklyRating = weekCommitments.length > 0
    ? Math.round((weekCompleted / weekCommitments.length) * 100)
    : 0;

  const recentEvents = await repo.getRecentEvents(userId, 20);

  return {
    disciplineScore: score,
    subScores,
    currentStreak: allOrNothingStreak,
    longestStreak: longestAllOrNothingStreak,
    daysConsistent,
    missedCommitments: totalMissed,
    weeklyRating,
    monthlyImprovement,
    level: level.level,
    levelTitle: level.title,
    commitmentRate,
    isAllCompleted,
    todayCheckin: todayCheckin ?? null,
    upcomingDeadlines: all
      .filter((c) => {
        if (!c.dueDate || c.status === "completed_verified" || c.status === "completed_unverified" || c.status === "cancelled") return false;
        return dayjs(c.dueDate).isAfter(dayjs());
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return dayjs(a.dueDate).diff(dayjs(b.dueDate));
      })
      .slice(0, 10),
    recentEvents,
  };
}

export async function getExcuseTagDistribution(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
) {
  return repo.getExcuseTagDistribution(userId, dateFrom, dateTo);
}

export async function computeDailySnapshot(userId: string) {
  const today = dayjs().format("YYYY-MM-DD");
  const existing = await repo.getSnapshot(userId, today);

  const { score, subScores, commitmentRate, isAllCompleted } = await calculateDisciplineScore(userId);
  const all = await repo.getAllCommitmentsForUser(userId);
  const streak = calculateAllOrNothingStreak(all);
  const level = getDisciplineLevel(score);

  const data = {
    userId,
    date: today,
    score,
    streak,
    level: level.level,
    levelTitle: level.title,
    subScores: JSON.stringify(subScores),
    commitmentRate,
    isAllCompleted: String(isAllCompleted),
    id: existing?.id,
  };

  const snapshot = await repo.upsertSnapshot(data);

  // Check for milestones
  const events = await repo.getRecentEvents(userId, 200);
  const milestoneEvents = events.filter((e) => e.eventType === "milestone_reached");

  // 7-day streak milestone
  if (streak === 7 && !milestoneEvents.some((e) => {
    const m = e.metadata ? JSON.parse(e.metadata) : {};
    return m.type === "streak_7_days";
  })) {
    await repo.createEvent({
      commitmentId: "00000000-0000-0000-0000-000000000000",
      eventType: "milestone_reached",
      metadata: JSON.stringify({ type: "streak_7_days", title: "First Week Completed", streak }),
    });
  }

  // 30-day streak milestone
  if (streak === 30 && !milestoneEvents.some((e) => {
    const m = e.metadata ? JSON.parse(e.metadata) : {};
    return m.type === "streak_30_days";
  })) {
    await repo.createEvent({
      commitmentId: "00000000-0000-0000-0000-000000000000",
      eventType: "milestone_reached",
      metadata: JSON.stringify({ type: "streak_30_days", title: "30-Day Streak!", streak }),
    });
  }

  // Score milestones
  if (score >= 95 && !milestoneEvents.some((e) => {
    const m = e.metadata ? JSON.parse(e.metadata) : {};
    return m.type === "score_life_master";
  })) {
    await repo.createEvent({
      commitmentId: "00000000-0000-0000-0000-000000000000",
      eventType: "milestone_reached",
      metadata: JSON.stringify({ type: "score_life_master", title: "Life Master Achieved", score }),
    });
  }

  return snapshot;
}
