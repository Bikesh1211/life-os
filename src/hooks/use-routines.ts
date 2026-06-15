"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type RoutineItem = {
  id: string;
  routineId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  order: number;
  isOptional: boolean;
  linkedHabitId: string | null;
  linkedTaskId: string | null;
};

export type Routine = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  scheduleType: "daily" | "weekdays" | "weekends" | "custom";
  customDays: string[] | null;
  items: RoutineItem[];
  createdAt: string;
  updatedAt: string;
};

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: async () => {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error("Failed to load routines");
      return res.json();
    },
  });
}

export function useRoutine(id: string) {
  return useQuery<Routine>({
    queryKey: ["routine", id],
    queryFn: async () => {
      const res = await fetch(`/api/routines/${id}`);
      if (!res.ok) throw new Error("Failed to load routine");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      scheduleType?: string;
      customDays?: string[];
      items?: Array<{
        title: string;
        startTime: string;
        endTime?: string;
        order: number;
        isOptional?: boolean;
      }>;
    }) => {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to create routine");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      isActive?: boolean;
      scheduleType?: string;
      customDays?: string[];
    }) => {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update routine");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete routine");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useDuplicateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/routines/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate routine");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useToggleRoutineActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle routine");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}
