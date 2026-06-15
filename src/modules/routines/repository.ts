import { db } from "@/core/database";
import { and, eq, asc, count, gte, lte, sql, inArray } from "drizzle-orm";
import {
  routines,
  routineItems,
  routineExecutions,
  routineExecutionItems,
  routineTemplates,
  routineTemplateItems,
} from "./schema";

export type Routine = typeof routines.$inferSelect;
export type RoutineItem = typeof routineItems.$inferSelect;
export type RoutineExecution = typeof routineExecutions.$inferSelect;
export type RoutineExecutionItem = typeof routineExecutionItems.$inferSelect;
export type RoutineTemplate = typeof routineTemplates.$inferSelect;
export type RoutineTemplateItem = typeof routineTemplateItems.$inferSelect;

export type CreateRoutineInput = typeof routines.$inferInsert;
export type CreateRoutineItemInput = typeof routineItems.$inferInsert;
export type CreateExecutionInput = typeof routineExecutions.$inferInsert;
export type CreateExecutionItemInput = typeof routineExecutionItems.$inferInsert;
export type CreateTemplateInput = typeof routineTemplates.$inferInsert;
export type CreateTemplateItemInput = typeof routineTemplateItems.$inferInsert;

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
  if (itemIds.length === 0) return items;

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

// ── Templates ──

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
