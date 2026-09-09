import { connectToDatabase } from "@/lib/mongodb";
import {
  RoutineModel,
  RoutineItemModel,
  RoutineExecutionModel,
  RoutineExecutionItemModel,
  RoutineTemplateModel,
  RoutineTemplateItemModel,
  DailyGoalModel,
  DailyPriorityModel,
  DailyPlannerSnapshotModel,
  DailyNoteModel,
  PlannerPreferenceModel,
} from "@/lib/models/routines";

function mapDoc(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

function mapDocs(docs: any[]) {
  return docs.map((doc) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const { _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  });
}

export type Routine = Awaited<ReturnType<typeof getRoutines>>[number];
export type RoutineItem = Awaited<ReturnType<typeof getRoutineItems>>[number];
export type RoutineExecution = Awaited<ReturnType<typeof getExecution>> & {};
export type RoutineExecutionItem = any;
export type RoutineTemplate = any;
export type RoutineTemplateItem = any;
export type DailyGoal = any;
export type DailyPriority = any;
export type DailyPlannerSnapshot = any;
export type DailyNote = any;
export type PlannerPreferences = any;

export type CreateRoutineInput = {
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  scheduleType?: string;
  customDays?: string[];
};

export type CreateRoutineItemInput = {
  routineId?: string;
  userId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  order?: number;
  isOptional?: boolean;
  category?: string;
  priority?: string;
  location?: string;
  date?: string;
  status?: string;
  linkedHabitId?: string;
  linkedTaskId?: string;
};

export type CreateExecutionInput = {
  routineId: string;
  userId: string;
  date: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status?: string;
  completionRate?: number;
};

export type CreateExecutionItemInput = {
  executionId: string;
  routineItemId: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status?: string;
};

export type CreateTemplateInput = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  scheduleType?: string;
  customDays?: string[];
};

export type CreateTemplateItemInput = {
  templateId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  order?: number;
  isOptional?: boolean;
};

export type CreateDailyGoalInput = {
  userId: string;
  date: string;
  title: string;
  isCompleted?: boolean;
  taskId?: string;
};

export type CreateDailyPriorityInput = {
  userId: string;
  date: string;
  title: string;
  estimatedDuration?: number;
  status?: string;
  sortOrder?: number;
  taskId?: string;
};

export type CreateDailyPlannerSnapshotInput = {
  userId: string;
  date: string;
  productivityScore: number;
  subScores?: Record<string, unknown>;
  tasksCompleted?: number;
  tasksTotal?: number;
  focusMinutes?: number;
  habitsCompleted?: number;
  habitsTotal?: number;
  dailyGoalCompleted?: boolean;
};

export type CreateDailyNoteInput = {
  userId: string;
  date: string;
  content?: string;
};

export type CreatePlannerPreferencesInput = {
  userId: string;
  morningReminderTime?: string;
  eveningReminderTime?: string;
  notificationConfig?: Record<string, unknown>;
};

export type DayMetrics = Awaited<ReturnType<typeof getDayMetrics>>;

// ── Routines ──

export async function getRoutines(userId: string) {
  await connectToDatabase();
  const docs = await RoutineModel.find({ userId }).sort({ createdAt: 1 }).lean();
  return mapDocs(docs);
}

export async function getActiveRoutines(userId: string) {
  await connectToDatabase();
  const docs = await RoutineModel.find({ userId, isActive: true }).sort({ createdAt: 1 }).lean();
  return mapDocs(docs);
}

