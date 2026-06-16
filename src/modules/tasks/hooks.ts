import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "./repository";

const TASKS_KEY = "tasks" as const;
const PROJECTS_KEY = "task-projects" as const;
const LABELS_KEY = "task-labels" as const;

// ── API helpers ──

async function fetchTasks(filters?: Record<string, unknown>): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
    }
  }
  const res = await fetch(`/api/tasks?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function fetchTask(id: string): Promise<Task & { subtasks: Task[] }> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

async function createTask(data: Record<string, unknown>) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

async function updateTask({ id, ...data }: { id: string } & Record<string, unknown>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

async function deleteTask(id: string) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}

// ── Task Queries ──

export function useTasks(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [TASKS_KEY, filters ?? {}],
    queryFn: () => fetchTasks(filters),
    staleTime: 15_000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

// ── Task Mutations ──

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_KEY] });
      const previousQueries = queryClient.getQueriesData<Task[]>({ queryKey: [TASKS_KEY] });
      queryClient.setQueriesData<Task[]>({ queryKey: [TASKS_KEY] }, (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...data } : task)),
      );
      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

// ── Project Queries ──

export function useProjects() {
  return useQuery({
    queryKey: [PROJECTS_KEY],
    queryFn: async () => {
      const res = await fetch("/api/tasks/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/tasks/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/tasks/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}
