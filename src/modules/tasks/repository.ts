import { db } from "@/core/database";
import { tasks, taskProjects, taskLabels, taskTasksLabels, taskStatusEnum, taskRecurrenceEnum } from "./schema";
import {
  eq,
  and,
  isNull,
  desc,
  asc,
  sql,
  or,
  gte,
  lte,
  inArray,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";

// ── Types ──

type TaskStatus = typeof taskStatusEnum.enumValues[number];
type TaskRecurrence = typeof taskRecurrenceEnum.enumValues[number];

export type Task = typeof tasks.$inferSelect;
export type TaskProject = typeof taskProjects.$inferSelect;
export type TaskLabel = typeof taskLabels.$inferSelect;

export type CreateTaskInput = {
  userId: string;
  projectId?: string | null;
  parentId?: string | null;
  title: string;
  description?: string | null;
  descriptionJson?: unknown;
  status?: TaskStatus;
  priority?: string;
  dueDate?: Date | null;
  startDate?: Date | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  recurrence?: TaskRecurrence;
  recurrenceEndDate?: Date | null;
  order?: number;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "userId">> & {
  completedAt?: Date | null;
};

export type CreateProjectInput = {
  userId: string;
  title: string;
  color?: string;
  description?: string | null;
};

export type CreateLabelInput = {
  userId: string;
  name: string;
  color?: string;
};

export type TaskFilters = {
  status?: string;
  priority?: string;
  projectId?: string;
  noProject?: boolean;
  parentId?: string | null;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
  labelIds?: string[];
  sortBy?: "createdAt" | "dueDate" | "priority" | "title" | "order";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

// ── Column helpers ──

export const taskColumns = {
  id: tasks.id,
  userId: tasks.userId,
  projectId: tasks.projectId,
  parentId: tasks.parentId,
  title: tasks.title,
  description: tasks.description,
  descriptionJson: tasks.descriptionJson,
  status: tasks.status,
  priority: tasks.priority,
  dueDate: tasks.dueDate,
  startDate: tasks.startDate,
  estimatedMinutes: tasks.estimatedMinutes,
  actualMinutes: tasks.actualMinutes,
  recurrence: tasks.recurrence,
  recurrenceEndDate: tasks.recurrenceEndDate,
  order: tasks.order,
  completedAt: tasks.completedAt,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
  deletedAt: tasks.deletedAt,
};

// ── Tasks ──

export async function createTask(input: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({
      userId: input.userId,
      projectId: input.projectId ?? null,
      parentId: input.parentId ?? null,
      title: input.title,
      description: input.description ?? null,
      descriptionJson: input.descriptionJson ?? null,
      status: input.status ?? "todo",
      priority: input.priority ?? "p3",
      dueDate: input.dueDate ?? null,
      startDate: input.startDate ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      actualMinutes: input.actualMinutes ?? null,
      recurrence: input.recurrence ?? "none",
      recurrenceEndDate: input.recurrenceEndDate ?? null,
      order: input.order ?? 0,
    })
    .returning(taskColumns);
  return task;
}

export async function getTaskById(id: string, userId: string) {
  const [task] = await db
    .select(taskColumns)
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId), isNull(tasks.deletedAt)))
    .limit(1);
  return task ?? null;
}