export async function getRoutineById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await RoutineModel.findOne({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function createRoutine(input: CreateRoutineInput) {
  await connectToDatabase();
  const doc = await RoutineModel.create(input);
  return mapDoc(doc);
}

export async function updateRoutine(id: string, userId: string, input: Partial<CreateRoutineInput>) {
  await connectToDatabase();
  const doc = await RoutineModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteRoutine(id: string, userId: string) {
  await connectToDatabase();
  const doc = await RoutineModel.findOneAndDelete({ _id: id, userId }).lean();
  return mapDoc(doc);
}

export async function getRoutineCount(userId: string) {
  await connectToDatabase();
  return RoutineModel.countDocuments({ userId });
}

// ── Routine Items ──

export async function getRoutineItems(routineId: string) {
  await connectToDatabase();
  const docs = await RoutineItemModel.find({ routineId }).sort({ order: 1 }).lean();
  return mapDocs(docs);
}

export async function getRoutineItemsByRoutineIds(routineIds: string[]) {
  if (routineIds.length === 0) return [];
  await connectToDatabase();
  const docs = await RoutineItemModel.find({ routineId: { $in: routineIds } }).sort({ order: 1 }).lean();
  return mapDocs(docs);
}

export async function getRoutineItemById(id: string) {
  await connectToDatabase();
  const doc = await RoutineItemModel.findOne({ _id: id }).lean();
  return mapDoc(doc);
}

export async function createRoutineItem(input: CreateRoutineItemInput) {
  await connectToDatabase();
  const doc = await RoutineItemModel.create(input);
  return mapDoc(doc);
}

export async function createRoutineItems(inputs: CreateRoutineItemInput[]) {
  if (inputs.length === 0) return [];
  await connectToDatabase();
  const docs = await RoutineItemModel.insertMany(inputs);
  return mapDocs(docs);
}

export async function updateRoutineItem(id: string, input: Partial<CreateRoutineItemInput>) {
  await connectToDatabase();
  const doc = await RoutineItemModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteRoutineItem(id: string) {
  await connectToDatabase();
  const doc = await RoutineItemModel.findOneAndDelete({ _id: id }).lean();
  return mapDoc(doc);
}

export async function reorderRoutineItems(items: Array<{ id: string; order: number }>) {
  await connectToDatabase();
  await Promise.all(
    items.map((item) =>
      RoutineItemModel.findOneAndUpdate(
        { _id: item.id },
        { order: item.order, updatedAt: new Date() },
      ),
    ),
  );
}

// ── Executions ──

export async function getExecution(executionId: string, userId: string) {
  await connectToDatabase();
  const doc = await RoutineExecutionModel.findOne({ _id: executionId, userId }).lean();
  return mapDoc(doc);
}

export async function getExecutionByRoutineAndDate(routineId: string, date: string) {
  await connectToDatabase();
  const doc = await RoutineExecutionModel.findOne({ routineId, date }).lean();
  return mapDoc(doc);
}

export async function getExecutionsByRoutineIdsAndDate(routineIds: string[], date: string) {
  if (routineIds.length === 0) return [];
  await connectToDatabase();
  const docs = await RoutineExecutionModel.find({ routineId: { $in: routineIds }, date }).lean();
  return mapDocs(docs);
}

export async function createExecution(input: CreateExecutionInput) {
  await connectToDatabase();
  const doc = await RoutineExecutionModel.create(input);
  return mapDoc(doc);
}

export async function updateExecution(id: string, input: Partial<CreateExecutionInput>) {
  await connectToDatabase();
  const doc = await RoutineExecutionModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function getExecutionsForDate(userId: string, date: string) {
  await connectToDatabase();
  const docs = await RoutineExecutionModel.find({ userId, date }).sort({ createdAt: 1 }).lean();
  return mapDocs(docs);
}

export async function getExecutionsInRange(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const docs = await RoutineExecutionModel.find({
    userId,
    date: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ date: 1 })
    .lean();
  return mapDocs(docs);
}

export async function getExecutionCount(userId: string) {
  await connectToDatabase();
  return RoutineExecutionModel.countDocuments({ userId });
}

// ── Execution Items ──

export async function getExecutionItems(executionId: string) {
  await connectToDatabase();
  const items = await RoutineExecutionItemModel.find({ executionId }).sort({ createdAt: 1 }).lean();
  const mappedItems = mapDocs(items);

  const itemIds = mappedItems.map((i: any) => i.routineItemId);
  if (itemIds.length === 0) return mappedItems.map((ei: any) => ({ ...ei, routineItem: null }));

  const routineItemDocs = await RoutineItemModel.find({ _id: { $in: itemIds } }).lean();
  const routineItemMap = new Map(routineItemDocs.map((r: any) => [r._id.toString(), mapDoc(r)]));

  return mappedItems.map((ei: any) => ({
    ...ei,
    routineItem: routineItemMap.get(ei.routineItemId) ?? null,
  }));
}

export async function getExecutionItemsByExecutionIds(executionIds: string[]) {
  if (executionIds.length === 0) return [];
  await connectToDatabase();
  const items = await RoutineExecutionItemModel.find({ executionId: { $in: executionIds } })
    .sort({ createdAt: 1 })
    .lean();
  const mappedItems = mapDocs(items);

  const itemIds = mappedItems.map((i: any) => i.routineItemId);
  if (itemIds.length === 0) return mappedItems.map((ei: any) => ({ ...ei, routineItem: null }));

  const routineItemDocs = await RoutineItemModel.find({ _id: { $in: itemIds } }).lean();
  const routineItemMap = new Map(routineItemDocs.map((r: any) => [r._id.toString(), mapDoc(r)]));

  return mappedItems.map((ei: any) => ({
    ...ei,
    routineItem: routineItemMap.get(ei.routineItemId) ?? null,
  }));
}

export async function createExecutionItem(input: CreateExecutionItemInput) {
  await connectToDatabase();
  const doc = await RoutineExecutionItemModel.create(input);
  return mapDoc(doc);
}

export async function createExecutionItems(inputs: CreateExecutionItemInput[]) {
  if (inputs.length === 0) return [];
  await connectToDatabase();
  const docs = await RoutineExecutionItemModel.insertMany(inputs);
  return mapDocs(docs);
}

export async function updateExecutionItem(id: string, input: Partial<CreateExecutionItemInput>) {
  await connectToDatabase();
  const doc = await RoutineExecutionItemModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function getExecutionItemById(id: string) {
  await connectToDatabase();
  const doc = await RoutineExecutionItemModel.findOne({ _id: id }).lean();
  return mapDoc(doc);
}

export async function getExecutionItemCountByStatus(
  executionId: string,
  status: "pending" | "in_progress" | "completed" | "skipped",
) {
  await connectToDatabase();
  return RoutineExecutionItemModel.countDocuments({ executionId, status });
}

// ── Day Plan / Ad-hoc Items ──

export async function getAdhocItemsForDate(userId: string, date: string) {
  await connectToDatabase();
  const docs = await RoutineItemModel.find({
    routineId: null,
    userId,
    date,
  })
    .sort({ startTime: 1 })
    .lean();
  return mapDocs(docs);
}

export async function getExecutionsForDateWithItems(userId: string, date: string) {
  await connectToDatabase();
  const executionDocs = await RoutineExecutionModel.find({ userId, date })
    .sort({ createdAt: 1 })
    .lean();

  if (executionDocs.length === 0) return [];

  const executions = mapDocs(executionDocs);
  const executionIds = executions.map((e: any) => e.id);

  const itemDocs = await RoutineExecutionItemModel.find({ executionId: { $in: executionIds } })
    .sort({ createdAt: 1 })
    .lean();
  const allExecutionItems = mapDocs(itemDocs);

  const routineItemIds = [...new Set(allExecutionItems.map((ei: any) => ei.routineItemId))];
  const routineItemDocs = routineItemIds.length > 0
    ? await RoutineItemModel.find({ _id: { $in: routineItemIds } }).lean()
    : [];
  const itemMap = new Map(routineItemDocs.map((r: any) => [r._id.toString(), mapDoc(r)]));

  const itemsByExecution = new Map<string, any[]>();
  for (const ei of allExecutionItems) {
    const existing = itemsByExecution.get(ei.executionId) ?? [];
    existing.push(ei);
    itemsByExecution.set(ei.executionId, existing);
  }

  return executions.map((execution: any) => {
    const executionItems = (itemsByExecution.get(execution.id) ?? []).map((ei: any) => ({
      ...ei,
      routineItem: itemMap.get(ei.routineItemId) ?? null,
    }));
    return { execution, executionItems };
  });
}

export async function getRoutineItemsForDate(routineId: string) {
  await connectToDatabase();
  const docs = await RoutineItemModel.find({ routineId }).sort({ startTime: 1 }).lean();
  return mapDocs(docs);
}

export async function checkTimeOverlap(params: {
  startTime: string;
  endTime?: string | null;
  date?: string | null;
  routineId?: string | null;
  excludeItemId?: string;
}) {
  const { startTime, endTime, date, routineId, excludeItemId } = params;
  await connectToDatabase();

  const filter: any = {};
  if (routineId) filter.routineId = routineId;
  if (date) filter.date = date;
  if (excludeItemId) filter._id = { $ne: excludeItemId };

  if (endTime) {
    filter.$or = [
      { startTime: { $gte: startTime, $lte: endTime } },
      { startTime: { $gte: startTime }, endTime: null },
    ];
  } else {
    filter.startTime = startTime;
  }

  const count = await RoutineItemModel.countDocuments(filter);
  return count > 0;
}

export async function getDayMetrics(userId: string, date: string) {
  await connectToDatabase();

  const [executionDocs, adhocDocs] = await Promise.all([
    RoutineExecutionModel.find({ userId, date }).lean(),
    RoutineItemModel.find({ routineId: null, userId, date }).lean(),
  ]);

  const executions = mapDocs(executionDocs);
  const adhocItems = mapDocs(adhocDocs);

  let totalItems = 0;
  let completedItems = 0;

  const executionIds = executions.map((e: any) => e.id);
  if (executionIds.length > 0) {
    const stats = await RoutineExecutionItemModel.aggregate([
      { $match: { executionId: { $in: executionIds.map((id: string) => id) } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    totalItems += stats[0]?.total ?? 0;
    completedItems += stats[0]?.completed ?? 0;
  }

  if (adhocItems.length > 0) {
    totalItems += adhocItems.length;
    completedItems += adhocItems.filter((i: any) => i.status === "completed").length;
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
  await connectToDatabase();
  const docs = await RoutineTemplateModel.find().sort({ createdAt: 1 }).lean();
  return mapDocs(docs);
}

export async function getTemplateById(id: string) {
  await connectToDatabase();
  const doc = await RoutineTemplateModel.findOne({ _id: id }).lean();
  return mapDoc(doc);
}

export async function createTemplate(input: CreateTemplateInput) {
  await connectToDatabase();
  const doc = await RoutineTemplateModel.create(input);
  return mapDoc(doc);
}

export async function getTemplateItems(templateId: string) {
  await connectToDatabase();
  const docs = await RoutineTemplateItemModel.find({ templateId }).sort({ order: 1 }).lean();
  return mapDocs(docs);
}

export async function createTemplateItem(input: CreateTemplateItemInput) {
  await connectToDatabase();
  const doc = await RoutineTemplateItemModel.create(input);
  return mapDoc(doc);
}

export async function createTemplateItems(inputs: CreateTemplateItemInput[]) {
  if (inputs.length === 0) return [];
  await connectToDatabase();
  const docs = await RoutineTemplateItemModel.insertMany(inputs);
  return mapDocs(docs);
}

// ── Analytics ──

export async function getCompletionRate(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const result = await RoutineExecutionModel.aggregate([
    { $match: { userId, date: { $gte: dateFrom, $lte: dateTo } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        skipped: { $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] } },
        missed: { $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] } },
      },
    },
  ]);

  const total = result[0]?.total ?? 0;
  const completed = result[0]?.completed ?? 0;
  const skipped = result[0]?.skipped ?? 0;
  const missed = result[0]?.missed ?? 0;

  return {
    total,
    completed,
    skipped,
    missed,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getDailyCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await RoutineExecutionModel.aggregate([
    { $match: { userId, date: { $gte: dateFrom, $lte: dateTo } } },
    {
      $group: {
        _id: "$date",
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r: any) => ({
    date: r._id,
    completed: r.completed,
    total: r.total,
    rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
  }));
}

export async function getRoutinePerformance(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await RoutineExecutionModel.aggregate([
    { $match: { userId, date: { $gte: dateFrom, $lte: dateTo } } },
    {
      $group: {
        _id: "$routineId",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        avgCompletionRate: { $avg: "$completionRate" },
      },
    },
  ]);

  return rows.map((r: any) => ({
    routineId: r._id?.toString() ?? null,
    total: r.total,
    completed: r.completed,
    avgCompletionRate: Math.round(r.avgCompletionRate ?? 0),
    rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
  }));
}

export async function getItemCompletionStats(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await RoutineExecutionItemModel.aggregate([
    {
      $lookup: {
        from: "routineexecutions",
        localField: "executionId",
        foreignField: "_id",
        as: "execution",
      },
    },
    { $unwind: "$execution" },
    {
      $match: {
        "execution.userId": userId,
        "execution.date": { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: "$routineItemId",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        skipped: { $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] } },
      },
    },
  ]);

  return rows.map((r: any) => ({
    routineItemId: r._id?.toString() ?? null,
    total: r.total,
    completed: r.completed,
    skipped: r.skipped,
    rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
  }));
}

// ── Daily Planner ──

// Daily Goal
export async function getDailyGoal(userId: string, date: string): Promise<DailyGoal | null> {
  await connectToDatabase();
  const doc = await DailyGoalModel.findOne({ userId, date }).lean();
  return mapDoc(doc);
}

export async function upsertDailyGoal(input: CreateDailyGoalInput): Promise<DailyGoal> {
  await connectToDatabase();
  const existing = await DailyGoalModel.findOne({ userId: input.userId, date: input.date }).lean();
  if (existing) {
    const doc = await DailyGoalModel.findOneAndUpdate(
      { _id: existing._id },
      { title: input.title, isCompleted: input.isCompleted ?? false, taskId: input.taskId ?? null, updatedAt: new Date() },
      { new: true },
    ).lean();
    return mapDoc(doc);
  }
  const doc = await DailyGoalModel.create(input);
  return mapDoc(doc);
}

export async function updateDailyGoal(id: string, userId: string, data: Partial<CreateDailyGoalInput>): Promise<DailyGoal | null> {
  await connectToDatabase();
  const doc = await DailyGoalModel.findOneAndUpdate(
    { _id: id, userId },
    { ...data, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

// Daily Priorities
export async function getDailyPriorities(userId: string, date: string): Promise<DailyPriority[]> {
  await connectToDatabase();
  const docs = await DailyPriorityModel.find({ userId, date }).sort({ sortOrder: 1 }).lean();
  return mapDocs(docs);
}

export async function createDailyPriority(input: CreateDailyPriorityInput): Promise<DailyPriority> {
  await connectToDatabase();
  const doc = await DailyPriorityModel.create(input);
  return mapDoc(doc);
}

export async function updateDailyPriority(id: string, userId: string, data: Partial<CreateDailyPriorityInput>): Promise<DailyPriority | null> {
  await connectToDatabase();
  const doc = await DailyPriorityModel.findOneAndUpdate(
    { _id: id, userId },
    { ...data, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

export async function deleteDailyPriority(id: string, userId: string): Promise<void> {
  await connectToDatabase();
  await DailyPriorityModel.findOneAndDelete({ _id: id, userId });
}

// Daily Planner Snapshot
export async function getDailyPlannerSnapshot(userId: string, date: string): Promise<DailyPlannerSnapshot | null> {
  await connectToDatabase();
  const doc = await DailyPlannerSnapshotModel.findOne({ userId, date }).lean();
  return mapDoc(doc);
}

export async function upsertDailyPlannerSnapshot(input: CreateDailyPlannerSnapshotInput): Promise<DailyPlannerSnapshot> {
  await connectToDatabase();
  const doc = await DailyPlannerSnapshotModel.create(input);
  return mapDoc(doc);
}

export async function getDailyPlannerSnapshotRange(userId: string, dateFrom: string, dateTo: string): Promise<DailyPlannerSnapshot[]> {
  await connectToDatabase();
  const docs = await DailyPlannerSnapshotModel.find({
    userId,
    date: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ date: 1 })
    .lean();
  return mapDocs(docs);
}

// Daily Notes
export async function getDailyNote(userId: string, date: string): Promise<DailyNote | null> {
  await connectToDatabase();
  const doc = await DailyNoteModel.findOne({ userId, date }).lean();
  return mapDoc(doc);
}

export async function upsertDailyNote(input: CreateDailyNoteInput): Promise<DailyNote> {
  await connectToDatabase();
  const doc = await DailyNoteModel.create(input);
  return mapDoc(doc);
}

export async function updateDailyNote(id: string, userId: string, data: Partial<CreateDailyNoteInput>): Promise<DailyNote | null> {
  await connectToDatabase();
  const doc = await DailyNoteModel.findOneAndUpdate(
    { _id: id, userId },
    { ...data, updatedAt: new Date() },
    { new: true },
  ).lean();
  return mapDoc(doc);
}

// Planner Preferences
export async function getPlannerPreferences(userId: string): Promise<PlannerPreferences | null> {
  await connectToDatabase();
  const doc = await PlannerPreferenceModel.findOne({ userId }).lean();
  return mapDoc(doc);
}

export async function upsertPlannerPreferences(input: CreatePlannerPreferencesInput): Promise<PlannerPreferences> {
  await connectToDatabase();
  const doc = await PlannerPreferenceModel.create(input);
  return mapDoc(doc);
}

export async function deletePlannerPreferences(userId: string): Promise<void> {
  await connectToDatabase();
  await PlannerPreferenceModel.findOneAndDelete({ userId });
}
