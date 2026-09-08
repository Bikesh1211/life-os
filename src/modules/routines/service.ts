import { cache } from "react";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import * as repo from "./repository";
import { SYSTEM_TEMPLATES, WEEKDAYS, WEEKENDS } from "./constants";

dayjs.extend(utc);

// ── Validation Schemas ──

export const createRoutineSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  scheduleType: z.enum(["daily", "weekdays", "weekends", "custom"]).default("daily").catch("daily"),
  customDays: z.array(z.string()).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Item title is required").max(200),
        description: z.string().max(2000).optional(),
        startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format (HH:mm)"),
        endTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
        order: z.number().int().min(0),
        isOptional: z.boolean().default(false),
        linkedHabitId: z.string().optional(),
        linkedTaskId: z.string().optional(),
      }),
    )
    .optional(),
});

export const updateRoutineSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  scheduleType: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
  customDays: z.array(z.string()).optional(),
});

export const categoryEnum = z.enum([
  "personal", "career", "education", "health", "finance",
  "travel", "relationships", "business", "entertainment", "custom",
]);

export const priorityEnum = z.enum(["low", "medium", "high"]);

export const itemStatusEnum = z.enum(["pending", "in_progress", "completed", "skipped"]);

export const createRoutineItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  order: z.number().int().min(0),
  isOptional: z.boolean().default(false),
  category: categoryEnum.optional(),
  priority: priorityEnum.optional(),
  location: z.string().max(200).optional(),
  linkedHabitId: z.string().optional(),
  linkedTaskId: z.string().optional(),
});

export const updateRoutineItemSchema = createRoutineItemSchema.partial();

export const createAdhocItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  category: categoryEnum.optional(),
  priority: priorityEnum.optional(),
  location: z.string().max(200).optional(),
});

export const updateAdhocItemSchema = createAdhocItemSchema.partial();

export const updateItemStatusSchema = z.object({
  status: itemStatusEnum,
});

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    }),
  ),
});

export const analyticsFilterSchema = z.object({
  dateFrom: z.string().nullish(),
  dateTo: z.string().nullish(),
});

export type CreateRoutineParams = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineParams = z.infer<typeof updateRoutineSchema>;
export type CreateRoutineItemParams = z.infer<typeof createRoutineItemSchema>;
export type CreateAdhocItemParams = z.infer<typeof createAdhocItemSchema>;
export type UpdateAdhocItemParams = z.infer<typeof updateAdhocItemSchema>;
export type AnalyticsFilterParams = z.infer<typeof analyticsFilterSchema>;

// ── Helpers ──

function getDateRange(params: AnalyticsFilterParams) {
  if (params.dateFrom && params.dateTo) {
    return { dateFrom: params.dateFrom, dateTo: params.dateTo };
  }
  const end = dayjs();
  const start = end.subtract(30, "day");
  return { dateFrom: start.format("YYYY-MM-DD"), dateTo: end.format("YYYY-MM-DD") };
}

function isScheduledToday(routine: {
  scheduleType: string;
  customDays: string[] | null;
}): boolean {
  const dayName = dayjs().format("ddd").toLowerCase().slice(0, 3);

  if (routine.scheduleType === "daily") return true;
  if (routine.scheduleType === "weekdays") return WEEKDAYS.includes(dayName as typeof WEEKDAYS[number]);
  if (routine.scheduleType === "weekends") return WEEKENDS.includes(dayName as typeof WEEKENDS[number]);
  if (routine.scheduleType === "custom") {
    return routine.customDays?.map((d: string) => d.toLowerCase().slice(0, 3)).includes(dayName) ?? false;
  }
  return false;
}

