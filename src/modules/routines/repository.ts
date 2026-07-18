import { db } from "@/core/database";
import { and, eq, asc, count, gte, lte, sql, inArray, or, isNull, not } from "drizzle-orm";
import {
  routines,
  routineItems,
  routineExecutions,
  routineExecutionItems,
  routineTemplates,
  routineTemplateItems,
  dailyGoals,
  dailyPriorities,
  dailyPlannerSnapshots,
  dailyNotes,
  plannerPreferences,
} from "./schema";

export type Routine = typeof routines.$inferSelect;
export type RoutineItem = typeof routineItems.$inferSelect;
export type RoutineExecution = typeof routineExecutions.$inferSelect;
export type RoutineExecutionItem = typeof routineExecutionItems.$inferSelect;
export type RoutineTemplate = typeof routineTemplates.$inferSelect;
export type RoutineTemplateItem = typeof routineTemplateItems.$inferSelect;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type DailyPriority = typeof dailyPriorities.$inferSelect;
export type DailyPlannerSnapshot = typeof dailyPlannerSnapshots.$inferSelect;
export type DailyNote = typeof dailyNotes.$inferSelect;
export type PlannerPreferences = typeof plannerPreferences.$inferSelect;

export type CreateRoutineInput = typeof routines.$inferInsert;
export type CreateRoutineItemInput = typeof routineItems.$inferInsert;
export type CreateExecutionInput = typeof routineExecutions.$inferInsert;
export type CreateExecutionItemInput = typeof routineExecutionItems.$inferInsert;
export type CreateTemplateInput = typeof routineTemplates.$inferInsert;
export type CreateTemplateItemInput = typeof routineTemplateItems.$inferInsert;
export type CreateDailyGoalInput = typeof dailyGoals.$inferInsert;
export type CreateDailyPriorityInput = typeof dailyPriorities.$inferInsert;
export type CreateDailyPlannerSnapshotInput = typeof dailyPlannerSnapshots.$inferInsert;
export type CreateDailyNoteInput = typeof dailyNotes.$inferInsert;
export type CreatePlannerPreferencesInput = typeof plannerPreferences.$inferInsert;

export type DayMetrics = Awaited<ReturnType<typeof getDayMetrics>>;

// ── Routines ──

export async function getRoutines(userId: string) {
  return db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(asc(routines.createdAt));
}

export async function getActiveRoutines(userId: string) {
  return db
    .select()
    .from(routines)
    .where(and(eq(routines.userId, userId), eq(routines.isActive, true)))
    .orderBy(asc(routines.createdAt));
}

export async function getRoutineById(id: string, userId: string) {
  return db
    .select()
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .then((r) => r[0] ?? null);
}

export async function createRoutine(input: CreateRoutineInput) {
  return db.insert(routines).values(input).returning().then((r) => r[0]);
}

