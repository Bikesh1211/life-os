import { z } from "zod";
import dayjs from "dayjs";
import * as repo from "./repository";

export const goalCategories = [
  "personal",
  "career",
  "education",
  "health",
  "finance",
  "relationships",
  "business",
  "creative",
] as const;

export const createGoalSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  type: z.enum(["long-term", "short-term"]).default("short-term"),
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("draft"),
  progress: z.number().int().min(0).max(100).default(0),
  deadline: z.string().datetime().optional().nullable(),
  category: z.enum(goalCategories).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  linkedEntityType: z.string().optional().nullable(),
  linkedEntityId: z.string().optional().nullable(),
  aiSuggested: z.boolean().default(false),
  reward: z.string().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const createMilestoneSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().min(1).max(300),
  completed: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  targetDate: z.string().datetime().optional().nullable(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial().omit({ goalId: true });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export async function getGoals(userId: string, status?: string, type?: string) {
  return repo.getGoals(userId, status, type);
}

export async function getActiveGoals(userId: string) {
  return repo.getGoals(userId, "active");
}

export async function getCompletedGoals(userId: string) {
  return repo.getGoals(userId, "completed");
}

export async function getGoalById(userId: string, goalId: string) {
  return repo.getGoalById(userId, goalId);
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const data = createGoalSchema.parse(input);
  return repo.createGoal({
    ...data,
    userId,
    deadline: data.deadline ? new Date(data.deadline) : null,
  } as any);
}

export async function updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
  const data = updateGoalSchema.parse(input);
  const updateData: Record<string, any> = { ...data };
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? new Date(data.deadline) : null;
  }
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.status === "completed") {
    updateData.completionDate = new Date();
  }
  if (data.status === "active" && !data.startDate) {
    updateData.startDate = new Date();
  }
  return repo.updateGoal(userId, goalId, updateData);
}

export async function deleteGoal(userId: string, goalId: string) {
  return repo.deleteGoal(userId, goalId);
}

export async function getMilestones(goalId: string, userId: string) {
  return repo.getMilestones(goalId, userId);
}

export async function createMilestone(userId: string, input: CreateMilestoneInput) {
  const data = createMilestoneSchema.parse(input);
  const goal = await repo.getGoalById(userId, data.goalId);
  if (!goal) throw new Error("Goal not found");
  return repo.createMilestone({
    ...data,
    targetDate: data.targetDate ? new Date(data.targetDate) : null,
  });
}

export async function updateMilestone(
  milestoneId: string,
  userId: string,
  input: UpdateMilestoneInput,
) {
  const data = updateMilestoneSchema.parse(input);
  const updateData: Record<string, any> = { ...data };
  if (data.targetDate !== undefined) {
    updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
  }
  return repo.updateMilestone(milestoneId, userId, updateData);
}

export async function deleteMilestone(milestoneId: string, userId: string) {
  return repo.deleteMilestone(milestoneId, userId);
}

export async function getOverview(userId: string) {
  const [goalCounts, recent, overdueGoals] = await Promise.all([
    repo.getGoalCounts(userId),
    repo.getRecentGoals(userId),
    repo.getOverdueGoals(userId, 10),
  ]);
  return {
    ...goalCounts,
    recentGoals: recent,
    overdueGoals,
  };
}

export async function getAnalytics(userId: string) {
  const allGoals = await repo.getGoals(userId);
  const completed = allGoals.filter((g: any) => g.status === "completed");
  const cancelled = allGoals.filter((g: any) => g.status === "cancelled");

  const longTerm = allGoals.filter((g: any) => g.type === "long-term");
  const shortTerm = allGoals.filter((g: any) => g.type === "short-term");

  const avgCompletionTime = completed
    .filter((g: any) => g.startDate && g.completionDate)
    .reduce((sum: any, g: any) => {
      const days = dayjs(g.completionDate!).diff(dayjs(g.startDate!), "day");
      return sum + days;
    }, 0) / (completed.filter((g: any) => g.startDate && g.completionDate).length || 1);

  const avgProgress = allGoals.length > 0
    ? Math.round(allGoals.reduce((sum: any, g: any) => sum + g.progress, 0) / allGoals.length)
    : 0;

  const categoryDist: Record<string, number> = {};
  for (const goal of allGoals) {
    const cat = goal.category || "uncategorized";
    categoryDist[cat] = (categoryDist[cat] || 0) + 1;
  }

  const overdueCount = allGoals.filter(
    (g: any) => g.deadline && g.status === "active" && new Date(g.deadline) < new Date(),
  ).length;

  return {
    totalCreated: allGoals.length,
    totalCompleted: completed.length,
    totalCancelled: cancelled.length,
    longTermCount: longTerm.length,
    shortTermCount: shortTerm.length,
    avgProgress,
    avgCompletionTimeDays: Math.round(avgCompletionTime),
    overdueCount,
    completionRate: allGoals.length > 0
      ? Math.round((completed.length / allGoals.length) * 100)
      : 0,
    categoryDistribution: categoryDist,
  };
}
