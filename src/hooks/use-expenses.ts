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
    queryFn: () => fetch("/api/expenses/overview").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesTransactions(search?: string, page?: number) {
  return useQuery<Transaction[]>({
    queryKey: expenseKeys.transactions(search, page),
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (page) params.set("offset", String((page - 1) * 50));
      params.set("limit", "50");
      return fetch(`/api/expenses/transactions?${params}`).then((r) => r.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesAccounts() {
  return useQuery<Account[]>({
    queryKey: expenseKeys.accounts(),
    queryFn: () => fetch("/api/expenses/accounts").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.filter((account) => !account.isArchived),
  });
}

export function useExpensesBudgets() {
  return useQuery<BudgetWithSpending[]>({
    queryKey: expenseKeys.budgets(),
    queryFn: () => fetch("/api/expenses/budgets").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesSubscriptions() {
  return useQuery<RecurringTransaction[]>({
    queryKey: expenseKeys.subscriptions(),
    queryFn: () => fetch("/api/expenses/subscriptions").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesAnalytics(year?: number, month?: number) {
  return useQuery<AnalyticsData>({
    queryKey: expenseKeys.analytics(year, month),
    queryFn: () => {
      const params = new URLSearchParams();
      if (year) params.set("year", String(year));
      if (month) params.set("month", String(month));
      return fetch(`/api/expenses/analytics?${params}`).then((r) => r.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesCategories() {
  return useQuery<ExpenseCategory[]>({
    queryKey: expenseKeys.categories(),
    queryFn: () =>
      fetch("/api/expenses/overview")
        .then((r) => r.json())
        .then((d: OverviewData) => d.categories as unknown as ExpenseCategory[]),
    staleTime: 5 * 60 * 1000,
  });
}
