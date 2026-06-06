import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskCountByStatus,
  type CreateTaskInput,
} from "./repository";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateTaskParams = z.infer<typeof createTaskSchema>;

export async function createTaskForUser(userId: string, params: CreateTaskParams) {
  const validated = createTaskSchema.parse(params);
  return createTask({
    userId,
    title: validated.title,
    description: validated.description,
    priority: validated.priority,
    dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
  });
}

export async function getTasksForUser(userId: string) {
  return getTasks(userId);
}

export async function getTaskForUser(id: string, userId: string) {
  return getTaskById(id, userId);
}

export async function updateTaskForUser(
  id: string,
  userId: string,
  params: Partial<CreateTaskParams>,
) {
  return updateTask(id, userId, {
    ...params,
    dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
  });
}

export async function deleteTaskForUser(id: string, userId: string) {
  return deleteTask(id, userId);
}

export async function getTaskSummary(userId: string) {
  return getTaskCountByStatus(userId);
}
