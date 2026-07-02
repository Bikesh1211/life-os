"use client";

import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch("/api/routines/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      return res.json();
    },
    staleTime: 300_000,
  });
}

export function useCloneTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch("/api/routines/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error("Failed to clone template");
      return res.json();
    },
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
