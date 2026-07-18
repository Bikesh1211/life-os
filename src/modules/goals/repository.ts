import { db } from "@/core/database";
import { goals, goalMilestones } from "./schema";
import { eq, and, isNull, asc, inArray, desc, count, sql } from "drizzle-orm";

export type Goal = typeof goals.$inferSelect;
export type CreateGoalInput = typeof goals.$inferInsert;
export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type CreateMilestoneInput = typeof goalMilestones.$inferInsert;

export const allowedGoalTypes = ["long-term", "short-term"] as const;
export const allowedGoalStatuses = ["draft", "active", "completed", "cancelled"] as const;

export async function getGoals(userId: string, status?: string, type?: string) {
  const conditions = [eq(goals.userId, userId), isNull(goals.deletedAt)];
  if (status) conditions.push(eq(goals.status, status as any));
  if (type) conditions.push(eq(goals.type, type));
  return db
    .select()
    .from(goals)
    .where(and(...conditions))
    .orderBy(desc(goals.createdAt));
}

export async function getGoalById(userId: string, goalId: string) {
  const result = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createGoal(input: CreateGoalInput) {
  const result = await db.insert(goals).values(input).returning();
  return result[0];
}

export async function updateGoal(userId: string, goalId: string, input: Partial<CreateGoalInput>) {
  const result = await db
    .update(goals)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteGoal(userId: string, goalId: string) {
  const result = await db
    .update(goals)
    .set({ deletedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getMilestones(goalId: string) {
  return db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId))
    .orderBy(asc(goalMilestones.order));
}

export async function createMilestone(input: CreateMilestoneInput) {
  const result = await db.insert(goalMilestones).values(input).returning();
  return result[0];
}

export async function updateMilestone(milestoneId: string, input: Partial<CreateMilestoneInput>) {
  const result = await db
    .update(goalMilestones)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(goalMilestones.id, milestoneId))
    .returning();
  return result[0] ?? null;
}

export async function deleteMilestone(milestoneId: string) {
  const result = await db
    .delete(goalMilestones)
    .where(eq(goalMilestones.id, milestoneId))
    .returning();
  return result[0] ?? null;
}

export async function getGoalCounts(userId: string) {
  const rows = await db
    .select({
      status: goals.status,
      value: count(),
    })
    .from(goals)
    .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)))
    .groupBy(goals.status);

  let total = 0;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status as string] = Number(row.value);
    total += Number(row.value);
  }

  return {
    total,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    draft: counts.draft ?? 0,
  };
}

export async function getRecentGoals(userId: string, limit = 5) {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)))
    .orderBy(desc(goals.updatedAt))
    .limit(limit);
}

export async function getOverdueGoals(userId: string, limit = 10) {
  const now = new Date();
  return db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, "active" as any),
        isNull(goals.deletedAt),
        sql`${goals.deadline} < now()`,
      ),
    )
    .orderBy(asc(goals.deadline))
    .limit(limit);
}
