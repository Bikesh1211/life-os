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
    return routine.customDays?.map((d) => d.toLowerCase().slice(0, 3)).includes(dayName) ?? false;
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
    return routine.customDays?.map((d) => d.toLowerCase().slice(0, 3)).includes(dayName) ?? false;
  }
  return false;
}

// ── Routine CRUD ──

export async function getRoutines(userId: string) {
  const routineList = await repo.getRoutines(userId);
  const routinesWithItems = await Promise.all(
    routineList.map(async (routine) => ({
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
    description: validated.description ?? null,
    color: validated.color ?? null,
    icon: validated.icon ?? null,
    isActive: validated.isActive ?? true,
    scheduleType: validated.scheduleType,
    customDays: validated.customDays ?? null,
  });

  if (validated.items && validated.items.length > 0) {
    const itemInputs = validated.items.map((item) => ({
      routineId: routine.id,
      title: item.title,
      description: item.description ?? null,
      startTime: item.startTime,
      endTime: item.endTime ?? null,
      order: item.order,
      isOptional: item.isOptional,
      linkedHabitId: item.linkedHabitId ?? null,
      linkedTaskId: item.linkedTaskId ?? null,
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
    customDays: validated.customDays ?? null,
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
    const itemInputs = original.items.map((item) => ({
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
    description: validated.description ?? null,
    startTime: validated.startTime,
    endTime: validated.endTime ?? null,
    order: validated.order,
    isOptional: validated.isOptional,
    linkedHabitId: validated.linkedHabitId ?? null,
    linkedTaskId: validated.linkedTaskId ?? null,
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
    linkedHabitId: validated.linkedHabitId ?? null,
    linkedTaskId: validated.linkedTaskId ?? null,
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
  const scheduled = activeRoutines.filter((r) => isScheduledToday(r));

  const result = await Promise.all(
    scheduled.map(async (routine) => {
      const items = await repo.getRoutineItems(routine.id);
      let execution = await repo.getExecutionByRoutineAndDate(routine.id, today);

      if (!execution) {
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        execution = await repo.createExecution({
          routineId: routine.id,
          userId,
          date: today,
          plannedStart: firstItem?.startTime ?? null,
          plannedEnd: lastItem?.endTime ?? null,
          status: "pending",
          completionRate: 0,
        });

        const executionItems = items.map((item) => ({
          executionId: execution!.id,
          routineItemId: item.id,
          plannedStart: item.startTime,
          plannedEnd: item.endTime ?? null,
          status: "pending" as const,
        }));
        await repo.createExecutionItems(executionItems);
      }

      const executionItems = await repo.getExecutionItems(execution.id);
      return { routine, items, execution, executionItems };
    }),
  );

  return result;
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

  const executionItem = await repo.getExecutionItemById
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
      customDays: tmpl.customDays ?? null,
    });

    const itemInputs = tmpl.items.map((item) => ({
      templateId: template.id,
      title: item.title,
      description: item.description ?? null,
      startTime: item.startTime,
      endTime: item.endTime ?? null,
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
    templates.map(async (t) => ({
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
    const itemInputs = items.map((item) => ({
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
        itemStats.map(async (stat) => {
          const item = await repo.getRoutineItemById(stat.routineItemId);
          return { ...stat, itemTitle: item?.title ?? "Unknown" };
        }),
      )
    : [];

  const bestDay = dailyTrend.length > 0
    ? dailyTrend.reduce((best, d) => (d.rate > best.rate ? d : best))
    : null;

  const worstDay = dailyTrend.length > 0
    ? dailyTrend.reduce((worst, d) => (d.rate < worst.rate ? d : worst))
    : null;

  const mostFollowedRoutine = routinePerformance.length > 0
    ? routinePerformance.reduce((best, r) => (r.completed > best.completed ? r : best))
    : null;

  const mostMissedItems = routineNames
    .filter((s) => s.rate < 50)
    .sort((a, b) => a.rate - b.rate)
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
  const routineExecs = allExecutions.filter((e) => e.routineId === routineId);

  const completed = routineExecs.filter((e) => e.status === "completed").length;
  const total = routineExecs.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const avgCompletionRate = routineExecs.length > 0
    ? Math.round(routineExecs.reduce((sum, e) => sum + e.completionRate, 0) / routineExecs.length)
    : 0;

  const dailyData = routineExecs.map((e) => ({
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

  const scheduled = activeRoutines.filter((r) => isScheduledForDate(r, date));

  const routineItemsPromises = scheduled.map(async (routine) => {
    const items = await repo.getRoutineItemsForDate(routine.id);
    let execution = await repo.getExecutionByRoutineAndDate(routine.id, date);

    if (!execution) {
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      execution = await repo.createExecution({
        routineId: routine.id,
        userId,
        date,
        plannedStart: firstItem?.startTime ?? null,
        plannedEnd: lastItem?.endTime ?? null,
        status: "pending",
        completionRate: 0,
      });

      const executionItems = items.map((item) => ({
        executionId: execution!.id,
        routineItemId: item.id,
        plannedStart: item.startTime,
        plannedEnd: item.endTime ?? null,
        status: "pending" as const,
      }));
      await repo.createExecutionItems(executionItems);
    }

    const executionItems = await repo.getExecutionItems(execution.id);
    return { routine, items, execution, executionItems };
  });

  const routineResults = await Promise.all(routineItemsPromises);

  const routineDayItems: DayPlanItem[] = routineResults.flatMap(({ routine, execution, executionItems }) =>
    executionItems.map((ei) => {
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

  const adhocDayItems: DayPlanItem[] = adhocItems.map((item) => ({
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
    description: validated.description ?? null,
    startTime: validated.startTime,
    endTime: validated.endTime ?? null,
    date: validated.date,
    category: validated.category ?? null,
    priority: validated.priority ?? null,
    location: validated.location ?? null,
    order: 0,
    isOptional: false,
    status: "pending",
    linkedHabitId: null,
    linkedTaskId: null,
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

  const updateData: Record<string, string | null> = {};
  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined) updateData.description = validated.description ?? null;
  if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
  if (validated.endTime !== undefined) updateData.endTime = validated.endTime ?? null;
  if (validated.date !== undefined) updateData.date = validated.date ?? null;
  if (validated.category !== undefined) updateData.category = validated.category ?? null;
  if (validated.priority !== undefined) updateData.priority = validated.priority ?? null;
  if (validated.location !== undefined) updateData.location = validated.location ?? null;

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