function isScheduledForDate(
  routine: { scheduleType: string; customDays: string[] | null },
  date: string,
): boolean {
  const dayName = dayjs(date).format("ddd").toLowerCase().slice(0, 3);

  if (routine.scheduleType === "daily") return true;
  if (routine.scheduleType === "weekdays") return WEEKDAYS.includes(dayName as typeof WEEKDAYS[number]);
  if (routine.scheduleType === "weekends") return WEEKENDS.includes(dayName as typeof WEEKENDS[number]);
  if (routine.scheduleType === "custom") {
    return routine.customDays?.map((d: string) => d.toLowerCase().slice(0, 3)).includes(dayName) ?? false;
  }
  return false;
}

// ── Routine CRUD ──

export async function getRoutines(userId: string) {
  const routineList = await repo.getRoutines(userId);
  const routinesWithItems = await Promise.all(
    routineList.map(async (routine: any) => ({
      ...routine,
      items: await repo.getRoutineItems(routine.id),
    })),
  );
  return routinesWithItems;
}

export async function getRoutine(id: string, userId: string) {
  const routine = await repo.getRoutineById(id, userId);
  if (!routine) return null;
  const items = await repo.getRoutineItems(id);
  return { ...routine, items };
}

export async function createRoutineForUser(userId: string, params: CreateRoutineParams) {
  const validated = createRoutineSchema.parse(params);
  const routine = await repo.createRoutine({
    userId,
    name: validated.name,
    description: validated.description ?? undefined,
    color: validated.color ?? undefined,
    icon: validated.icon ?? undefined,
    isActive: validated.isActive ?? true,
    scheduleType: validated.scheduleType,
    customDays: validated.customDays ?? undefined,
  });

  if (validated.items && validated.items.length > 0) {
    const itemInputs: any[] = validated.items.map((item: any) => ({
      routineId: routine.id,
      title: item.title,
      description: item.description ?? undefined,
      startTime: item.startTime,
      endTime: item.endTime ?? undefined,
      order: item.order,
      isOptional: item.isOptional,
      linkedHabitId: item.linkedHabitId ?? undefined,
      linkedTaskId: item.linkedTaskId ?? undefined,
    }));
    await repo.createRoutineItems(itemInputs);
  }

  return getRoutine(routine.id, userId);
}

export async function updateRoutineForUser(
  id: string,
  userId: string,
  params: UpdateRoutineParams,
) {
  const validated = updateRoutineSchema.parse(params);
  const routine = await repo.updateRoutine(id, userId, {
    ...validated,
    customDays: validated.customDays ?? undefined,
  });
  if (!routine) return null;
  return getRoutine(routine.id, userId);
}

export async function deleteRoutineForUser(id: string, userId: string) {
  return repo.deleteRoutine(id, userId);
}

export async function duplicateRoutine(routineId: string, userId: string) {
  const original = await getRoutine(routineId, userId);
  if (!original) return null;

  const newRoutine = await repo.createRoutine({
    userId,
    name: `${original.name} (Copy)`,
    description: original.description,
    color: original.color,
    icon: original.icon,
    isActive: false,
    scheduleType: original.scheduleType,
    customDays: original.customDays,
  });

  if (original.items.length > 0) {
    const itemInputs: any[] = original.items.map((item: any) => ({
      routineId: newRoutine.id,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      order: item.order,
      isOptional: item.isOptional,
      linkedHabitId: item.linkedHabitId,
      linkedTaskId: item.linkedTaskId,
    }));
    await repo.createRoutineItems(itemInputs);
  }

  return getRoutine(newRoutine.id, userId);
}

export async function toggleRoutineActive(id: string, userId: string) {
  const routine = await repo.getRoutineById(id, userId);
  if (!routine) return null;
  return repo.updateRoutine(id, userId, { isActive: !routine.isActive });
}

// ── Routine Items ──

export async function addRoutineItem(routineId: string, userId: string, params: CreateRoutineItemParams) {
  const routine = await repo.getRoutineById(routineId, userId);
  if (!routine) return null;

  const validated = createRoutineItemSchema.parse(params);
  return repo.createRoutineItem({
    routineId,
    title: validated.title,
    description: validated.description ?? undefined,
    startTime: validated.startTime,
    endTime: validated.endTime ?? undefined,
    order: validated.order,
    isOptional: validated.isOptional,
    linkedHabitId: validated.linkedHabitId ?? undefined,
    linkedTaskId: validated.linkedTaskId ?? undefined,
  });
}

