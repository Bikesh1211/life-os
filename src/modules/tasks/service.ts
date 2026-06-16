import { cache } from "react";
import { z } from "zod";
import {
  createTask,
  getTaskById,
  getTasksForUser,
  updateTask,
  softDeleteTask,
  restoreTask,
  getTaskCounts,
  getSubtasks as getSubtasksRepo,
  createProject,
  getProjectsForUser,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  createLabel,
  getLabelsForUser,
  updateLabel,
  deleteLabel,
  setTaskLabels,
  getTaskLabels as getTaskLabelsForTask,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskFilters,
  type CreateProjectInput,
  type CreateLabelInput,
} from "./repository";

const priorities = ["p1", "p2", "p3", "p4", "p5"] as const;
const statuses = ["todo", "in_progress", "done", "cancelled"] as const;
const recurrences = ["none", "daily", "weekdays", "weekly", "monthly", "yearly"] as const;
const projectColors = ["blue", "green", "red", "yellow", "purple", "pink", "orange", "cyan", "teal", "grape"] as const;
const labelColors = ["blue", "green", "red", "yellow", "purple", "pink", "orange", "cyan", "teal", "grape", "lime", "indigo"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional().nullable(),
  descriptionJson: z.any().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().int().min(0).optional().nullable(),
  actualMinutes: z.number().int().min(0).optional().nullable(),
  recurrence: z.enum(recurrences).optional(),
  recurrenceEndDate: z.string().datetime().optional().nullable(),
  order: z.number().int().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().optional().nullable(),
});

export const taskFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.enum(priorities).optional(),
  projectId: z.string().uuid().optional(),
  noProject: z.coerce.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
  sortBy: z.enum(["createdAt", "dueDate", "priority", "title", "order"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  color: z.enum(projectColors).optional(),
  description: z.string().max(2000).optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.enum(labelColors).optional(),
});

export const updateLabelSchema = createLabelSchema.partial();

export const setTaskLabelsSchema = z.object({
  labelIds: z.array(z.string().uuid()),
});

export type CreateTaskParams = z.infer<typeof createTaskSchema>;
export type UpdateTaskParams = z.infer<typeof updateTaskSchema>;
export type TaskFiltersParams = z.infer<typeof taskFiltersSchema>;
export type CreateProjectParams = z.infer<typeof createProjectSchema>;

// ── Tasks ──

export async function createTaskEntry(userId: string, params: CreateTaskParams) {
  const validated = createTaskSchema.parse(params);
  const input: CreateTaskInput = {
    userId,
    title: validated.title,
    description: validated.description ?? null,
    descriptionJson: validated.descriptionJson ?? null,
    projectId: validated.projectId ?? null,
    parentId: validated.parentId ?? null,
    status: validated.status,
    priority: validated.priority,
    dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
    startDate: validated.startDate ? new Date(validated.startDate) : null,
    estimatedMinutes: validated.estimatedMinutes ?? null,
    actualMinutes: validated.actualMinutes ?? null,
    recurrence: validated.recurrence,
    recurrenceEndDate: validated.recurrenceEndDate ? new Date(validated.recurrenceEndDate) : null,
    order: validated.order,
  };

  const task = await createTask(input);

  if (validated.labelIds && validated.labelIds.length > 0) {
    await setTaskLabels(task.id, validated.labelIds);
  }

  if (validated.labelIds) {
    return { ...task, labels: await getTaskLabelsForTask(task.id) };
  }

  return task;
}

export const getTask = cache(async (id: string, userId: string) => {
  const task = await getTaskById(id, userId);
  if (!task) return null;
  const [labels, subtasks] = await Promise.all([
    getTaskLabelsForTask(id),
    getSubtasksRepo(id, userId),
  ]);
  return { ...task, labels, subtasks };
});