export async function updateRoutine(id: string, userId: string, input: Partial<CreateRoutineInput>) {
  return db
    .update(routines)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function deleteRoutine(id: string, userId: string) {
  return db
    .delete(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function getRoutineCount(userId: string) {
  return db
    .select({ count: count() })
    .from(routines)
    .where(eq(routines.userId, userId))
    .then((r) => Number(r[0]?.count ?? 0));
}

// ── Routine Items ──

export async function getRoutineItems(routineId: string) {
  return db
    .select()
    .from(routineItems)
    .where(eq(routineItems.routineId, routineId))
    .orderBy(asc(routineItems.order));
}

export async function getRoutineItemsByRoutineIds(routineIds: string[]) {
  if (routineIds.length === 0) return [];
  return db
    .select()
    .from(routineItems)
    .where(inArray(routineItems.routineId, routineIds))
    .orderBy(asc(routineItems.order));
}

export async function getRoutineItemById(id: string) {
  return db
    .select()
    .from(routineItems)
    .where(eq(routineItems.id, id))
    .then((r) => r[0] ?? null);
}

export async function createRoutineItem(input: CreateRoutineItemInput) {
  return db.insert(routineItems).values(input).returning().then((r) => r[0]);
}

export async function createRoutineItems(inputs: CreateRoutineItemInput[]) {
  if (inputs.length === 0) return [];
  return db.insert(routineItems).values(inputs).returning();
}

export async function updateRoutineItem(id: string, input: Partial<CreateRoutineItemInput>) {
  return db
    .update(routineItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(routineItems.id, id))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function deleteRoutineItem(id: string) {
  return db
    .delete(routineItems)
    .where(eq(routineItems.id, id))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function reorderRoutineItems(items: Array<{ id: string; order: number }>) {
  const promises = items.map((item) =>
    db
      .update(routineItems)
      .set({ order: item.order, updatedAt: new Date() })
      .where(eq(routineItems.id, item.id)),
  );
  await Promise.all(promises);
}

// ── Executions ──

export async function getExecution(executionId: string, userId: string) {
  return db
    .select()
    .from(routineExecutions)
    .where(and(eq(routineExecutions.id, executionId), eq(routineExecutions.userId, userId)))
    .then((r) => r[0] ?? null);
}

export async function getExecutionByRoutineAndDate(routineId: string, date: string) {
  return db
    .select()
    .from(routineExecutions)
    .where(and(eq(routineExecutions.routineId, routineId), eq(routineExecutions.date, date)))
    .then((r) => r[0] ?? null);
}

export async function getExecutionsByRoutineIdsAndDate(routineIds: string[], date: string) {
  if (routineIds.length === 0) return [];
  return db
    .select()
    .from(routineExecutions)
    .where(and(inArray(routineExecutions.routineId, routineIds), eq(routineExecutions.date, date)));
}

export async function createExecution(input: CreateExecutionInput) {
  return db.insert(routineExecutions).values(input).returning().then((r) => r[0]);
}

export async function updateExecution(id: string, input: Partial<CreateExecutionInput>) {
  return db
    .update(routineExecutions)
    .set(input)
    .where(eq(routineExecutions.id, id))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function getExecutionsForDate(userId: string, date: string) {
  return db
    .select()
    .from(routineExecutions)
    .where(and(eq(routineExecutions.userId, userId), eq(routineExecutions.date, date)))
    .orderBy(asc(routineExecutions.createdAt));
}

export async function getExecutionsInRange(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select()
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        gte(routineExecutions.date, dateFrom),
        lte(routineExecutions.date, dateTo),
      ),
    )
    .orderBy(asc(routineExecutions.date));
}

export async function getExecutionCount(userId: string) {
  return db
    .select({ count: count() })
    .from(routineExecutions)
    .where(eq(routineExecutions.userId, userId))
    .then((r) => Number(r[0]?.count ?? 0));
}

// ── Execution Items ──

export async function getExecutionItems(executionId: string) {
  const items = await db
    .select()
    .from(routineExecutionItems)
    .where(eq(routineExecutionItems.executionId, executionId))
    .orderBy(asc(routineExecutionItems.createdAt));

  const itemIds = items.map((i) => i.routineItemId);
  if (itemIds.length === 0) return items.map((ei) => ({ ...ei, routineItem: null }));

  const itemRows = await db
    .select()
    .from(routineItems)
    .where(inArray(routineItems.id, itemIds));

  const routineItemMap = new Map(itemRows.map((r) => [r.id, r]));

  return items.map((ei) => ({
    ...ei,
    routineItem: routineItemMap.get(ei.routineItemId) ?? null,
  }));
}

export async function getExecutionItemsByExecutionIds(executionIds: string[]) {
  if (executionIds.length === 0) return [];
  const items = await db
    .select()
    .from(routineExecutionItems)
    .where(inArray(routineExecutionItems.executionId, executionIds))
    .orderBy(asc(routineExecutionItems.createdAt));

  const itemIds = items.map((i) => i.routineItemId);
  if (itemIds.length === 0) return items.map((ei) => ({ ...ei, routineItem: null }));

  const itemRows = await db
    .select()
    .from(routineItems)
    .where(inArray(routineItems.id, itemIds));

  const routineItemMap = new Map(itemRows.map((r) => [r.id, r]));

  return items.map((ei) => ({
    ...ei,
    routineItem: routineItemMap.get(ei.routineItemId) ?? null,
  }));
}

export async function createExecutionItem(input: CreateExecutionItemInput) {
  return db.insert(routineExecutionItems).values(input).returning().then((r) => r[0]);
}

export async function createExecutionItems(inputs: CreateExecutionItemInput[]) {
  if (inputs.length === 0) return [];
  return db.insert(routineExecutionItems).values(inputs).returning();
}

export async function updateExecutionItem(id: string, input: Partial<CreateExecutionItemInput>) {
  return db
    .update(routineExecutionItems)
    .set(input)
    .where(eq(routineExecutionItems.id, id))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function getExecutionItemById(id: string) {
  return db
    .select()
    .from(routineExecutionItems)
    .where(eq(routineExecutionItems.id, id))
    .then((r) => r[0] ?? null);
}

export async function getExecutionItemCountByStatus(
  executionId: string,
  status: "pending" | "in_progress" | "completed" | "skipped",
) {
  return db
    .select({ count: count() })
    .from(routineExecutionItems)
    .where(
      and(
        eq(routineExecutionItems.executionId, executionId),
        eq(routineExecutionItems.status, status),
      ),
    )
    .then((r) => Number(r[0]?.count ?? 0));
}

// ── Day Plan / Ad-hoc Items ──

export async function getAdhocItemsForDate(userId: string, date: string) {
  return db
    .select()
    .from(routineItems)
    .where(
      and(
        isNull(routineItems.routineId),
        eq(routineItems.userId, userId),
        eq(routineItems.date, date),
      ),
    )
    .orderBy(asc(routineItems.startTime));
}

export async function getExecutionsForDateWithItems(userId: string, date: string) {
  const executionList = await db
    .select()
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        eq(routineExecutions.date, date),
      ),
    )
    .orderBy(asc(routineExecutions.createdAt));

  if (executionList.length === 0) return [];

  const executionIds = executionList.map((e) => e.id);
  const allExecutionItems = await db
    .select()
    .from(routineExecutionItems)
    .where(inArray(routineExecutionItems.executionId, executionIds))
    .orderBy(asc(routineExecutionItems.createdAt));

  const itemIds = [...new Set(allExecutionItems.map((ei) => ei.routineItemId))];
  const itemRows = itemIds.length > 0
    ? await db.select().from(routineItems).where(inArray(routineItems.id, itemIds))
    : [];

  const itemMap = new Map(itemRows.map((r) => [r.id, r]));
  const executionMap = new Map(executionList.map((e) => [e.id, e]));

  const itemsByExecution = new Map<string, typeof allExecutionItems>();
  for (const ei of allExecutionItems) {
    const existing = itemsByExecution.get(ei.executionId) ?? [];
    existing.push(ei);
    itemsByExecution.set(ei.executionId, existing);
  }

  return executionList.map((execution) => {
    const executionItems = (itemsByExecution.get(execution.id) ?? []).map((ei) => ({
      ...ei,
      routineItem: itemMap.get(ei.routineItemId) ?? null,
    }));
    return { execution, executionItems };
  });
}

export async function getRoutineItemsForDate(routineId: string) {
  return db
    .select()
    .from(routineItems)
    .where(eq(routineItems.routineId, routineId))
    .orderBy(asc(routineItems.startTime));
}

export async function checkTimeOverlap(params: {
  startTime: string;
  endTime?: string | null;
  date?: string | null;
  routineId?: string | null;
  excludeItemId?: string;
}) {
  const { startTime, endTime, date, routineId, excludeItemId } = params;

  const conditions: ReturnType<typeof and>[] = [];

  if (routineId) {
    conditions.push(eq(routineItems.routineId, routineId));
  }
  if (date) {
    conditions.push(eq(routineItems.date, date));
  }
  if (excludeItemId) {
    conditions.push(not(eq(routineItems.id, excludeItemId)));
  }

  if (endTime) {
    conditions.push(
      or(
        and(
          gte(routineItems.startTime, startTime),
          lte(routineItems.startTime, endTime),
        ),
        and(
          gte(routineItems.startTime, startTime),
          isNull(routineItems.endTime),
        ),
      ),
    );
  } else {
    conditions.push(eq(routineItems.startTime, startTime));
  }

  return db
    .select({ id: routineItems.id })
    .from(routineItems)
    .where(and(...conditions))
    .then((r) => r.length > 0);
}

export async function getDayMetrics(userId: string, date: string) {
  const [executions, adhocItems] = await Promise.all([
    db
      .select()
      .from(routineExecutions)
      .where(
        and(
          eq(routineExecutions.userId, userId),
          eq(routineExecutions.date, date),
        ),
      ),
    db
      .select()
      .from(routineItems)
      .where(
        and(
          isNull(routineItems.routineId),
          eq(routineItems.userId, userId),
          eq(routineItems.date, date),
        ),
      ),
  ]);

  let totalItems = 0;
  let completedItems = 0;

  const executionIds = executions.map((e) => e.id);
  if (executionIds.length > 0) {
    const stats = await db
      .select({
        total: count(routineExecutionItems.id),
        completed:
          sql`COUNT(CASE WHEN ${routineExecutionItems.status} = 'completed' THEN 1 END)`.as<number>(),
      })
      .from(routineExecutionItems)
      .where(inArray(routineExecutionItems.executionId, executionIds));

    totalItems += Number(stats[0]?.total ?? 0);
    completedItems += Number(stats[0]?.completed ?? 0);
  }

  if (adhocItems.length > 0) {
    totalItems += adhocItems.length;
    completedItems += adhocItems.filter((i) => i.status === "completed").length;
  }

  const plannedHours = calculateTotalPlannedHours(executions, adhocItems);

  return {
    totalItems,
    completedItems,
    plannedHours,
    completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
  };
}

function calculateTotalPlannedHours(
  executions: Array<{ plannedStart: string | null; plannedEnd: string | null }>,
  adhocItems: Array<{ startTime: string; endTime: string | null }>,
) {
  let totalMinutes = 0;

  for (const exec of executions) {
    if (exec.plannedStart && exec.plannedEnd) {
      const [sh, sm] = exec.plannedStart.split(":").map(Number);
      const [eh, em] = exec.plannedEnd.split(":").map(Number);
      totalMinutes += eh * 60 + em - (sh * 60 + sm);
    }
  }

  for (const item of adhocItems) {
    if (item.startTime && item.endTime) {
      const [sh, sm] = item.startTime.split(":").map(Number);
      const [eh, em] = item.endTime.split(":").map(Number);
      totalMinutes += eh * 60 + em - (sh * 60 + sm);
    }
  }

  return Math.round((totalMinutes / 60) * 10) / 10;
}

export async function getTemplates() {
  return db.select().from(routineTemplates).orderBy(asc(routineTemplates.createdAt));
}

export async function getTemplateById(id: string) {
  return db
    .select()
    .from(routineTemplates)
    .where(eq(routineTemplates.id, id))
    .then((r) => r[0] ?? null);
}

export async function createTemplate(input: CreateTemplateInput) {
  return db.insert(routineTemplates).values(input).returning().then((r) => r[0]);
}

export async function getTemplateItems(templateId: string) {
  return db
    .select()
    .from(routineTemplateItems)
    .where(eq(routineTemplateItems.templateId, templateId))
    .orderBy(asc(routineTemplateItems.order));
}

export async function createTemplateItem(input: CreateTemplateItemInput) {
  return db.insert(routineTemplateItems).values(input).returning().then((r) => r[0]);
}

export async function createTemplateItems(inputs: CreateTemplateItemInput[]) {
  if (inputs.length === 0) return [];
  return db.insert(routineTemplateItems).values(inputs).returning();
}

// ── Analytics ──

export async function getCompletionRate(userId: string, dateFrom: string, dateTo: string) {
  const result = await db
    .select({
      total: count(routineExecutions.id),
      completed: sql`COUNT(CASE WHEN ${routineExecutions.status} = 'completed' THEN 1 END)`.as<number>(),
      skipped: sql`COUNT(CASE WHEN ${routineExecutions.status} = 'skipped' THEN 1 END)`.as<number>(),
      missed: sql`COUNT(CASE WHEN ${routineExecutions.status} = 'missed' THEN 1 END)`.as<number>(),
    })
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        gte(routineExecutions.date, dateFrom),
        lte(routineExecutions.date, dateTo),
      ),
    );

  return {
    total: Number(result[0]?.total ?? 0),
    completed: Number(result[0]?.completed ?? 0),
    skipped: Number(result[0]?.skipped ?? 0),
    missed: Number(result[0]?.missed ?? 0),
    rate: Number(result[0]?.total ?? 0) > 0
      ? Math.round((Number(result[0]?.completed ?? 0) / Number(result[0]?.total ?? 0)) * 100)
      : 0,
  };
}

export async function getDailyCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      date: routineExecutions.date,
      completed: sql`COUNT(CASE WHEN ${routineExecutions.status} = 'completed' THEN 1 END)`.as<number>(),
      total: count(routineExecutions.id),
    })
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        gte(routineExecutions.date, dateFrom),
        lte(routineExecutions.date, dateTo),
      ),
    )
    .groupBy(routineExecutions.date)
    .orderBy(asc(routineExecutions.date));

  return rows.map((r) => ({
    date: r.date,
    completed: Number(r.completed),
    total: Number(r.total),
    rate: Number(r.total) > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0,
  }));
}

