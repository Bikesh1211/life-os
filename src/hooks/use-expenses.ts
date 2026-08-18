"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Account,
  Transaction,
  Budget,
  Tag,
  ExpenseCategory,
  BudgetWithSpending,
  RecurringTransaction,
  OverviewData,
  AnalyticsData,
} from "@/modules/expenses";
import { apiFetch, toSearchParams } from "@/core/api/http";

export const expenseKeys = {
  all: ["expenses"] as const,
  overview: () => [...expenseKeys.all, "overview"] as const,
  transactions: (search?: string, page?: number) =>
    [...expenseKeys.all, "transactions", { search, page }] as const,
  accounts: () => [...expenseKeys.all, "accounts"] as const,
  budgets: () => [...expenseKeys.all, "budgets"] as const,
  subscriptions: () => [...expenseKeys.all, "subscriptions"] as const,
  analytics: (year?: number, month?: number) =>
    [...expenseKeys.all, "analytics", year, month] as const,
  categories: () => [...expenseKeys.all, "categories"] as const,
};

export function useExpensesOverview() {
  return useQuery<OverviewData>({
    queryKey: expenseKeys.overview(),
    queryFn: () => apiFetch<OverviewData>("/api/expenses/overview"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesTransactions(search?: string, page?: number) {
  return useQuery<Transaction[]>({
    queryKey: expenseKeys.transactions(search, page),
    queryFn: () =>
      apiFetch<Transaction[]>(
        `/api/expenses/transactions${toSearchParams({
          search,
          offset: page ? String((page - 1) * 50) : undefined,
          limit: "50",
        })}`,
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesAccounts() {
  return useQuery<Account[]>({
    queryKey: expenseKeys.accounts(),
    queryFn: () => apiFetch<Account[]>("/api/expenses/accounts"),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.filter((account) => !account.isArchived),
  });
}

export function useExpensesBudgets() {
  return useQuery<BudgetWithSpending[]>({
    queryKey: expenseKeys.budgets(),
    queryFn: () => apiFetch<BudgetWithSpending[]>("/api/expenses/budgets"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesSubscriptions() {
  return useQuery<RecurringTransaction[]>({
    queryKey: expenseKeys.subscriptions(),
    queryFn: () => apiFetch<RecurringTransaction[]>("/api/expenses/subscriptions"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesAnalytics(year?: number, month?: number) {
  return useQuery<AnalyticsData>({
    queryKey: expenseKeys.analytics(year, month),
    queryFn: () =>
      apiFetch<AnalyticsData>(
        `/api/expenses/analytics${toSearchParams({
          year: year || undefined,
          month: month || undefined,
        })}`,
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesCategories() {
  return useQuery<ExpenseCategory[]>({
    queryKey: expenseKeys.categories(),
    queryFn: () =>
      apiFetch<OverviewData>("/api/expenses/overview").then(
        (d: OverviewData) => d.categories as unknown as ExpenseCategory[],
      ),
    staleTime: 5 * 60 * 1000,
  });
}
