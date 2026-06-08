import { createBudget, getBudgetsForUser, getBudgetById, updateBudget, deleteBudget } from "../repository/budgets";
import { getSpendingByCategory } from "../repository/queries";
import { createBudgetSchema, updateBudgetSchema, type CreateBudgetParams, type UpdateBudgetParams } from "./validators";
import dayjs from "dayjs";

export async function createExpenseBudget(userId: string, params: CreateBudgetParams) {
  const validated = createBudgetSchema.parse(params);
  return createBudget({
    ...validated,
    userId,
    startDate: new Date(validated.startDate),
    endDate: validated.endDate ? new Date(validated.endDate) : undefined,
  });
}

export async function getExpenseBudgets(userId: string) {
  return getBudgetsForUser(userId);
}

export async function getExpenseBudget(id: string, userId: string) {
  return getBudgetById(id, userId);
}

export async function updateExpenseBudget(id: string, userId: string, params: UpdateBudgetParams) {
  const validated = updateBudgetSchema.parse(params);
  const updateData: Record<string, unknown> = { ...validated };
  if (validated.startDate) updateData.startDate = new Date(validated.startDate);
  if (validated.endDate) updateData.endDate = new Date(validated.endDate);
  return updateBudget(id, userId, updateData);
}

export async function deleteExpenseBudget(id: string, userId: string) {
  return deleteBudget(id, userId);
}

export async function getBudgetsWithSpending(userId: string) {
  const budgets = await getBudgetsForUser(userId);
  const now = dayjs();
  const spendingByCategory = await getSpendingByCategory(userId, now.year(), now.month() + 1);

  return budgets.map((budget) => {
    const spending = spendingByCategory.find((s) => s.categoryId === budget.categoryId);
    const spent = spending ? Number(spending.total) : 0;
    const budgetAmount = Number(budget.amount);
    return {
      ...budget,
      spent,
      remaining: budgetAmount - spent,
      percentageUsed: budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0,
      categoryName: spending?.categoryName ?? null,
      categoryColor: spending?.categoryColor ?? null,
      categoryIcon: spending?.categoryIcon ?? null,
    };
  });
}