export const getTasks = cache(async (userId: string, filters: Partial<TaskFiltersParams> = {}) => {
  const validated = taskFiltersSchema.parse(filters);
  const dbFilters: TaskFilters = {
    status: validated.status,
    priority: validated.priority,
    projectId: validated.projectId,
    noProject: validated.noProject,
    parentId: validated.parentId,
    dueDateFrom: validated.dueDateFrom ? new Date(validated.dueDateFrom) : undefined,
    dueDateTo: validated.dueDateTo ? new Date(validated.dueDateTo) : undefined,
    search: validated.search,
    labelIds: validated.labelIds,
    sortBy: validated.sortBy,
    sortOrder: validated.sortOrder,
    limit: validated.limit,
    offset: validated.offset,
  };

  const entries = await getTasksForUser(userId, dbFilters);

  const tasksWithLabels = await Promise.all(
    entries.map(async (task) => ({
      ...task,
      labels: await getTaskLabelsForTask(task.id),
    })),
  );

  return tasksWithLabels;
});

export async function updateTaskEntry(id: string, userId: string, params: UpdateTaskParams) {
  const validated = updateTaskSchema.parse(params);
  const updateData: UpdateTaskInput = {};

  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.descriptionJson !== undefined) updateData.descriptionJson = validated.descriptionJson;
  if (validated.projectId !== undefined) updateData.projectId = validated.projectId;
  if (validated.parentId !== undefined) updateData.parentId = validated.parentId;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.priority !== undefined) updateData.priority = validated.priority;
  if (validated.dueDate !== undefined) updateData.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
  if (validated.startDate !== undefined) updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
  if (validated.estimatedMinutes !== undefined) updateData.estimatedMinutes = validated.estimatedMinutes;
  if (validated.actualMinutes !== undefined) updateData.actualMinutes = validated.actualMinutes;
  if (validated.recurrence !== undefined) updateData.recurrence = validated.recurrence;
  if (validated.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = validated.recurrenceEndDate ? new Date(validated.recurrenceEndDate) : null;
  if (validated.order !== undefined) updateData.order = validated.order;
  if (validated.completedAt !== undefined) updateData.completedAt = validated.completedAt ? new Date(validated.completedAt) : null;

  const task = await updateTask(id, userId, updateData);

  if (validated.labelIds !== undefined) {
    await setTaskLabels(id, validated.labelIds ?? []);
  }

  if (!task) return null;
  return { ...task, labels: await getTaskLabelsForTask(task.id) };
}

export async function deleteTaskEntry(id: string, userId: string) {
  return softDeleteTask(id, userId);
}

export async function restoreTaskEntry(id: string, userId: string) {
  return restoreTask(id, userId);
}

export async function getTaskStats(userId: string) {
  const [counts] = await Promise.all([getTaskCounts(userId)]);
  return counts;
}

export async function getSubtasks(parentId: string, userId: string) {
  return getSubtasksRepo(parentId, userId);
}

// ── Projects ──

export async function createTaskProject(userId: string, params: CreateProjectParams) {
  const validated = createProjectSchema.parse(params);
  return createProject({ userId, ...validated });
}

export const getTaskProjects = cache(async (userId: string) => {
  return getProjectStats(userId);
});

export const getTaskProject = cache(async (id: string, userId: string) => {
  return getProjectById(id, userId);
});

export async function updateTaskProject(id: string, userId: string, params: z.infer<typeof updateProjectSchema>) {
  const validated = updateProjectSchema.parse(params);
  return updateProject(id, userId, validated);
}

export async function deleteTaskProject(id: string, userId: string) {
  return deleteProject(id, userId);
}

// ── Labels ──

export async function createTaskLabel(userId: string, params: z.infer<typeof createLabelSchema>) {
  const validated = createLabelSchema.parse(params);
  return createLabel({ userId, ...validated });
}

export const getUserTaskLabels = cache(async (userId: string) => {
  return getLabelsForUser(userId);
});

export async function updateTaskLabel(id: string, userId: string, params: z.infer<typeof updateLabelSchema>) {
  const validated = updateLabelSchema.parse(params);
  return updateLabel(id, userId, validated);
}

export async function deleteTaskLabel(id: string, userId: string) {
  return deleteLabel(id, userId);
}
