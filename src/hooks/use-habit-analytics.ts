"use client";

import { useQuery } from "@tanstack/react-query";

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
  const sp = new URLSearchParams();
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.period) sp.set("period", params.period);
  if (params.category) sp.set("category", params.category);
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function useHabitAnalytics(filters?: FilterParams) {
  return useQuery<DashboardData>({
    queryKey: ["habit-analytics-dashboard", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/habits/analytics/dashboard", filters));
      if (!res.ok) throw new Error("Failed to load habit analytics");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useHabitStreaks() {
  return useQuery<StreakData>({
    queryKey: ["habit-streaks"],
    queryFn: async () => {
      const res = await fetch("/api/habits/analytics/streaks");
      if (!res.ok) throw new Error("Failed to load streaks");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useHabitTrends(filters?: FilterParams) {
  return useQuery<CompletionTrendsData>({
    queryKey: ["habit-completion-trends", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/habits/analytics/completion-trends", filters));
      if (!res.ok) throw new Error("Failed to load trends");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useHabitHeatmap(filters?: FilterParams) {
  return useQuery<HeatmapData>({
    queryKey: ["habit-heatmap", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/habits/analytics/heatmap", filters));
      if (!res.ok) throw new Error("Failed to load heatmap");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useHabitRankings(filters?: FilterParams) {
  return useQuery<RankingsData>({
    queryKey: ["habit-rankings", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/habits/analytics/rankings", filters));
      if (!res.ok) throw new Error("Failed to load rankings");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useHabitInsights(filters?: FilterParams) {
  return useQuery<Insight[]>({
    queryKey: ["habit-insights", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/habits/analytics/insights", filters));
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useHabitSummary() {
  return useQuery<SummaryData>({
    queryKey: ["habit-summary"],
    queryFn: async () => {
      const res = await fetch("/api/habits/analytics/summary");
      if (!res.ok) throw new Error("Failed to load summary");
      return res.json();
    },
    staleTime: 15_000,
  });
}
