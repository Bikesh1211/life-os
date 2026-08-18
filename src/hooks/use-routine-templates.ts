"use client";

import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/http";

export type RoutineTemplateItem = {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  order: number;
  isOptional: boolean;
};

export type RoutineTemplate = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  scheduleType: string;
  customDays: string[] | null;
  items: RoutineTemplateItem[];
};

export function useRoutineTemplates() {
  return useQuery<RoutineTemplate[]>({
    queryKey: ["routine-templates"],
    queryFn: () => apiFetch<RoutineTemplate[]>("/api/routines/templates"),
    staleTime: 300_000,
  });
}

export function useCloneTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiFetch("/api/routines/templates", {
        method: "POST",
        body: JSON.stringify({ templateId }),
      }),
    onSuccess: () => {
      notifications.show({ title: "Cloned", message: "Template cloned as routine", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to clone template", color: "red" });
    },
  });
}
