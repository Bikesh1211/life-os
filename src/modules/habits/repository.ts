import { connectToDatabase } from "@/lib/mongodb";
import { Habit as HabitModel, HabitCompletion as HabitCompletionModel } from "@/lib/models/habits";

export type Habit = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string;
  frequencyType: string;
  frequencyInterval: number | null;
  frequencyWeekdays: number[] | null;
  frequencyMonthDay: number | null;
  color: string;
  icon: string | null;
  targetCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type HabitCompletion = {
  id: string;
  userId: string;
  habitId: string;
  completedDate: string;
  completedAt: Date;
  notes: string | null;
  metadata: unknown;
};

export type CreateHabitInput = Partial<Omit<Habit, "id" | "createdAt" | "updatedAt" | "deletedAt">> & {
  userId: string;
  title: string;
};

export type CreateCompletionInput = {
  userId: string;
  habitId: string;
  completedDate: string;
  notes?: string | null;
  metadata?: unknown;
};

export const habitCategories = [
  "health", "fitness", "learning", "productivity", "mindfulness",
  "social", "creative", "finance", "self-care", "other",
];

function mapHabit(doc: any): Habit {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    description: doc.description ?? null,
    category: doc.category,
    frequency: doc.frequency,
    frequencyType: doc.frequencyType,
    frequencyInterval: doc.frequencyInterval ?? null,
    frequencyWeekdays: doc.frequencyWeekdays ?? null,
    frequencyMonthDay: doc.frequencyMonthDay ?? null,
    color: doc.color,
    icon: doc.icon ?? null,
    targetCount: doc.targetCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt ?? null,
  };
}

function mapCompletion(doc: any): HabitCompletion {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    habitId: doc.habitId,
    completedDate: doc.completedDate,
    completedAt: doc.completedAt,
    notes: doc.notes ?? null,
    metadata: doc.metadata ?? null,
  };
}

export async function getHabits(userId: string) {
  await connectToDatabase();
  const docs = await HabitModel.find({ userId, deletedAt: null })
    .sort({ createdAt: 1 })
    .lean();
  return docs.map(mapHabit);
}

export async function getHabitById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await HabitModel.findOne({ _id: id, userId }).lean();
  return doc ? mapHabit(doc) : null;
}

export async function createCompletion(input: CreateCompletionInput) {
  await connectToDatabase();
  const doc = await HabitCompletionModel.create({
    userId: input.userId,
    habitId: input.habitId,
    completedDate: input.completedDate,
    completedAt: new Date(),
    notes: input.notes ?? undefined,
    metadata: input.metadata ?? undefined,
  } as any);
  return mapCompletion(doc.toObject());
}

export async function getCompletions(
  userId: string,
  opts: { habitId?: string; dateFrom?: string; dateTo?: string } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  if (opts.habitId) filter.habitId = opts.habitId;
  if (opts.dateFrom || opts.dateTo) {
    filter.completedDate = {};
    if (opts.dateFrom) filter.completedDate.$gte = opts.dateFrom;
    if (opts.dateTo) filter.completedDate.$lte = opts.dateTo;
  }
  const docs = await HabitCompletionModel.find(filter)
    .sort({ completedDate: -1 })
    .lean();
  return docs.map(mapCompletion);
}

export async function getOverallStats(userId: string) {
  await connectToDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [totalHabits, activeHabits, completedToday, previousCompletedToday] = await Promise.all([
    HabitModel.countDocuments({ userId, deletedAt: null }),
    HabitModel.countDocuments({ userId, deletedAt: null }),
    HabitCompletionModel.countDocuments({ userId, completedDate: today }),
    HabitCompletionModel.countDocuments({ userId, completedDate: thirtyDaysAgo }),
  ]);

  return {
    totalHabits,
    activeHabits,
    completedToday,
    previousCompletedToday,
  };
}

export async function getCompletionRate(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const activeHabits = await HabitModel.find({ userId, deletedAt: null })
    .select({ _id: 1, frequency: 1, frequencyType: 1, frequencyInterval: 1, frequencyWeekdays: 1 })
    .lean();

  if (activeHabits.length === 0) return { rate: 0, totalExpected: 0, totalCompleted: 0 };

  const completions = await HabitCompletionModel.aggregate([
    {
      $match: {
        userId,
        completedDate: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: "$habitId",
        count: { $sum: 1 },
      },
    },
  ]);

  const daysInRange = Math.max(
    1,
    Math.round(
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000,
    ),
  );

  const completionMap = new Map<string, number>(completions.map((c: any) => [c._id, c.count]));
  let totalCompleted = 0;
  let totalExpected = 0;

  const weeksInRange = Math.max(1, Math.round(daysInRange / 7));
  const monthsInRange = Math.max(1, Math.round(daysInRange / 30));

  for (const habit of activeHabits) {
    const id = habit._id.toString();
    const completed: number = completionMap.get(id) ?? 0;
    totalCompleted += completed;

    if (habit.frequencyType === "every_x_days" && habit.frequencyInterval) {
      totalExpected += Math.max(1, Math.round(daysInRange / habit.frequencyInterval));
    } else if (habit.frequencyType === "every_x_weeks" && habit.frequencyInterval) {
      totalExpected += Math.max(1, Math.round(weeksInRange / habit.frequencyInterval));
    } else if (habit.frequencyType === "specific_weekdays" && habit.frequencyWeekdays) {
      const weekdayCount = habit.frequencyWeekdays.length;
      totalExpected += Math.max(1, Math.round((daysInRange / 7) * weekdayCount));
    } else if (habit.frequencyType === "specific_dates") {
      totalExpected += Math.max(1, Math.round(monthsInRange));
    } else {
      if (habit.frequency === "daily") totalExpected += daysInRange;
      else if (habit.frequency === "weekly") totalExpected += weeksInRange;
      else if (habit.frequency === "monthly") totalExpected += monthsInRange;
    }
  }

  return {
    rate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0,
    totalCompleted,
    totalExpected,
  };
}

