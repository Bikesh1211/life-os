"use client";

import { useQuery } from "@tanstack/react-query";

export type RoutineAnalytics = {
  routineCount: number;
  executionCount: number;
  completionRate: number;
  totalCompleted: number;
  totalMissed: number;
  totalSkipped: number;
  consistencyScore: number;
  dailyTrend: Array<{ date: string; completed: number; total: number; rate: number }>;
  routinePerformance: Array<{
    routineId: string;
    total: number;
    completed: number;
    avgCompletionRate: number;
    rate: number;
  }>;
  mostFollowedRoutine: { routineId: string; completed: number } | null;
  mostMissedItems: Array<{
    routineItemId: string;
    total: number;
    completed: number;
    skipped: number;
    rate: number;
    itemTitle: string;
  }>;
  bestDay: { date: string; rate: number } | null;
  worstDay: { date: string; rate: number } | null;
};

export type RoutineDetailAnalytics = {
  totalExecutions: number;
  completed: number;
  completionRate: number;
  avgItemCompletionRate: number;
  dailyData: Array<{ date: string; status: string; completionRate: number }>;
};

type FilterParams = {
  dateFrom?: string;
  dateTo?: string;
};

function buildUrl(base: string, params?: FilterParams) {
  if (!params) return base;
  const sp = new URLSearchParams();
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function useRoutineAnalytics(filters?: FilterParams) {
  return useQuery<RoutineAnalytics>({
    queryKey: ["routine-analytics", filters ?? {}],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/routines/analytics", filters));
      if (!res.ok) throw new Error("Failed to load routine analytics");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useRoutineDetailAnalytics(routineId: string, filters?: FilterParams) {
  return useQuery<RoutineDetailAnalytics>({
    queryKey: ["routine-analytics", routineId, filters ?? {}],
    queryFn: async () => {
      const url = buildUrl(`/api/routines/analytics?routineId=${routineId}`, filters);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load routine analytics");
      return res.json();
    },
    enabled: !!routineId,
    staleTime: 30_000,
  });
}
