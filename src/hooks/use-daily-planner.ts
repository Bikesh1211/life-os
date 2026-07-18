"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch(`/api/routines/daily-planner?date=${date}`);
      if (!res.ok) throw new Error("Failed to load daily planner");
      return res.json();
    },
    enabled: !!date,
  });
}

export function useDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; title: string; isCompleted?: boolean; taskId?: string | null }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setGoal", ...data }),
      });
      if (!res.ok) throw new Error("Failed to set daily goal");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useToggleDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; date: string; isCompleted: boolean }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleGoal", ...data }),
      });
      if (!res.ok) throw new Error("Failed to toggle daily goal");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useDailyPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; title: string; estimatedDuration?: number | null; taskId?: string | null }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addPriority", ...data }),
      });
      if (!res.ok) throw new Error("Failed to add priority");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useUpdatePriorityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; date: string; status: string }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updatePriority", ...data }),
      });
      if (!res.ok) throw new Error("Failed to update priority");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useRemovePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; date: string }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removePriority", ...data }),
      });
      if (!res.ok) throw new Error("Failed to remove priority");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useDailyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; content: string }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveNote", ...data }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}

export function useComputeScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string }) => {
      const res = await fetch("/api/routines/daily-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "computeScore", ...data }),
      });
      if (!res.ok) throw new Error("Failed to compute score");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-planner", variables.date] });
    },
  });
}