export async function updateRoutineItemForUser(
  itemId: string,
  userId: string,
  params: Partial<CreateRoutineItemParams>,
) {
  const validated = updateRoutineItemSchema.parse(params);
  return repo.updateRoutineItem(itemId, {
    ...validated,
    linkedHabitId: validated.linkedHabitId ?? undefined,
    linkedTaskId: validated.linkedTaskId ?? undefined,
  });
}

export async function deleteRoutineItemForUser(itemId: string, userId: string) {
  return repo.deleteRoutineItem(itemId);
}

export async function reorderRoutineItemsForUser(
  routineId: string,
  userId: string,
  items: Array<{ id: string; order: number }>,
) {
  await repo.reorderRoutineItems(items);
  return getRoutine(routineId, userId);
}

// ── Execution ──

export async function getTodayRoutines(userId: string) {
  const activeRoutines = await repo.getActiveRoutines(userId);
  const today = dayjs().format("YYYY-MM-DD");
  const scheduled = activeRoutines.filter((r: any) => isScheduledToday(r));

  if (scheduled.length === 0) return [];

  const routineIds = scheduled.map((r: any) => r.id);

  const [allItems, existingExecutions] = await Promise.all([
    repo.getRoutineItemsByRoutineIds(routineIds),
    repo.getExecutionsByRoutineIdsAndDate(routineIds, today),
  ]);

  const itemsByRoutineId = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const list = itemsByRoutineId.get(item.routineId!);
    if (list) list.push(item);
    else itemsByRoutineId.set(item.routineId!, [item]);
  }

  const executionByRoutineId = new Map(existingExecutions.map((e: any) => [e.routineId, e]));

  const toCreate = scheduled.filter((r: any) => !executionByRoutineId.has(r.id));
  const createdExecutions: typeof existingExecutions = [];

  for (const routine of toCreate) {
    const items = itemsByRoutineId.get(routine.id) ?? [];
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const execution = await repo.createExecution({
      routineId: routine.id,
      userId,
      date: today,
      plannedStart: firstItem?.startTime ?? undefined,
      plannedEnd: lastItem?.endTime ?? undefined,
      status: "pending",
      completionRate: 0,
    });

    const executionItems = items.map((item: any) => ({
      executionId: execution.id,
      routineItemId: item.id,
      plannedStart: item.startTime,
      plannedEnd: item.endTime ?? undefined,
      status: "pending" as const,
    }));
    await repo.createExecutionItems(executionItems);
    createdExecutions.push(execution);
  }

  for (const e of createdExecutions) {
    executionByRoutineId.set(e.routineId, e);
  }

  const executionIds = scheduled
    .map((r: any) => executionByRoutineId.get(r.id)?.id)
    .filter(Boolean) as string[];

  const allExecutionItems = await repo.getExecutionItemsByExecutionIds(executionIds);
  const itemsByExecutionId = new Map<string, typeof allExecutionItems>();
  for (const ei of allExecutionItems) {
    const list = itemsByExecutionId.get(ei.executionId);
    if (list) list.push(ei);
    else itemsByExecutionId.set(ei.executionId, [ei]);
  }

  return scheduled.map((routine: any) => {
    const items = itemsByRoutineId.get(routine.id) ?? [];
    const execution = executionByRoutineId.get(routine.id)!;
    const executionItems = itemsByExecutionId.get(execution.id) ?? [];
    return { routine, items, execution, executionItems };
  });
}

export async function startExecution(executionId: string, userId: string) {
  const execution = await repo.getExecution(executionId, userId);
  if (!execution) return null;
  if (execution.status !== "pending") return execution;

  const now = dayjs().format("HH:mm");
  return repo.updateExecution(executionId, {
    status: "in_progress",
    actualStart: now,
  });
}

