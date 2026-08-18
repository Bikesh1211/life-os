"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

export type DashboardData = {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  completionRate: number;
  rateChange: number;
  currentStreak: number;
  longestStreak: number;
  bestStreakHabit: string | null;
  consistencyScore: number;
  totalCompletions: number;
  missedHabits: number;
  streakResults: Array<{ habitId: string; title: string; current: number; longest: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ category: string; completed: number }>;
};

export type StreakData = Array<{
  habitId: string;
  title: string;
  current: number;
  longest: number;
  totalCompletions: number;
  brokenStreaks: Array<{ from: string; to: string; length: number }>;
}>;

export type CompletionTrendsData = {
  dailyTrend: Array<{ date: string; count: number }>;
  habitPerformance: Array<{
    habitId: string;
    title: string;
    category: string | null;
    frequency: string;
    completed: number;
    expected: number;
    rate: number;
  }>;
};

export type HeatmapData = Array<{ date: string; count: number }>;

export type RankingsData = {
  byCompletionRate: Array<Record<string, unknown>>;
  byConsistency: Array<Record<string, unknown>>;
  topPerformers: Array<Record<string, unknown>>;
  needsImprovement: Array<Record<string, unknown>>;
};

export type Insight = { type: "positive" | "negative" | "info"; message: string };

export type SummaryData = {
  totalHabits: number;
  completedToday: number;
  pendingToday: number;
  currentStreak: number;
  longestStreak: number;
};

type FilterParams = {
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  category?: string;
};

function buildUrl(base: string, params?: FilterParams) {
  if (!params) return base;
  return `${base}${toSearchParams(params)}`;
}

export function useHabitAnalytics(filters?: FilterParams) {
  return useQuery<DashboardData>({
    queryKey: ["habit-analytics-dashboard", filters ?? {}],
    queryFn: () => apiFetch<DashboardData>(buildUrl("/api/habits/analytics/dashboard", filters)),
    staleTime: 30_000,
  });
}

export function useHabitStreaks() {
  return useQuery<StreakData>({
    queryKey: ["habit-streaks"],
    queryFn: () => apiFetch<StreakData>("/api/habits/analytics/streaks"),
    staleTime: 30_000,
  });
}

export function useHabitTrends(filters?: FilterParams) {
  return useQuery<CompletionTrendsData>({
    queryKey: ["habit-completion-trends", filters ?? {}],
    queryFn: () => apiFetch<CompletionTrendsData>(buildUrl("/api/habits/analytics/completion-trends", filters)),
    staleTime: 30_000,
  });
}

export function useHabitHeatmap(filters?: FilterParams) {
  return useQuery<HeatmapData>({
    queryKey: ["habit-heatmap", filters ?? {}],
    queryFn: () => apiFetch<HeatmapData>(buildUrl("/api/habits/analytics/heatmap", filters)),
    staleTime: 30_000,
  });
}

export function useHabitRankings(filters?: FilterParams) {
  return useQuery<RankingsData>({
    queryKey: ["habit-rankings", filters ?? {}],
    queryFn: () => apiFetch<RankingsData>(buildUrl("/api/habits/analytics/rankings", filters)),
    staleTime: 30_000,
  });
}

export function useHabitInsights(filters?: FilterParams) {
  return useQuery<Insight[]>({
    queryKey: ["habit-insights", filters ?? {}],
    queryFn: () => apiFetch<Insight[]>(buildUrl("/api/habits/analytics/insights", filters)),
    staleTime: 60_000,
  });
}

export function useHabitSummary() {
  return useQuery<SummaryData>({
    queryKey: ["habit-summary"],
    queryFn: () => apiFetch<SummaryData>("/api/habits/analytics/summary"),
    staleTime: 15_000,
  });
}