export async function getRoutinePerformance(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      routineId: routineExecutions.routineId,
      total: count(routineExecutions.id),
      completed: sql`COUNT(CASE WHEN ${routineExecutions.status} = 'completed' THEN 1 END)`.as<number>(),
      avgCompletionRate: sql`AVG(${routineExecutions.completionRate})`.as<number>(),
    })
    .from(routineExecutions)
    .where(
      and(
        eq(routineExecutions.userId, userId),
        gte(routineExecutions.date, dateFrom),
        lte(routineExecutions.date, dateTo),
      ),
    )
    .groupBy(routineExecutions.routineId);

  return rows.map((r) => ({
    routineId: r.routineId,
    total: Number(r.total),
    completed: Number(r.completed),
    avgCompletionRate: Math.round(Number(r.avgCompletionRate) ?? 0),
    rate: Number(r.total) > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0,
  }));
}

export async function getItemCompletionStats(userId: string, dateFrom: string, dateTo: string) {
  const rows = await db
    .select({
      routineItemId: routineExecutionItems.routineItemId,
      total: count(routineExecutionItems.id),
      completed: sql`COUNT(CASE WHEN ${routineExecutionItems.status} = 'completed' THEN 1 END)`.as<number>(),
      skipped: sql`COUNT(CASE WHEN ${routineExecutionItems.status} = 'skipped' THEN 1 END)`.as<number>(),
    })
    .from(routineExecutionItems)
    .innerJoin(
      routineExecutions,
      eq(routineExecutionItems.executionId, routineExecutions.id),
    )
    .where(
      and(
        eq(routineExecutions.userId, userId),
        gte(routineExecutions.date, dateFrom),
        lte(routineExecutions.date, dateTo),
      ),
    )
    .groupBy(routineExecutionItems.routineItemId);

  return rows.map((r) => ({
    routineItemId: r.routineItemId,
    total: Number(r.total),
    completed: Number(r.completed),
    skipped: Number(r.skipped),
    rate: Number(r.total) > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0,
  }));
}