export async function startExecutionItem(executionItemId: string, userId: string) {
  const now = dayjs().format("HH:mm");
  return repo.updateExecutionItem(executionItemId, {
    status: "in_progress",
    actualStart: now,
  });
}

export async function completeExecutionItem(
  executionItemId: string,
  userId: string,
) {
  const now = dayjs().format("HH:mm");
  const updated = await repo.updateExecutionItem(executionItemId, {
    status: "completed",
    actualEnd: now,
  });
  if (!updated) return null;

  const executionItem = repo.getExecutionItemById
    ? await repo.getExecutionItemById(executionItemId)
    : updated;

  return updated;
}

export async function skipExecutionItem(executionItemId: string) {
  return repo.updateExecutionItem(executionItemId, {
    status: "skipped",
  });
}

export async function completeExecution(executionId: string, userId: string) {
  const execution = await repo.getExecution(executionId, userId);
  if (!execution) return null;

  const now = dayjs().format("HH:mm");
  const [completedCount, totalCount] = await Promise.all([
    repo.getExecutionItemCountByStatus(executionId, "completed"),
    repo.getExecutionItemCountByStatus(executionId, "pending"),
  ]);

  const totalItems = completedCount + totalCount;
  const completionRate = totalItems > 0
    ? Math.round((completedCount / totalItems) * 100)
    : 0;

  const status = completionRate === 100 ? "completed" : "in_progress";

  return repo.updateExecution(executionId, {
    status,
    actualEnd: now,
    completionRate,
  });
}

export async function skipExecution(executionId: string, userId: string) {
  const execution = await repo.getExecution(executionId, userId);
  if (!execution) return null;

  await repo.updateExecution(executionId, { status: "skipped" });

  return repo.getExecution(executionId, userId);
}

export async function getExecutionDetails(executionId: string, userId: string) {
  const execution = await repo.getExecution(executionId, userId);
  if (!execution) return null;

  const routine = await repo.getRoutineById(execution.routineId, userId);
  const items = routine ? await repo.getRoutineItems(routine.id) : [];
  const executionItems = await repo.getExecutionItems(executionId);

  return {
    execution,
    routine,
    items,
    executionItems,
  };
}

// ── Templates ──

export async function seedTemplates() {
  const existing = await repo.getTemplates();
  if (existing.length > 0) return getTemplates();

  for (const tmpl of SYSTEM_TEMPLATES) {
    const template = await repo.createTemplate({
      name: tmpl.name,
      description: tmpl.description,
      color: tmpl.color,
      icon: tmpl.icon,
      scheduleType: tmpl.scheduleType,
      customDays: tmpl.customDays ?? undefined,
    });

    const itemInputs: any[] = tmpl.items.map((item: any) => ({
      templateId: template.id,
      title: item.title,
      description: item.description ?? undefined,
      startTime: item.startTime,
      endTime: item.endTime ?? undefined,
      order: item.order,
      isOptional: item.isOptional,
    }));
    await repo.createTemplateItems(itemInputs);
  }

  return getTemplates();
}

export async function getTemplates() {
  const templates = await repo.getTemplates();
  return Promise.all(
    templates.map(async (t: any) => ({
      ...t,
      items: await repo.getTemplateItems(t.id),
    })),
  );
}

export async function cloneTemplate(templateId: string, userId: string) {
  const template = await repo.getTemplateById(templateId);
  if (!template) return null;

  const items = await repo.getTemplateItems(templateId);

  const routine = await repo.createRoutine({
    userId,
    name: template.name,
    description: template.description,
    color: template.color,
    icon: template.icon,
    isActive: true,
    scheduleType: template.scheduleType,
    customDays: template.customDays,
  });

  if (items.length > 0) {
    const itemInputs: any[] = items.map((item: any) => ({
      routineId: routine.id,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      order: item.order,
      isOptional: item.isOptional,
      linkedHabitId: null,
      linkedTaskId: null,
    }));
    await repo.createRoutineItems(itemInputs);
  }

  return getRoutine(routine.id, userId);
}

