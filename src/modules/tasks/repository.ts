import { db } from "@/core/database";
import { tasks, taskProjects, type taskStatusEnum, type taskPriorityEnum } from "./schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export type CreateTaskInput = {
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  status?: typeof taskStatusEnum.enumValues[number];
  priority?: typeof taskPriorityEnum.enumValues[number];
  dueDate?: Date;
};

export type Task = typeof tasks.$inferSelect;

export async function createTask(input: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({
      userId: input.userId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      dueDate: input.dueDate,
    })
    .returning();
  return task;
}

export async function getTasks(userId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: string, userId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId), isNull(tasks.deletedAt)));
  return task ?? null;
}

export async function updateTask(
  id: string,
  userId: string,
  input: Partial<CreateTaskInput>,
) {
  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();
  return task;
}

export async function deleteTask(id: string, userId: string) {
  const [task] = await db
    .update(tasks)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();
  return task;
}

export async function getTaskCountByStatus(userId: string) {
  const allTasks = await getTasks(userId);
  return {
    total: allTasks.length,
    todo: allTasks.filter((t) => t.status === "todo").length,
    inProgress: allTasks.filter((t) => t.status === "in_progress").length,
    done: allTasks.filter((t) => t.status === "done").length,
  };
}
