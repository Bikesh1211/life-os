import { connectToDatabase } from "@/lib/mongodb";
import {
  TimeEntryModel,
  TimeCategoryModel,
  TimeActiveTimerModel,
  TimeBudgetModel,
  TimeUserPreferenceModel,
} from "@/lib/models/time-audit";

export type TimeEntry = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  categoryId: string;
  projectId?: string | null;
  tags: string[];
  startTime: Date;
  endTime?: Date | null;
  durationMinutes?: number | null;
  isBillable: boolean;
  notes?: string | null;
  timelineEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateTimeEntryInput = {
  userId: string;
  title: string;
  description?: string | null;
  categoryId: string;
  projectId?: string | null;
  tags?: string[];
  startTime: Date;
  endTime?: Date | null;
  durationMinutes?: number | null;
  isBillable?: boolean;
  notes?: string | null;
  timelineEventId?: string | null;
};

export type UpdateTimeEntryInput = Partial<Omit<CreateTimeEntryInput, "id" | "userId" | "createdAt">>;

export type TimeCategory = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTimeCategoryInput = {
  userId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder?: number;
  isArchived?: boolean;
};

export type TimeBudget = {
  id: string;
  userId: string;
  categoryId: string;
  period: string;
  targetMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTimeBudgetInput = {
  userId: string;
  categoryId: string;
  period: string;
  targetMinutes: number;
};

export type TimeActiveTimer = {
  id: string;
  userId: string;
  entryId?: string | null;
  startTime: Date;
  elapsedBeforePause: number;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TimeUserPreferences = {
  id: string;
  userId: string;
  widgetVisibility: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

// ─── Time Entries ──────────────────────────────────────────────

export async function createEntry(input: CreateTimeEntryInput) {
  await connectToDatabase();
  const doc = await TimeEntryModel.create({
    ...input,
    tags: input.tags ?? [],
    isBillable: input.isBillable ?? false,
  });
  return toPlain(doc);
}

export async function getEntries(
  userId: string,
  opts: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    projectId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {},
) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };
  if (opts.dateFrom) filter.startTime = { ...filter.startTime, $gte: new Date(opts.dateFrom) };
  if (opts.dateTo) filter.startTime = { ...filter.startTime, $lte: new Date(opts.dateTo) };
  if (opts.categoryId) filter.categoryId = opts.categoryId;
  if (opts.projectId) filter.projectId = opts.projectId;
  if (opts.tags?.length) filter.tags = { $in: opts.tags };

  const docs = await TimeEntryModel.find(filter)
    .sort({ startTime: -1 })
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 200)
    .lean();
  return toPlainArray(docs);
}

export async function getEntryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TimeEntryModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateEntry(id: string, userId: string, input: UpdateTimeEntryInput) {
  await connectToDatabase();
  const doc = await TimeEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TimeEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getOverlappingEntries(
  userId: string,
  startTime: Date,
  endTime: Date | null,
  excludeId?: string,
) {
  await connectToDatabase();
  const filter: any = {
    userId,
    deletedAt: null,
    startTime: { $lt: endTime ?? new Date("2100-01-01") },
    $or: [{ endTime: null }, { endTime: { $gt: startTime } }],
  };
  if (excludeId) filter._id = { $ne: excludeId };

  const docs = await TimeEntryModel.find(filter).limit(5).lean();
  return toPlainArray(docs);
}

export async function getEntriesByDateRange(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const docs = await TimeEntryModel.find({
    userId,
    deletedAt: null,
    startTime: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ startTime: 1 })
    .lean();
  return toPlainArray(docs);
}

// ─── Categories ────────────────────────────────────────────────

export async function createCategory(input: CreateTimeCategoryInput) {
  await connectToDatabase();
  const doc = await TimeCategoryModel.create({
    ...input,
    sortOrder: input.sortOrder ?? 0,
    isArchived: input.isArchived ?? false,
  });
  return toPlain(doc);
}

export async function getCategories(userId: string) {
  await connectToDatabase();
  const docs = await TimeCategoryModel.find({ userId })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateCategory(id: string, userId: string, input: Partial<CreateTimeCategoryInput>) {
  await connectToDatabase();
  const doc = await TimeCategoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteCategory(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TimeCategoryModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

// ─── Active Timer ──────────────────────────────────────────────

export async function upsertActiveTimer(input: {
  userId: string;
  entryId?: string | null;
  startTime: Date;
  elapsedBeforePause?: number;
  isPaused?: boolean;
}) {
  await connectToDatabase();
  const { userId } = input;
  const doc = await TimeActiveTimerModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        entryId: input.entryId ?? null,
        startTime: input.startTime,
        elapsedBeforePause: input.elapsedBeforePause ?? 0,
        isPaused: input.isPaused ?? false,
        updatedAt: new Date(),
      },
      $setOnInsert: { userId },
    },
    { new: true, upsert: true },
  ).lean();
  return toPlain(doc);
}

export async function getActiveTimer(userId: string) {
  await connectToDatabase();
  const doc = await TimeActiveTimerModel.findOne({ userId }).lean();
  return toPlain(doc);
}

export async function deleteActiveTimer(userId: string) {
  await connectToDatabase();
  const doc = await TimeActiveTimerModel.findOneAndDelete({ userId }).lean();
  return toPlain(doc);
}

// ─── Budgets ───────────────────────────────────────────────────

export async function createBudget(input: CreateTimeBudgetInput) {
  await connectToDatabase();
  const doc = await TimeBudgetModel.create(input);
  return toPlain(doc);
}

export async function getBudgets(userId: string) {
  await connectToDatabase();
  const docs = await TimeBudgetModel.find({ userId }).lean();
  return toPlainArray(docs);
}

export async function updateBudget(id: string, userId: string, input: Partial<CreateTimeBudgetInput>) {
  await connectToDatabase();
  const doc = await TimeBudgetModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteBudget(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TimeBudgetModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

// ─── User Preferences ─────────────────────────────────────────

export async function upsertPreferences(userId: string, prefs: Partial<TimeUserPreferences>) {
  await connectToDatabase();
  const doc = await TimeUserPreferenceModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        widgetVisibility: prefs.widgetVisibility ?? {},
        updatedAt: new Date(),
      },
      $setOnInsert: { userId: userId },
    },
    { new: true, upsert: true },
  ).lean();
  return toPlain(doc);
}