// ── Analytics ──

export async function getAnalytics(userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);

  const [
    routineCount,
    executionCount,
    completionRate,
    dailyTrend,
    routinePerformance,
    itemStats,
  ] = await Promise.all([
    repo.getRoutineCount(userId),
    repo.getExecutionCount(userId),
    repo.getCompletionRate(userId, dateFrom, dateTo),
    repo.getDailyCompletionTrend(userId, dateFrom, dateTo),
    repo.getRoutinePerformance(userId, dateFrom, dateTo),
    repo.getItemCompletionStats(userId, dateFrom, dateTo),
  ]);

  const routineNames = itemStats.length > 0
    ? await Promise.all(
        itemStats.map(async (stat: any) => {
          const item = await repo.getRoutineItemById(stat.routineItemId);
          return { ...stat, itemTitle: item?.title ?? "Unknown" };
        }),
      )
    : [];

  const bestDay = dailyTrend.length > 0
    ? dailyTrend.reduce((best: any, d: any) => (d.rate > best.rate ? d : best))
    : null;

  const worstDay = dailyTrend.length > 0
    ? dailyTrend.reduce((worst: any, d: any) => (d.rate < worst.rate ? d : worst))
    : null;

  const mostFollowedRoutine = routinePerformance.length > 0
    ? routinePerformance.reduce((best: any, r: any) => (r.completed > best.completed ? r : best))
    : null;

  const mostMissedItems = routineNames
    .filter((s: any) => s.rate < 50)
    .sort((a: any, b: any) => a.rate - b.rate)
    .slice(0, 5);

  return {
    routineCount,
    executionCount,
    completionRate: completionRate.rate,
    totalCompleted: completionRate.completed,
    totalMissed: completionRate.missed,
    totalSkipped: completionRate.skipped,
    consistencyScore: completionRate.rate,
    dailyTrend,
    routinePerformance,
    mostFollowedRoutine: mostFollowedRoutine
      ? { routineId: mostFollowedRoutine.routineId, completed: mostFollowedRoutine.completed }
      : null,
    mostMissedItems,
    bestDay: bestDay ? { date: bestDay.date, rate: bestDay.rate } : null,
    worstDay: worstDay ? { date: worstDay.date, rate: worstDay.rate } : null,
  };
}

export async function getRoutineAnalytics(routineId: string, userId: string, params: AnalyticsFilterParams) {
  const { dateFrom, dateTo } = getDateRange(params);

  const allExecutions = await repo.getExecutionsInRange(userId, dateFrom, dateTo);
  const routineExecs = allExecutions.filter((e: any) => e.routineId === routineId);

  const completed = routineExecs.filter((e: any) => e.status === "completed").length;
  const total = routineExecs.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const avgCompletionRate = routineExecs.length > 0
    ? Math.round(routineExecs.reduce((sum: number, e: any) => sum + e.completionRate, 0) / routineExecs.length)
    : 0;

  const dailyData = routineExecs.map((e: any) => ({
    date: e.date,
    status: e.status,
    completionRate: e.completionRate,
  }));

  return {
    totalExecutions: total,
    completed,
    completionRate,
    avgItemCompletionRate: avgCompletionRate,
    dailyData,
  };
}

// ── Day Plan ──

export type DayPlanItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  category: string | null;
  priority: string | null;
  location: string | null;
  isOptional: boolean;
  status: string | null;
  linkedHabitId: string | null;
  linkedTaskId: string | null;
  order: number;
  source: "routine" | "adhoc";
  routineId: string | null;
  routineName: string | null;
  routineColor: string | null;
  executionId: string | null;
  executionItemId: string | null;
};