export async function getTasksForUser(userId: string, filters: TaskFilters = {}) {
  const conditions: (SQL | undefined)[] = [
    eq(tasks.userId, userId),
    isNull(tasks.deletedAt),
  ];

  if (filters.parentId === null) {
    conditions.push(isNull(tasks.parentId));
  } else if (filters.parentId) {
    conditions.push(eq(tasks.parentId, filters.parentId));
  }

  if (filters.status) {
    if (filters.status === "active") {
      conditions.push(inArray(tasks.status, ["todo", "in_progress"]));
    } else {
      conditions.push(eq(tasks.status, filters.status as any));
    }
  }

  if (filters.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  if (filters.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }

  if (filters.noProject) {
    conditions.push(isNull(tasks.projectId));
  }

  if (filters.dueDateFrom) {
    conditions.push(gte(tasks.dueDate, filters.dueDateFrom));
  }

  if (filters.dueDateTo) {
    conditions.push(lte(tasks.dueDate, filters.dueDateTo));
  }

  if (filters.search) {
    conditions.push(
      sql`(to_tsvector('english', ${tasks.title}) @@ plainto_tsquery('english', ${filters.search}))`,
    );
  }

  if (filters.labelIds && filters.labelIds.length > 0) {
    const taskIds = await db
      .select({ taskId: taskTasksLabels.taskId })
      .from(taskTasksLabels)
      .where(inArray(taskTasksLabels.labelId, filters.labelIds));
    const ids = [...new Set(taskIds.map((r) => r.taskId))];
    conditions.push(inArray(tasks.id, ids));
  }

  const orderByMap = {
    createdAt: tasks.createdAt,
    dueDate: tasks.dueDate,
    priority: sql`CASE ${tasks.priority}
      WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 WHEN 'p3' THEN 3
      WHEN 'p4' THEN 4 WHEN 'p5' THEN 5 ELSE 6 END`,
    title: tasks.title,
    order: tasks.order,
  };

  const orderColumn = orderByMap[filters.sortBy ?? "createdAt"];
  const orderDirection = filters.sortOrder === "asc" ? asc : desc;

  return db
    .select(taskColumns)
    .from(tasks)
    .where(and(...conditions))
    .orderBy(orderDirection(orderColumn))
    .limit(filters.limit ?? 100)
    .offset(filters.offset ?? 0);
}

export async function updateTask(id: string, userId: string, input: UpdateTaskInput) {
  const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (input.status === "done" && !input.completedAt) {
    updateData.completedAt = new Date();
  }
  if (input.status && input.status !== "done" && input.status !== "cancelled") {
    updateData.completedAt = null;
  }

  const [task] = await db
    .update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning(taskColumns);
  return task ?? null;
}

export async function softDeleteTask(id: string, userId: string) {
  const [task] = await db
    .update(tasks)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId), isNull(tasks.deletedAt)))
    .returning(taskColumns);
  return task ?? null;
}

export async function restoreTask(id: string, userId: string) {
  const [task] = await db
    .update(tasks)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning(taskColumns);
  return task ?? null;
}

export async function getTaskCounts(userId: string) {
  const base = and(eq(tasks.userId, userId), isNull(tasks.deletedAt));
  const [result] = await db
    .select({
      total: sql<number>`count(*)`,
      todo: sql<number>`count(*) filter (where ${tasks.status} = 'todo')`,
      inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')`,
      done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
      cancelled: sql<number>`count(*) filter (where ${tasks.status} = 'cancelled')`,
      overdue: sql<number>`count(*) filter (where ${tasks.status} != 'done' and ${tasks.status} != 'cancelled' and ${tasks.dueDate} < now())`,
      noProject: sql<number>`count(*) filter (where ${tasks.projectId} is null)`,
    })
    .from(tasks)
    .where(base);
  return result!;
}

export async function getSubtasks(parentId: string, userId: string) {
  return db
    .select(taskColumns)
    .from(tasks)
    .where(
      and(
        eq(tasks.parentId, parentId),
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
      ),
    )
    .orderBy(asc(tasks.order), asc(tasks.createdAt));
}

// ── Projects ──

export async function createProject(input: CreateProjectInput) {
  const [project] = await db
    .insert(taskProjects)
    .values({
      userId: input.userId,
      title: input.title,
      color: input.color ?? "blue",
      description: input.description ?? null,
    })
    .returning();
  return project;
}

export async function getProjectsForUser(userId: string) {
  return db
    .select()
    .from(taskProjects)
    .where(and(eq(taskProjects.userId, userId), isNull(taskProjects.deletedAt)))
    .orderBy(asc(taskProjects.title));
}

