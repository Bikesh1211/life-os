import { connectToDatabase } from "@/lib/mongodb";
import {
  CurbCategoryModel,
  CurbHabitModel,
  CurbLogModel,
} from "@/lib/models/curb";

export type CurbCategory = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCategoryInput = {
  userId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder?: number;
};

export type CurbHabit = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  categoryId?: string | null;
  limitType: string;
  limitValue: number;
  color: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateHabitInput = {
  userId: string;
  name: string;
  icon: string;
  categoryId?: string | null;
  limitType?: string;
  limitValue?: number;
  color: string;
  sortOrder?: number;
  isArchived?: boolean;
};

export type CurbLog = {
  id: string;
  userId: string;
  habitId: string;
  loggedAt: Date;
  trigger?: string | null;
  mood?: string | null;
  note?: string | null;
  createdAt: Date;
};

export type CreateLogInput = {
  userId: string;
  habitId: string;
  loggedAt: Date;
  trigger?: string | null;
  mood?: string | null;
  note?: string | null;
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

/* ── Categories ── */

export async function getCategories(userId: string) {
  await connectToDatabase();
  const docs = await CurbCategoryModel.find({ userId }).sort({ sortOrder: 1 }).lean();
  return toPlainArray(docs);
}

export async function getCategoryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbCategoryModel.findOne({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function createCategory(input: CreateCategoryInput) {
  await connectToDatabase();
  const doc = await CurbCategoryModel.create({
    ...input,
    sortOrder: input.sortOrder ?? 0,
  });
  return toPlain(doc);
}

export async function updateCategory(id: string, userId: string, input: Partial<CreateCategoryInput>) {
  await connectToDatabase();
  const doc = await CurbCategoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteCategory(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbCategoryModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

/* ── Habits ── */

export async function getHabits(userId: string, opts: { categoryId?: string; includeArchived?: boolean } = {}) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };
  if (opts.categoryId) filter.categoryId = opts.categoryId;
  if (!opts.includeArchived) filter.isArchived = false;

  const docs = await CurbHabitModel.find(filter).sort({ sortOrder: 1 }).lean();
  return toPlainArray(docs);
}

export async function getHabitById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbHabitModel.findOne({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function createHabit(input: CreateHabitInput) {
  await connectToDatabase();
  const doc = await CurbHabitModel.create({
    ...input,
    limitType: input.limitType ?? "daily",
    limitValue: input.limitValue ?? 0,
    sortOrder: input.sortOrder ?? 0,
    isArchived: input.isArchived ?? false,
  });
  return toPlain(doc);
}

export async function updateHabit(id: string, userId: string, input: Partial<CreateHabitInput>) {
  await connectToDatabase();
  const doc = await CurbHabitModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function softDeleteHabit(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbHabitModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getHabitCount(userId: string) {
  await connectToDatabase();
  const count = await CurbHabitModel.countDocuments({ userId, deletedAt: null, isArchived: false });
  return count;
}

/* ── Logs ── */

export async function createLog(input: CreateLogInput) {
  await connectToDatabase();
  const doc = await CurbLogModel.create(input);
  return toPlain(doc);
}

export async function getLastLog(habitId: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbLogModel.findOne({ habitId, userId }).sort({ loggedAt: -1 }).lean();
  return toPlain(doc);
}

export async function deleteLog(id: string, userId: string) {
  await connectToDatabase();
  const doc = await CurbLogModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function getLogsForHabit(habitId: string, userId: string, dateFrom?: string, dateTo?: string) {
  await connectToDatabase();
  const filter: any = { habitId, userId };
  if (dateFrom || dateTo) {
    filter.loggedAt = {};
    if (dateFrom) filter.loggedAt.$gte = new Date(dateFrom);
    if (dateTo) filter.loggedAt.$lte = new Date(dateTo + "T23:59:59.999Z");
  }
  const docs = await CurbLogModel.find(filter).sort({ loggedAt: -1 }).lean();
  return toPlainArray(docs);
}

export async function getLogsForDateRange(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const docs = await CurbLogModel.find({
    userId,
    loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
  })
    .sort({ loggedAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getTodayLogs(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return getLogsForDateRange(userId, today, today);
}

export async function getTodayCount(habitId: string, userId: string) {
  await connectToDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const count = await CurbLogModel.countDocuments({
    habitId,
    userId,
    loggedAt: { $gte: new Date(today), $lte: new Date(today + "T23:59:59.999Z") },
  });
  return count;
}

export async function getPeriodCount(habitId: string, userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const count = await CurbLogModel.countDocuments({
    habitId,
    userId,
    loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
  });
  return count;
}

export async function getHabitLogsWithCounts(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    {
      $match: {
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
      },
    },
    {
      $group: {
        _id: "$habitId",
        count: { $sum: 1 },
      },
    },
  ]);
  return results.map((r: any) => ({ habitId: r._id, count: r.count }));
}

/* ── Analytics ── */

export async function getDailyCounts(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    {
      $match: {
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$loggedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r: any) => ({ date: r._id, count: r.count }));
}

export async function getTriggerDistribution(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    {
      $match: {
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
        trigger: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$trigger",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  return results.map((r: any) => ({ trigger: r._id, count: r.count }));
}

export async function getMoodDistribution(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    {
      $match: {
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
        mood: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$mood",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  return results.map((r: any) => ({ mood: r._id, count: r.count }));
}

export async function getHourlyDistribution(habitId: string, userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    {
      $match: {
        habitId,
        userId,
        loggedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59.999Z") },
      },
    },
    {
      $group: {
        _id: { $hour: "$loggedAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r: any) => ({ hour: r._id, count: r.count }));
}

export async function getHabitStreakDates(userId: string, habitId: string) {
  await connectToDatabase();
  const results = await CurbLogModel.aggregate([
    { $match: { habitId, userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$loggedAt" } },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  return results.map((r: any) => r._id);
}