export async function getDayPlan(userId: string, date: string): Promise<{
  items: DayPlanItem[];
  metrics: repo.DayMetrics;
}> {
  const [activeRoutines, adhocItems, metrics] = await Promise.all([
    repo.getActiveRoutines(userId),
    repo.getAdhocItemsForDate(userId, date),
    repo.getDayMetrics(userId, date),
  ]);

  const scheduled = activeRoutines.filter((r: any) => isScheduledForDate(r, date));

  const routineItemsPromises = scheduled.map(async (routine: any) => {
    const items = await repo.getRoutineItemsForDate(routine.id);
    let execution = await repo.getExecutionByRoutineAndDate(routine.id, date);

    if (!execution) {
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      execution = await repo.createExecution({
        routineId: routine.id,
        userId,
        date,
        plannedStart: firstItem?.startTime ?? undefined,
        plannedEnd: lastItem?.endTime ?? undefined,
        status: "pending",
        completionRate: 0,
      });

      const executionItems = items.map((item: any) => ({
        executionId: execution!.id,
        routineItemId: item.id,
        plannedStart: item.startTime,
        plannedEnd: item.endTime ?? undefined,
        status: "pending" as const,
      }));
      await repo.createExecutionItems(executionItems);
    }

    const executionItems = await repo.getExecutionItems(execution.id);
    return { routine, items, execution, executionItems };
  });

  const routineResults = await Promise.all(routineItemsPromises);

  const routineDayItems: DayPlanItem[] = routineResults.flatMap(({ routine, execution, executionItems }: any) =>
    executionItems.map((ei: any) => {
      const item = ei.routineItem;
      return {
        id: ei.id,
        title: item?.title ?? "",
        description: item?.description ?? null,
        startTime: item?.startTime ?? ei.plannedStart ?? "",
        endTime: item?.endTime ?? ei.plannedEnd ?? null,
        category: item?.category ?? null,
        priority: item?.priority ?? null,
        location: item?.location ?? null,
        isOptional: item?.isOptional ?? false,
        status: ei.status,
        linkedHabitId: item?.linkedHabitId ?? null,
        linkedTaskId: item?.linkedTaskId ?? null,
        order: item?.order ?? 0,
        source: "routine" as const,
        routineId: routine.id,
        routineName: routine.name,
        routineColor: routine.color,
        executionId: execution.id,
        executionItemId: ei.id,
      };
    }),
  );

  const adhocDayItems: DayPlanItem[] = adhocItems.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    startTime: item.startTime,
    endTime: item.endTime,
    category: item.category,
    priority: item.priority,
    location: item.location,
    isOptional: item.isOptional,
    status: item.status,
    linkedHabitId: item.linkedHabitId,
    linkedTaskId: item.linkedTaskId,
    order: item.order,
    source: "adhoc" as const,
    routineId: null,
    routineName: null,
    routineColor: null,
    executionId: null,
    executionItemId: null,
  }));

  const items = [...routineDayItems, ...adhocDayItems].sort((a, b) => {
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return a.order - b.order;
  });

  return { items, metrics };
}

// ── Ad-hoc Items ──

export async function createAdhocItem(userId: string, params: CreateAdhocItemParams) {
  const validated = createAdhocItemSchema.parse(params);

  const overlap = await repo.checkTimeOverlap({
    startTime: validated.startTime,
    endTime: validated.endTime,
    date: validated.date,
  });

  if (overlap) {
    throw new Error("Time slot overlaps with an existing item");
  }

  return repo.createRoutineItem({
    userId,
    title: validated.title,
    description: validated.description ?? undefined,
    startTime: validated.startTime,
    endTime: validated.endTime ?? undefined,
    date: validated.date,
    category: validated.category ?? undefined,
    priority: validated.priority ?? undefined,
    location: validated.location ?? undefined,
    order: 0,
    isOptional: false,
    status: "pending",
    linkedHabitId: undefined,
    linkedTaskId: undefined,
  });
}

