"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/http";

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
    queryFn: () => apiFetch<Routine[]>("/api/routines"),
  });
}

export function useRoutine(id: string) {
  return useQuery<Routine>({
    queryKey: ["routine", id],
    queryFn: () => apiFetch<Routine>(`/api/routines/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
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
    }) =>
      apiFetch("/api/routines", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
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
    }) =>
      apiFetch(`/api/routines/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
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
    mutationFn: (id: string) =>
      apiFetch(`/api/routines/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}

export function useDuplicateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/routines/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useToggleRoutineActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/api/routines/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
  });
}
