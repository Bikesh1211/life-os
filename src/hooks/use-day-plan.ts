"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

export type DayPlanItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  category: string | null;
  priority: string | null;
  location: string | null;
  isOptional: boolean;
  status: string | null;
  linkedHabitId: string | null;
  linkedTaskId: string | null;
  order: number;
  source: "routine" | "adhoc";
  routineId: string | null;
  routineName: string | null;
  routineColor: string | null;
  executionId: string | null;
  executionItemId: string | null;
};

export type DayMetrics = {
  totalItems: number;
  completedItems: number;
  plannedHours: number;
  completionRate: number;
};

export function useDayPlan(date: string) {
  return useQuery<{ items: DayPlanItem[]; metrics: DayMetrics }>({
    queryKey: ["day-plan", date],
    queryFn: () =>
      apiFetch<{ items: DayPlanItem[]; metrics: DayMetrics }>(
        `/api/routines/day-plan${toSearchParams({ date })}`,
      ),
    enabled: !!date,
  });
}

export function useDayMetrics(date: string) {
  return useQuery<DayMetrics>({
    queryKey: ["day-metrics", date],
    queryFn: () => apiFetch<DayMetrics>(`/api/routines/day-plan/metrics${toSearchParams({ date })}`),
    enabled: !!date,
  });
}

export function useCreateAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      date: string;
      category?: string;
      priority?: string;
      location?: string;
    }) =>
      apiFetch("/api/routines/day-plan/ad-hoc", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useUpdateAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      ...data
    }: {
      id: string;
      date: string;
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      category?: string;
      priority?: string;
      location?: string;
    }) =>
      apiFetch(`/api/routines/day-plan/ad-hoc/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useDeleteAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      apiFetch(`/api/routines/day-plan/ad-hoc/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      status,
    }: {
      id: string;
      date: string;
      status: "pending" | "in_progress" | "completed" | "skipped";
    }) =>
      apiFetch(`/api/routines/day-plan/items/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}