export async function updateAdhocItem(itemId: string, userId: string, params: UpdateAdhocItemParams) {
  const item = await repo.getRoutineItemById(itemId);
  if (!item || item.routineId !== null) return null;
  if (item.userId !== userId) return null;

  const validated = updateAdhocItemSchema.parse(params);

  const startTime = validated.startTime ?? item.startTime;
  const endTime = validated.endTime ?? item.endTime;
  const date = validated.date ?? item.date;

  if (date) {
    const overlap = await repo.checkTimeOverlap({
      startTime,
      endTime,
      date,
      excludeItemId: itemId,
    });

    if (overlap) {
      throw new Error("Time slot overlaps with an existing item");
    }
  }

  const updateData: Record<string, string | undefined> = {};
  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined) updateData.description = validated.description ?? undefined;
  if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
  if (validated.endTime !== undefined) updateData.endTime = validated.endTime ?? undefined;
  if (validated.date !== undefined) updateData.date = validated.date ?? undefined;
  if (validated.category !== undefined) updateData.category = validated.category ?? undefined;
  if (validated.priority !== undefined) updateData.priority = validated.priority ?? undefined;
  if (validated.location !== undefined) updateData.location = validated.location ?? undefined;

  return repo.updateRoutineItem(itemId, updateData);
}

export async function deleteAdhocItem(itemId: string, userId: string) {
  const item = await repo.getRoutineItemById(itemId);
  if (!item || item.routineId !== null) return null;
  if (item.userId !== userId) return null;

  return repo.deleteRoutineItem(itemId);
}

// ── Item Status ──

export async function updateItemStatus(
  itemId: string,
  userId: string,
  status: "pending" | "in_progress" | "completed" | "skipped",
) {
  const validated = updateItemStatusSchema.parse({ status });

  const item = await repo.getRoutineItemById(itemId);
  if (!item) return null;

  if (item.routineId !== null) {
    const executionItem = await repo.getExecutionItemById(itemId);
    if (!executionItem) return null;

    const now = dayjs().format("HH:mm");
    const updateData: Record<string, string> = { status: validated.status };

    if (validated.status === "in_progress") {
      updateData.actualStart = now;
    } else if (validated.status === "completed") {
      updateData.actualEnd = now;
    }

    await repo.updateExecutionItem(itemId, updateData);

    if (validated.status === "completed" || validated.status === "skipped") {
      const execution = await repo.getExecution(executionItem.executionId, userId);
      if (execution) {
        const [completedCount, totalCount] = await Promise.all([
          repo.getExecutionItemCountByStatus(execution.id, "completed"),
          repo.getExecutionItemCountByStatus(execution.id, "pending"),
        ]);
        const totalItems = completedCount + totalCount;
        const completionRate = totalItems > 0
          ? Math.round((completedCount / totalItems) * 100)
          : 0;
        const execStatus = completionRate === 100 ? "completed" : "in_progress";
        await repo.updateExecution(execution.id, { status: execStatus, completionRate });
      }
    }

    return repo.getExecutionItemById(itemId);
  }

  return repo.updateRoutineItem(itemId, { status: validated.status });
}

// ── Day Metrics ──

export async function getDayMetrics(userId: string, date: string) {
  return repo.getDayMetrics(userId, date);
}

// ── Daily Planner ──

export const dailyGoalSchema = z.object({
  title: z.string().min(1).max(300),
  isCompleted: z.boolean().default(false),
  taskId: z.string().nullable().optional(),
});

export const dailyPrioritySchema = z.object({
  title: z.string().min(1).max(300),
  estimatedDuration: z.number().int().min(0).nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed", "skipped"]).default("pending"),
  sortOrder: z.number().int().min(0).default(0),
  taskId: z.string().nullable().optional(),
});

export const dailyNoteSchema = z.object({
  content: z.string().optional(),
});

export async function setDailyGoal(userId: string, date: string, params: z.infer<typeof dailyGoalSchema>) {
  const validated = dailyGoalSchema.parse(params);
  return repo.upsertDailyGoal({
    userId,
    date,
    title: validated.title,
    isCompleted: validated.isCompleted,
    taskId: validated.taskId ?? undefined,
  });
}

