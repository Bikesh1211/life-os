import { z } from "zod";
import dayjs from "dayjs";
import * as repo from "./repository";
import { getTasks } from "@/modules/tasks";
import { getGoals } from "@/modules/goals";

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
  blockers: z.string().optional(),
  improvement: z.string().optional(),
  reflection: z.string().optional(),
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
  input: { date: string; blockers?: string; improvement?: string; reflection?: string },
) {
  const existing = await repo.getCheckin(userId, input.date);
  const data = {
    userId,
    date: input.date,
    blockers: input.blockers ?? null,
    improvement: input.improvement ?? null,
    reflection: input.reflection ?? null,
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

  const commitments: repo.Commitment[] = [];
  for (const id of commitmentIds) {
    const c = await repo.getCommitmentById(userId, id);
    if (c) commitments.push(c);
  }

  const commitmentMap = new Map(commitments.map((c) => [c.id, c]));

  return events.map((event) => ({
    ...event,
    commitment: commitmentMap.get(event.commitmentId) ?? null,
    metadata: event.metadata ? JSON.parse(event.metadata) : null,
  }));
}

export async function getInsights(userId: string) {
  const analytics = await getAnalytics(userId);
  const all = await repo.getAllCommitmentsForUser(userId);
  const dayOfWeekDist = await repo.getDayOfWeekDistribution(userId);
  const categoryDist = await repo.getCategoryDistribution(userId);

  const insights: Array<{ type: "positive" | "negative" | "info"; message: string }> = [];

  if (analytics.integrityScore >= 90) {
    insights.push({ type: "positive", message: `Your integrity score is ${analytics.integrityScore}/100 — excellent reliability!` });
  } else if (analytics.integrityScore >= 70) {
    insights.push({ type: "positive", message: `Your integrity score is ${analytics.integrityScore}/100. You're building strong commitment habits.` });
  } else if (analytics.integrityScore >= 50) {
    insights.push({ type: "info", message: `Your integrity score is ${analytics.integrityScore}/100. There's room to improve your follow-through.` });
  } else {
    insights.push({ type: "negative", message: `Your integrity score is ${analytics.integrityScore}/100. Start with easier commitments to build momentum.` });
  }

  if (analytics.currentStreak >= 30) {
    insights.push({ type: "positive", message: `You're on an incredible ${analytics.currentStreak}-day integrity streak!` });
  } else if (analytics.currentStreak >= 7) {
    insights.push({ type: "positive", message: `You're on a ${analytics.currentStreak}-day streak! Keep the momentum going.` });
  } else if (analytics.currentStreak >= 3) {
    insights.push({ type: "info", message: `Current streak: ${analytics.currentStreak} days. Can you make it a week?` });
  }

  if (analytics.promiseRatio >= 90) {
    insights.push({ type: "positive", message: `You keep ${analytics.promiseRatio}% of your commitments — you're a person of your word.` });
  } else if (analytics.promiseRatio >= 70) {
    insights.push({ type: "info", message: `Promise success rate: ${analytics.promiseRatio}%. Aim for 90%+.` });
  } else {
    insights.push({ type: "negative", message: `Promise success rate: ${analytics.promiseRatio}%. Try making fewer, more realistic commitments.` });
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

  if (analytics.avgCompletionTimeHours > 0) {
    insights.push({ type: "info", message: `Average completion time: ${analytics.avgCompletionTimeHours} hours. Use this to estimate future commitments better.` });
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