// ── Daily Planner ──

// Daily Goal
export async function getDailyGoal(userId: string, date: string): Promise<DailyGoal | null> {
  const [goal] = await db
    .select()
    .from(dailyGoals)
    .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.date, date)))
    .limit(1);
  return goal ?? null;
}

export async function upsertDailyGoal(input: CreateDailyGoalInput): Promise<DailyGoal> {
  const existing = await getDailyGoal(input.userId, input.date);
  if (existing) {
    const [goal] = await db
      .update(dailyGoals)
      .set({ title: input.title, isCompleted: input.isCompleted ?? false, taskId: input.taskId ?? null, updatedAt: new Date() })
      .where(eq(dailyGoals.id, existing.id))
      .returning();
    return goal;
  }
  const [goal] = await db
    .insert(dailyGoals)
    .values(input)
    .returning();
  return goal;
}

export async function updateDailyGoal(id: string, userId: string, data: Partial<CreateDailyGoalInput>): Promise<DailyGoal | null> {
  const [goal] = await db
    .update(dailyGoals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(dailyGoals.id, id), eq(dailyGoals.userId, userId)))
    .returning();
  return goal ?? null;
}

// Daily Priorities
export async function getDailyPriorities(userId: string, date: string): Promise<DailyPriority[]> {
  return db
    .select()
    .from(dailyPriorities)
    .where(and(eq(dailyPriorities.userId, userId), eq(dailyPriorities.date, date)))
    .orderBy(asc(dailyPriorities.sortOrder));
}

