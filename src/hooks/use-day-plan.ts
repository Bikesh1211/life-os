"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch(`/api/routines/day-plan?date=${date}`);
      if (!res.ok) throw new Error("Failed to load day plan");
      return res.json();
    },
    enabled: !!date,
  });
}

export function useDayMetrics(date: string) {
  return useQuery<DayMetrics>({
    queryKey: ["day-metrics", date],
    queryFn: async () => {
      const res = await fetch(`/api/routines/day-plan/metrics?date=${date}`);
      if (!res.ok) throw new Error("Failed to load day metrics");
      return res.json();
    },
    enabled: !!date,
  });
}

export function useCreateAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      date: string;
      category?: string;
      priority?: string;
      location?: string;
    }) => {
      const res = await fetch("/api/routines/day-plan/ad-hoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to create item");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useUpdateAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
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
    }) => {
      const res = await fetch(`/api/routines/day-plan/ad-hoc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useDeleteAdhocItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const res = await fetch(`/api/routines/day-plan/ad-hoc/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      date,
      status,
    }: {
      id: string;
      date: string;
      status: "pending" | "in_progress" | "completed" | "skipped";
    }) => {
      const res = await fetch(`/api/routines/day-plan/items/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["day-plan", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["day-metrics", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}
