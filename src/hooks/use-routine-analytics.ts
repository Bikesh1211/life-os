"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

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
  return `${base}${toSearchParams(params)}`;
}

export function useRoutineAnalytics(filters?: FilterParams) {
  return useQuery<RoutineAnalytics>({
    queryKey: ["routine-analytics", filters ?? {}],
    queryFn: () => apiFetch<RoutineAnalytics>(buildUrl("/api/routines/analytics", filters)),
    staleTime: 30_000,
  });
}

export function useRoutineDetailAnalytics(routineId: string, filters?: FilterParams) {
  return useQuery<RoutineDetailAnalytics>({
    queryKey: ["routine-analytics", routineId, filters ?? {}],
    queryFn: () =>
      apiFetch<RoutineDetailAnalytics>(
        buildUrl(`/api/routines/analytics${toSearchParams({ routineId })}`, filters),
      ),
    enabled: !!routineId,
    staleTime: 30_000,
  });
}