export async function getPreferences(userId: string) {
  await connectToDatabase();
  const doc = await TimeUserPreferenceModel.findOne({ userId }).lean();
  return toPlain(doc);
}

// ─── Aggregation Queries ───────────────────────────────────────

export async function getDashboardMetrics(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const [result] = await TimeEntryModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        startTime: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: { $ifNull: ["$durationMinutes", 0] } },
        sessionCount: { $sum: 1 },
        avgDuration: { $avg: { $ifNull: ["$durationMinutes", 0] } },
        maxDuration: { $max: { $ifNull: ["$durationMinutes", 0] } },
        minDuration: { $min: { $ifNull: ["$durationMinutes", 0] } },
      },
    },
  ]);
  return result
    ? {
        totalMinutes: result.totalMinutes,
        sessionCount: result.sessionCount,
        avgDuration: Math.round(result.avgDuration || 0),
        maxDuration: result.maxDuration,
        minDuration: result.minDuration,
      }
    : { totalMinutes: 0, sessionCount: 0, avgDuration: 0, maxDuration: 0, minDuration: 0 };
}

export async function getTimeByCategory(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const results = await TimeEntryModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        startTime: { $gte: dateFrom, $lte: dateTo },
        durationMinutes: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        totalMinutes: { $sum: { $ifNull: ["$durationMinutes", 0] } },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { totalMinutes: -1 } },
  ]);
  return results.map((r: any) => ({
    categoryId: r._id,
    totalMinutes: r.totalMinutes,
    sessionCount: r.sessionCount,
  }));
}

export async function getTimeByProject(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const results = await TimeEntryModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        startTime: { $gte: dateFrom, $lte: dateTo },
        durationMinutes: { $ne: null },
        projectId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$projectId",
        totalMinutes: { $sum: { $ifNull: ["$durationMinutes", 0] } },
        sessionCount: { $sum: 1 },
        avgDuration: { $avg: "$durationMinutes" },
        lastActivity: { $max: "$startTime" },
      },
    },
    { $sort: { totalMinutes: -1 } },
  ]);
  return results.map((r: any) => ({
    projectId: r._id,
    totalMinutes: r.totalMinutes,
    sessionCount: r.sessionCount,
    avgDuration: Math.round(r.avgDuration || 0),
    lastActivity: r.lastActivity,
  }));
}

export async function getTimeByDay(userId: string, dateFrom: Date, dateTo: Date) {
  await connectToDatabase();
  const results = await TimeEntryModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        startTime: { $gte: dateFrom, $lte: dateTo },
        durationMinutes: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
        },
        totalMinutes: { $sum: { $ifNull: ["$durationMinutes", 0] } },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r: any) => ({
    date: r._id,
    totalMinutes: r.totalMinutes,
    sessionCount: r.sessionCount,
  }));
}

export async function getTrackingDates(userId: string) {
  await connectToDatabase();
  const results = await TimeEntryModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  return results.map((r: any) => r._id);
}

export async function getTotalStats(userId: string) {
  await connectToDatabase();
  const [result] = await TimeEntryModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: { $ifNull: ["$durationMinutes", 0] } },
        totalSessions: { $sum: 1 },
      },
    },
  ]);
  return result
    ? { totalMinutes: result.totalMinutes, totalSessions: result.totalSessions }
    : { totalMinutes: 0, totalSessions: 0 };
}
