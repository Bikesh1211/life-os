import { db } from "@/core/database";
import { budgets } from "../schema/budgets";
import { eq, and, isNull } from "drizzle-orm";

export type Budget = typeof budgets.$inferSelect;
export type CreateBudgetInput = typeof budgets.$inferInsert;
export type UpdateBudgetInput = Partial<Omit<CreateBudgetInput, "id" | "userId">>;

export async function createBudget(input: CreateBudgetInput) {
  const [budget] = await db.insert(budgets).values(input).returning();
  return budget;
}

export async function getBudgetsForUser(userId: string) {
  return db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), isNull(budgets.deletedAt)))
    .orderBy(budgets.createdAt);
}

export async function getBudgetById(id: string, userId: string) {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId), isNull(budgets.deletedAt)));
  return budget ?? null;
}

export async function updateBudget(id: string, userId: string, input: UpdateBudgetInput) {
  const [budget] = await db
    .update(budgets)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId), isNull(budgets.deletedAt)))
    .returning();
  return budget ?? null;
}

export async function deleteBudget(id: string, userId: string) {
  const [budget] = await db
    .update(budgets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId), isNull(budgets.deletedAt)))
    .returning();
  return budget ?? null;
}
