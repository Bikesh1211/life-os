"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ExecutionItem = {
  id: string;
  executionId: string;
  routineItemId: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped";
  routineItem: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    order: number;
    isOptional: boolean;
    linkedHabitId: string | null;
    linkedTaskId: string | null;
  } | null;
};

export type TodayRoutine = {
  routine: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    isActive: boolean;
    scheduleType: string;
  };
  items: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string | null;
    order: number;
    isOptional: boolean;
  }>;
  execution: {
    id: string;
    routineId: string;
    date: string;
    status: "pending" | "in_progress" | "completed" | "skipped" | "missed";
    completionRate: number;
    actualStart: string | null;
    actualEnd: string | null;
  };
  executionItems: ExecutionItem[];
};

export function useTodayRoutine() {
  return useQuery<TodayRoutine[]>({
    queryKey: ["today-routines"],
    queryFn: async () => {
      const res = await fetch("/api/routines/today");
      if (!res.ok) throw new Error("Failed to load today's routines");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useStartExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routineId,
      executionId,
    }: {
      routineId: string;
      executionId: string;
    }) => {
      const res = await fetch(`/api/routines/${routineId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId }),
      });
      if (!res.ok) throw new Error("Failed to start routine");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useStartExecutionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routineId,
      executionId,
      executionItemId,
    }: {
      routineId: string;
      executionId: string;
      executionItemId: string;
    }) => {
      const res = await fetch(`/api/routines/${routineId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId, executionItemId }),
      });
      if (!res.ok) throw new Error("Failed to start item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useCompleteExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routineId,
      executionId,
    }: {
      routineId: string;
      executionId: string;
    }) => {
      const res = await fetch(`/api/routines/${routineId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId }),
      });
      if (!res.ok) throw new Error("Failed to complete routine");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useSkipExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routineId,
      executionId,
    }: {
      routineId: string;
      executionId: string;
    }) => {
      const res = await fetch(`/api/routines/${routineId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId, action: "skip" }),
      });
      if (!res.ok) throw new Error("Failed to skip routine");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}