export async function toggleDailyGoal(id: string, userId: string, isCompleted: boolean) {
  return repo.updateDailyGoal(id, userId, { isCompleted });
}

export const getDailyPlannerData = cache(async (userId: string, date: string) => {
  const [goal, priorities, snapshot, note, dayPlan] = await Promise.all([
    repo.getDailyGoal(userId, date),
    repo.getDailyPriorities(userId, date),
    repo.getDailyPlannerSnapshot(userId, date),
    repo.getDailyNote(userId, date),
    getDayPlan(userId, date).catch(() => ({ items: [], metrics: null })),
  ]);

  return { goal, priorities, snapshot, note, dayPlan };
});

export async function addDailyPriority(userId: string, date: string, params: z.infer<typeof dailyPrioritySchema>) {
  const validated = dailyPrioritySchema.parse(params);
  const priorities = await repo.getDailyPriorities(userId, date);
  return repo.createDailyPriority({
    userId,
    date,
    title: validated.title,
    estimatedDuration: validated.estimatedDuration ?? undefined,
    status: validated.status,
    sortOrder: validated.sortOrder,
    taskId: validated.taskId ?? undefined,
  });
}

export async function updateDailyPriorityStatus(id: string, userId: string, status: string) {
  return repo.updateDailyPriority(id, userId, { status });
}

export async function removeDailyPriority(id: string, userId: string) {
  return repo.deleteDailyPriority(id, userId);
}

export async function saveDailyNote(userId: string, date: string, params: z.infer<typeof dailyNoteSchema>) {
  const validated = dailyNoteSchema.parse(params);
  const existing = await repo.getDailyNote(userId, date);
  if (existing) {
    return repo.updateDailyNote(existing.id, userId, { content: validated.content ?? undefined });
  }
  return repo.upsertDailyNote({ userId, date, content: validated.content ?? undefined });
}

export async function computeProductivityScore(userId: string, date: string) {
  const data = await getDailyPlannerData(userId, date);
  const { dayPlan, goal } = data;

  const totalTasks = dayPlan?.metrics?.totalItems ?? 0;
  const completedTasks = dayPlan?.metrics?.completedItems ?? 0;
  const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 25) : 0;

  const goalScore = goal?.isCompleted ? 15 : 0;

  const plannedHours = dayPlan?.metrics?.plannedHours ?? 0;
  const plannedMinutes = plannedHours * 60;
  const timeScore = plannedMinutes > 0 ? Math.min(20, Math.round((plannedMinutes / 480) * 20)) : 0;

  const completionRate = dayPlan?.metrics?.completionRate ?? 0;
  const completionScore = Math.round((completionRate / 100) * 20);

  const focusScore = 0;

  const habitScore = 0;

  const rawScore = taskScore + goalScore + timeScore + completionScore + focusScore + habitScore;
  const finalScore = Math.min(100, Math.max(0, rawScore));

  const subScores = {
    tasks: taskScore,
    dailyGoal: goalScore,
    timeManagement: timeScore,
    completionRate: completionScore,
    focus: focusScore,
    habits: habitScore,
  } as Record<string, number>;

  const existing = await repo.getDailyPlannerSnapshot(userId, date);
  if (existing) {
    await repo.upsertDailyPlannerSnapshot({
      userId,
      date,
      productivityScore: finalScore,
      subScores: subScores as any,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      focusMinutes: 0,
      habitsCompleted: 0,
      habitsTotal: 0,
      dailyGoalCompleted: goal?.isCompleted ?? false,
    });
  } else {
    await repo.upsertDailyPlannerSnapshot({
      userId,
      date,
      productivityScore: finalScore,
      subScores: subScores as any,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      focusMinutes: 0,
      habitsCompleted: 0,
      habitsTotal: 0,
      dailyGoalCompleted: goal?.isCompleted ?? false,
    });
  }

  return { score: finalScore, subScores };
}

export type DailyPlannerData = Awaited<ReturnType<typeof getDailyPlannerData>>;