export async function getCompletionRatesByHabit(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const activeHabits = await HabitModel.find({ userId, deletedAt: null }).lean();

  const completions = await HabitCompletionModel.aggregate([
    {
      $match: {
        userId,
        completedDate: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: "$habitId",
        count: { $sum: 1 },
      },
    },
  ]);

  const completionMap = new Map<string, number>(completions.map((c: any) => [c._id, c.count]));
  const daysInRange = Math.max(
    1,
    Math.round(
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000,
    ),
  );

  const weeksInRange = Math.max(1, Math.round(daysInRange / 7));
  const monthsInRange = Math.max(1, Math.round(daysInRange / 30));

  return activeHabits
    .map((habit: any) => {
      const id = habit._id.toString();
      const completed = completionMap.get(id) ?? 0;
      let expected = 0;

      if (habit.frequencyType === "every_x_days" && habit.frequencyInterval) {
        expected = Math.max(1, Math.round(daysInRange / habit.frequencyInterval));
      } else if (habit.frequencyType === "every_x_weeks" && habit.frequencyInterval) {
        expected = Math.max(1, Math.round(weeksInRange / habit.frequencyInterval));
      } else if (habit.frequencyType === "specific_weekdays" && habit.frequencyWeekdays) {
        const weekdayCount = habit.frequencyWeekdays.length;
        expected = Math.max(1, Math.round((daysInRange / 7) * weekdayCount));
      } else if (habit.frequencyType === "specific_dates") {
        expected = Math.max(1, Math.round(monthsInRange));
      } else {
        if (habit.frequency === "daily") expected = daysInRange;
        else if (habit.frequency === "weekly") expected = weeksInRange;
        else if (habit.frequency === "monthly") expected = monthsInRange;
      }

      return {
        habitId: id,
        title: habit.title,
        category: habit.category,
        frequency: habit.frequency,
        frequencyType: habit.frequencyType,
        completed,
        expected,
        rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      };
    })
    .sort((a: any, b: any) => b.rate - a.rate);
}

export async function getDailyCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await HabitCompletionModel.aggregate([
    {
      $match: {
        userId,
        completedDate: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: "$completedDate",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return rows.map((r: any) => ({ date: r._id, count: r.count }));
}

export async function getCategoryDistribution(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await HabitCompletionModel.aggregate([
    {
      $match: {
        userId,
        completedDate: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $lookup: {
        from: "habits",
        localField: "habitId",
        foreignField: "_id",
        as: "habit",
      },
    },
    { $unwind: { path: "$habit", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$habit.category",
        completed: { $sum: 1 },
      },
    },
  ]);

  return rows.map((r: any) => ({
    category: r._id ?? "uncategorized",
    completed: r.completed,
  }));
}

export async function getHeatmapData(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const rows = await HabitCompletionModel.aggregate([
    {
      $match: {
        userId,
        completedDate: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $group: {
        _id: "$completedDate",
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map<string, number>(rows.map((r: any) => [r._id, r.count]));
  const result: Array<{ date: string; count: number }> = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: (map.get(key) ?? 0) as number });
  }
  return result;
}

/**
 * The distinct dates on which something was completed, oldest first.
 */
export async function getCompletionDates(userId: string, habitId?: string) {
  await connectToDatabase();
  const filter: any = { userId };
  if (habitId) filter.habitId = habitId;

  const rows = await HabitCompletionModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$completedDate",
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return rows.map((r: any) => r._id);
}

export async function getHabitsWithCompletions(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const activeHabits = await HabitModel.find({ userId, deletedAt: null }).lean();

  const completions = await HabitCompletionModel.find({
    userId,
    completedDate: { $gte: dateFrom, $lte: dateTo },
  })
    .select({ habitId: 1, completedDate: 1, _id: 0 })
    .sort({ completedDate: 1 })
    .lean();

  const grouped = new Map<string, string[]>();
  for (const c of completions) {
    const hid = String(c.habitId);
    const arr = grouped.get(hid) ?? [];
    arr.push(String(c.completedDate));
    grouped.set(hid, arr);
  }

  return activeHabits.map((h: any) => ({
    ...mapHabit(h),
    completionDates: grouped.get(h._id.toString()) ?? [],
  }));
}

export async function getHabitCount(userId: string) {
  await connectToDatabase();
  return HabitModel.countDocuments({ userId, deletedAt: null });
}
