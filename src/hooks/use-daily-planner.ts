"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

export type DailyPlannerData = {
  goal: {
    id: string;
    userId: string;
    date: string;
    title: string;
    isCompleted: boolean;
    taskId: string | null;
  } | null;
  priorities: {
    id: string;
    title: string;
    estimatedDuration: number | null;
    status: string;
    sortOrder: number;
    taskId: string | null;
  }[];
  snapshot: {
    id: string;
    productivityScore: number;
    subScores: Record<string, number>;
    tasksCompleted: number;
    tasksTotal: number;
    focusMinutes: number;
    habitsCompleted: number;
    habitsTotal: number;
    dailyGoalCompleted: boolean;
  } | null;
  note: {
    id: string;
    content: string | null;
  } | null;
  dayPlan: {
    items: any[];
    metrics: {
      totalItems: number;
      completedItems: number;
      plannedHours: number;
      completionRate: number;
      totalPlannedMinutes: number;
    } | null;
  };
};

export function useDailyPlanner(date: string) {
  return useQuery<DailyPlannerData>({
    queryKey: ["daily-planner", date],
    queryFn: () =>
      apiFetch<DailyPlannerData>(`/api/routines/daily-planner${toSearchParams({ date })}`),
    enabled: !!date,
  });
}

export function useDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string; title: string; isCompleted?: boolean; taskId?: string | null }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "setGoal", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useToggleDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; date: string; isCompleted: boolean }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "toggleGoal", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useDailyPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string; title: string; estimatedDuration?: number | null; taskId?: string | null }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "addPriority", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useUpdatePriorityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; date: string; status: string }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "updatePriority", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useRemovePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; date: string }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "removePriority", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useDailyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string; content: string }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "saveNote", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useComputeScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string }) =>
      apiFetch("/api/routines/daily-planner", {
        method: "POST",
        body: JSON.stringify({ action: "computeScore", ...data }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}