export async function createDailyPriority(input: CreateDailyPriorityInput): Promise<DailyPriority> {
  const [item] = await db
    .insert(dailyPriorities)
    .values(input)
    .returning();
  return item;
}

export async function updateDailyPriority(id: string, userId: string, data: Partial<CreateDailyPriorityInput>): Promise<DailyPriority | null> {
  const [item] = await db
    .update(dailyPriorities)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(dailyPriorities.id, id), eq(dailyPriorities.userId, userId)))
    .returning();
  return item ?? null;
}

export async function deleteDailyPriority(id: string, userId: string): Promise<void> {
  await db
    .delete(dailyPriorities)
    .where(and(eq(dailyPriorities.id, id), eq(dailyPriorities.userId, userId)));
}

// Daily Planner Snapshot
export async function getDailyPlannerSnapshot(userId: string, date: string): Promise<DailyPlannerSnapshot | null> {
  const [snapshot] = await db
    .select()
    .from(dailyPlannerSnapshots)
    .where(and(eq(dailyPlannerSnapshots.userId, userId), eq(dailyPlannerSnapshots.date, date)))
    .limit(1);
  return snapshot ?? null;
}

export async function upsertDailyPlannerSnapshot(input: CreateDailyPlannerSnapshotInput): Promise<DailyPlannerSnapshot> {
  const [snapshot] = await db
    .insert(dailyPlannerSnapshots)
    .values(input)
    .returning();
  return snapshot;
}

