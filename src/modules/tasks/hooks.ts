import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import type { Task } from "./repository";
import { apiFetch, toSearchParams } from "@/core/api/http";
import { cacheKeys } from "@/infrastructure/cache/keys";
import { STALE_TIME } from "@/infrastructure/cache/policy";
import type { TaskProject, TaskLabel } from "./repository";

// ── API helpers ──

type QueryValue = string | number | boolean | string[] | null | undefined;

async function fetchTasks(filters?: Record<string, unknown>): Promise<Task[]> {
  const params = (filters ?? {}) as Record<string, QueryValue>;
  return apiFetch<Task[]>(`/api/tasks${toSearchParams(params)}`);
}

async function fetchTask(id: string): Promise<Task & { subtasks: Task[] }> {
  return apiFetch(`/api/tasks/${id}`);
}

function createTask(data: Record<string, unknown>) {
  return apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(data) });
}

function updateTask({ id, ...data }: { id: string } & Record<string, unknown>) {
  return apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

function deleteTask(id: string) {
  return apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
}

// ── Task Queries ──

export function useTasks(filters?: Record<string, unknown>, initialData?: Task[]) {
  return useQuery({
    queryKey: cacheKeys.tasks.list(filters ?? {}),
    queryFn: () => fetchTasks(filters),
    staleTime: STALE_TIME.list,
    placeholderData: initialData,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: cacheKeys.tasks.detail(id),
    queryFn: () => fetchTask(id),
    enabled: !!id,
    staleTime: STALE_TIME.detail,
  });
}

// ── Task Mutations ──

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Task created", color: "green" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.all });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to create task", color: "red" });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: cacheKeys.tasks.all });
      const previousQueries = queryClient.getQueriesData<Task[]>({ queryKey: cacheKeys.tasks.all });
      queryClient.setQueriesData<Task[]>({ queryKey: cacheKeys.tasks.all }, (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...data } : task)),
      );
      return { previousQueries };
    },
    onSuccess: () => {
      notifications.show({ title: "Updated", message: "Task updated", color: "green" });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      notifications.show({ title: "Error", message: "Failed to update task", color: "red" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Task deleted", color: "red" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.all });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete task", color: "red" });
    },
  });
}

// ── Project Queries ──

export function useProjects() {
  return useQuery({
    queryKey: cacheKeys.tasks.projects,
    queryFn: () => apiFetch<TaskProject[]>("/api/tasks/projects"),
    staleTime: STALE_TIME.reference,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [...cacheKeys.tasks.projects, id],
    queryFn: () => apiFetch<TaskProject>(`/api/tasks/projects/${id}`),
    enabled: !!id,
    staleTime: STALE_TIME.detail,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/api/tasks/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Project created", color: "green" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.projects });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to create project", color: "red" });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiFetch(`/api/tasks/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      notifications.show({ title: "Updated", message: "Project updated", color: "green" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.projects });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to update project", color: "red" });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/tasks/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Project deleted", color: "red" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.projects });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.all });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete project", color: "red" });
    },
  });
}

// ── Label Queries ──

export function useLabels() {
  return useQuery({
    queryKey: cacheKeys.tasks.labels,
    queryFn: () => apiFetch<TaskLabel[]>("/api/tasks/labels"),
    staleTime: STALE_TIME.reference,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/api/tasks/labels", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Label created", color: "green" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.labels });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to create label", color: "red" });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiFetch(`/api/tasks/labels/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      notifications.show({ title: "Updated", message: "Label updated", color: "green" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.labels });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to update label", color: "red" });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/tasks/labels/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Label deleted", color: "red" });
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.labels });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete label", color: "red" });
    },
  });
}

export function useSetTaskLabels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, labelIds }: { taskId: string; labelIds: string[] }) =>
      apiFetch(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ labelIds }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.tasks.all });
    },
  });
}