export async function getProjectById(id: string, userId: string) {
  const [project] = await db
    .select()
    .from(taskProjects)
    .where(
      and(eq(taskProjects.id, id), eq(taskProjects.userId, userId), isNull(taskProjects.deletedAt)),
    )
    .limit(1);
  return project ?? null;
}

export async function updateProject(
  id: string,
  userId: string,
  input: Partial<CreateProjectInput>,
) {
  const [project] = await db
    .update(taskProjects)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(taskProjects.id, id), eq(taskProjects.userId, userId)))
    .returning();
  return project ?? null;
}

export async function deleteProject(id: string, userId: string) {
  await db
    .update(tasks)
    .set({ projectId: null })
    .where(and(eq(tasks.projectId, id), eq(tasks.userId, userId)));

  const [project] = await db
    .update(taskProjects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(taskProjects.id, id), eq(taskProjects.userId, userId)))
    .returning();
  return project ?? null;
}

export async function getProjectStats(userId: string) {
  const projects = await getProjectsForUser(userId);
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return [];

  const stats = await db
    .select({
      projectId: tasks.projectId,
      total: sql<number>`count(*)`,
      doneCount: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
    })
    .from(tasks)
    .where(
      and(
        isNull(tasks.deletedAt),
        isNull(tasks.parentId),
        inArray(tasks.projectId, projectIds),
      ),
    )
    .groupBy(tasks.projectId);

  const statsMap = new Map(stats.map((s) => [s.projectId, s]));

  return projects.map((p) => ({
    ...p,
    taskCount: statsMap.get(p.id)?.total ?? 0,
    doneCount: statsMap.get(p.id)?.doneCount ?? 0,
  }));
}

// ── Labels ──

export async function createLabel(input: CreateLabelInput) {
  const [label] = await db
    .insert(taskLabels)
    .values({
      userId: input.userId,
      name: input.name,
      color: input.color ?? "blue",
    })
    .onConflictDoNothing()
    .returning();
  return label ?? null;
}

export async function getLabelsForUser(userId: string) {
  return db
    .select()
    .from(taskLabels)
    .where(eq(taskLabels.userId, userId))
    .orderBy(asc(taskLabels.name));
}

export async function updateLabel(id: string, userId: string, input: { name?: string; color?: string }) {
  const [label] = await db
    .update(taskLabels)
    .set(input)
    .where(and(eq(taskLabels.id, id), eq(taskLabels.userId, userId)))
    .returning();
  return label ?? null;
}

export async function deleteLabel(id: string, userId: string) {
  await db
    .delete(taskTasksLabels)
    .where(eq(taskTasksLabels.labelId, id));

  const [label] = await db
    .delete(taskLabels)
    .where(and(eq(taskLabels.id, id), eq(taskLabels.userId, userId)))
    .returning();
  return label ?? null;
}

export async function setTaskLabels(taskId: string, labelIds: string[]) {
  await db.delete(taskTasksLabels).where(eq(taskTasksLabels.taskId, taskId));
  if (labelIds.length > 0) {
    await db.insert(taskTasksLabels).values(
      labelIds.map((labelId) => ({ taskId, labelId })),
    );
  }
}

export async function getTaskLabels(taskId: string) {
  return db
    .select({
      id: taskLabels.id,
      name: taskLabels.name,
      color: taskLabels.color,
    })
    .from(taskTasksLabels)
    .innerJoin(taskLabels, eq(taskTasksLabels.labelId, taskLabels.id))
    .where(eq(taskTasksLabels.taskId, taskId));
}

export async function getTaskLabelsBatch(taskIds: string[]) {
  if (taskIds.length === 0) return [];
  const rows = await db
    .select({
      taskId: taskTasksLabels.taskId,
      id: taskLabels.id,
      name: taskLabels.name,
      color: taskLabels.color,
    })
    .from(taskTasksLabels)
    .innerJoin(taskLabels, eq(taskTasksLabels.labelId, taskLabels.id))
    .where(inArray(taskTasksLabels.taskId, taskIds));
  return rows;
}