export async function getDailyPlannerSnapshotRange(userId: string, dateFrom: string, dateTo: string): Promise<DailyPlannerSnapshot[]> {
  return db
    .select()
    .from(dailyPlannerSnapshots)
    .where(and(eq(dailyPlannerSnapshots.userId, userId), gte(dailyPlannerSnapshots.date, dateFrom), lte(dailyPlannerSnapshots.date, dateTo)))
    .orderBy(asc(dailyPlannerSnapshots.date));
}

// Daily Notes
export async function getDailyNote(userId: string, date: string): Promise<DailyNote | null> {
  const [note] = await db
    .select()
    .from(dailyNotes)
    .where(and(eq(dailyNotes.userId, userId), eq(dailyNotes.date, date)))
    .limit(1);
  return note ?? null;
}

export async function upsertDailyNote(input: CreateDailyNoteInput): Promise<DailyNote> {
  const [note] = await db
    .insert(dailyNotes)
    .values(input)
    .returning();
  return note;
}

export async function updateDailyNote(id: string, userId: string, data: Partial<CreateDailyNoteInput>): Promise<DailyNote | null> {
  const [note] = await db
    .update(dailyNotes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(dailyNotes.id, id), eq(dailyNotes.userId, userId)))
    .returning();
  return note ?? null;
}

// Planner Preferences
export async function getPlannerPreferences(userId: string): Promise<PlannerPreferences | null> {
  const [prefs] = await db
    .select()
    .from(plannerPreferences)
    .where(eq(plannerPreferences.userId, userId))
    .limit(1);
  return prefs ?? null;
}

export async function upsertPlannerPreferences(input: CreatePlannerPreferencesInput): Promise<PlannerPreferences> {
  const [prefs] = await db
    .insert(plannerPreferences)
    .values(input)
    .returning();
  return prefs;
}

export async function deletePlannerPreferences(userId: string): Promise<void> {
  await db
    .delete(plannerPreferences)
    .where(eq(plannerPreferences.userId, userId));
}
