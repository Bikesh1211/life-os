import { z } from "zod";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import * as repo from "./repository";

dayjs.extend(isoWeek);

// ─── Constants ─────────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { name: "Work", icon: "briefcase", color: "blue" },
  { name: "Deep Work", icon: "brain", color: "indigo" },
  { name: "Learning", icon: "book", color: "violet" },
  { name: "Reading", icon: "bookOpen", color: "grape" },
  { name: "Writing", icon: "pencil", color: "pink" },
  { name: "Exercise", icon: "run", color: "red" },
  { name: "Meetings", icon: "users", color: "orange" },
  { name: "Planning", icon: "calendar", color: "yellow" },
  { name: "Personal", icon: "user", color: "teal" },
  { name: "Entertainment", icon: "deviceTv", color: "cyan" },
  { name: "Gaming", icon: "gamepad", color: "lime" },
  { name: "Family", icon: "heart", color: "red" },
  { name: "Sleep", icon: "moon", color: "dark" },
  { name: "Break", icon: "coffee", color: "gray" },
  { name: "Other", icon: "dots", color: "gray" },
] as const;

// ─── Zod Schemas ───────────────────────────────────────────────

export const createEntrySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  durationMinutes: z.number().int().min(0).optional(),
  isBillable: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateEntrySchema = createEntrySchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  period: z.enum(["weekly", "monthly"]),
  targetMinutes: z.number().int().min(1),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const startTimerSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isBillable: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
});

export const dashboardQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.enum(["today", "week", "month", "year"]).optional(),
});

export type CreateEntryParams = z.infer<typeof createEntrySchema>;
export type UpdateEntryParams = z.infer<typeof updateEntrySchema>;
export type CreateCategoryParams = z.infer<typeof createCategorySchema>;
export type UpdateCategoryParams = z.infer<typeof updateCategorySchema>;
export type CreateBudgetParams = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetParams = z.infer<typeof updateBudgetSchema>;
export type StartTimerParams = z.infer<typeof startTimerSchema>;

// ─── Category seeding ──────────────────────────────────────────

export async function ensureDefaultCategories(userId: string) {
  const existing = await repo.getCategories(userId);
  if (existing.length > 0) return existing;

  const cats = await Promise.all(
    DEFAULT_CATEGORIES.map((c, i) =>
      repo.createCategory({ userId, ...c, sortOrder: i }),
    ),
  );
  return cats;
}

// ─── Time Entries ──────────────────────────────────────────────

async function checkTimeOverlap(
  userId: string,
  startTime: Date,
  endTime: Date | null,
  excludeId?: string,
) {
  const conflicts = await repo.getOverlappingEntries(userId, startTime, endTime, excludeId);
  if (conflicts.length > 0) {
    throw Object.assign(new Error("Time entry overlaps with an existing entry"), {
      code: "OVERLAP",
      conflicts: conflicts.map((c) => ({
        id: c.id,
        title: c.title,
        startTime: c.startTime.toISOString(),
        endTime: c.endTime?.toISOString() ?? null,
      })),
    });
  }
}

export async function createTimeEntry(userId: string, params: CreateEntryParams) {
  const validated = createEntrySchema.parse(params);
  const durationMinutes =
    validated.durationMinutes ??
    (validated.startTime && validated.endTime
      ? Math.round(
          (new Date(validated.endTime).getTime() - new Date(validated.startTime).getTime()) /
            60000,
        )
      : undefined);

  const startDate = new Date(validated.startTime);
  const endDate = validated.endTime ? new Date(validated.endTime) : null;
  await checkTimeOverlap(userId, startDate, endDate);

  const entry = await repo.createEntry({
    userId,
    title: validated.title,
    description: validated.description,
    categoryId: validated.categoryId ?? undefined as any,
    projectId: validated.projectId ?? undefined as any,
    tags: validated.tags ?? [],
    startTime: new Date(validated.startTime),
    endTime: validated.endTime ? new Date(validated.endTime) : null,
    durationMinutes: durationMinutes ?? null,
    isBillable: validated.isBillable ?? false,
    notes: validated.notes,
  });

  try {
    const { createTimelineEvent } = await import("@/modules/timeline");
    await createTimelineEvent(userId, {
      title: validated.title,
      description: validated.description ?? undefined,
      eventDate: validated.startTime,
      startTime: dayjs(validated.startTime).format("HH:mm"),
      endTime: validated.endTime ? dayjs(validated.endTime).format("HH:mm") : undefined,
      durationMinutes,
      linkedEntityId: entry.id,
      linkedEntityType: "time_audit",
    }).then(async (timelineEvent: any) => {
      if (timelineEvent?.id) {
        await repo.updateEntry(entry.id, userId, { timelineEventId: timelineEvent.id });
      }
    });
  } catch {}

  return entry;
}

export async function getTimeEntries(
  userId: string,
  filters: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    projectId?: string;
    tags?: string[];
  } = {},
) {
  return repo.getEntries(userId, filters);
}

export async function getTimeEntry(id: string, userId: string) {
  return repo.getEntryById(id, userId);
}

export async function updateTimeEntry(id: string, userId: string, params: UpdateEntryParams) {
  const validated = updateEntrySchema.parse(params);
  const input: Record<string, unknown> = { ...validated };
  if (validated.startTime) {
    input.startTime = new Date(validated.startTime);
  }
  if (validated.endTime) {
    input.endTime = new Date(validated.endTime);
  }
  if (validated.startTime && validated.endTime) {
    input.durationMinutes = Math.round(
      (new Date(validated.endTime).getTime() - new Date(validated.startTime).getTime()) / 60000,
    );
  }

  if (validated.startTime) {
    const startDate = new Date(validated.startTime);
    const endDate = validated.endTime ? new Date(validated.endTime) : null;
    await checkTimeOverlap(userId, startDate, endDate, id);
  }

  return repo.updateEntry(id, userId, input as any);
}

export async function deleteTimeEntry(id: string, userId: string) {
  return repo.deleteEntry(id, userId);
}

export async function duplicateTimeEntry(id: string, userId: string) {
  const original = await repo.getEntryById(id, userId);
  if (!original) return null;

  const now = new Date();
  const entry = await repo.createEntry({
    userId,
    title: original.title,
    description: original.description,
    categoryId: original.categoryId,
    projectId: original.projectId,
    tags: original.tags,
    startTime: now,
    endTime: null,
    durationMinutes: null,
    isBillable: original.isBillable,
    notes: original.notes,
  });

  try {
    const { createTimelineEvent } = await import("@/modules/timeline");
    await createTimelineEvent(userId, {
      title: entry.title,
      description: entry.description ?? undefined,
      eventDate: now.toISOString(),
      startTime: dayjs(now).format("HH:mm"),
      durationMinutes: 0,
      linkedEntityId: entry.id,
      linkedEntityType: "time_audit",
    }).then(async (timelineEvent: any) => {
      if (timelineEvent?.id) {
        await repo.updateEntry(entry.id, userId, { timelineEventId: timelineEvent.id });
      }
    });
  } catch {}

  return entry;
}

// ─── Active Timer ──────────────────────────────────────────────

export async function startTimer(userId: string, params: StartTimerParams) {
  const validated = startTimerSchema.parse(params);
  const now = new Date();

  await checkTimeOverlap(userId, now, null);

  const entry = await repo.createEntry({
    userId,
    title: validated.title,
    description: validated.description ?? null,
    categoryId: validated.categoryId ?? undefined as any,
    projectId: validated.projectId ?? undefined as any,
    tags: validated.tags ?? [],
    startTime: now,
    endTime: null,
    durationMinutes: null,
    isBillable: validated.isBillable ?? false,
    notes: validated.notes ?? null,
  });

  await repo.upsertActiveTimer({
    userId,
    entryId: entry.id,
    startTime: now,
    elapsedBeforePause: 0,
    isPaused: false,
  });

  return { entry, timer: await repo.getActiveTimer(userId) };
}

export async function stopTimer(userId: string) {
  const timer = await repo.getActiveTimer(userId);
  if (!timer) return null;

  const elapsedMinutes = Math.round(
    ((Date.now() - timer.startTime.getTime()) / 60000) + (timer.elapsedBeforePause ?? 0) / 60,
  );

  const now = new Date();
  const entry = await repo.updateEntry(timer.entryId, userId, {
    endTime: now,
    durationMinutes: Math.max(1, elapsedMinutes),
  });

  await repo.deleteActiveTimer(userId);

  if (entry) {
    try {
      const { createTimelineEvent } = await import("@/modules/timeline");
      const timelineEvent = await createTimelineEvent(userId, {
        title: entry.title,
        description: entry.description ?? undefined,
        eventDate: entry.startTime.toISOString(),
        startTime: dayjs(entry.startTime).format("HH:mm"),
        endTime: dayjs(now).format("HH:mm"),
        durationMinutes: Math.max(1, elapsedMinutes),
        linkedEntityId: entry.id,
        linkedEntityType: "time_audit",
      });
      if (timelineEvent?.id) {
        await repo.updateEntry(entry.id, userId, { timelineEventId: timelineEvent.id });
      }
    } catch {}
  }

  return entry;
}

export async function pauseTimer(userId: string) {
  const timer = await repo.getActiveTimer(userId);
  if (!timer || timer.isPaused) return timer;

  const elapsedSinceStart = (Date.now() - timer.startTime.getTime()) / 1000;
  const totalElapsed = (timer.elapsedBeforePause ?? 0) + Math.round(elapsedSinceStart);

  await repo.upsertActiveTimer({
    userId,
    entryId: timer.entryId,
    startTime: timer.startTime,
    elapsedBeforePause: totalElapsed,
    isPaused: true,
  });

  // Update the time entry with current elapsed duration
  const elapsedMinutes = Math.max(1, Math.round(totalElapsed / 60));
  await repo.updateEntry(timer.entryId, userId, { durationMinutes: elapsedMinutes });

  return repo.getActiveTimer(userId);
}

export async function resumeTimer(userId: string) {
  const timer = await repo.getActiveTimer(userId);
  if (!timer || !timer.isPaused) return timer;

  await repo.upsertActiveTimer({
    userId,
    entryId: timer.entryId,
    startTime: new Date(),
    elapsedBeforePause: timer.elapsedBeforePause,
    isPaused: false,
  });

  return repo.getActiveTimer(userId);
}

export async function getActiveTimer(userId: string) {
  const timer = await repo.getActiveTimer(userId);
  if (!timer) return null;

  if (!timer.isPaused) {
    const elapsedSinceStart = (Date.now() - timer.startTime.getTime()) / 1000;
    const totalElapsed = (timer.elapsedBeforePause ?? 0) + Math.round(elapsedSinceStart);
    const entry = await repo.getEntryById(timer.entryId, userId);
    return { timer, entry, currentElapsedSeconds: totalElapsed };
  }

  const entry = await repo.getEntryById(timer.entryId, userId);
  return { timer, entry, currentElapsedSeconds: timer.elapsedBeforePause ?? 0 };
}

// ─── Categories ────────────────────────────────────────────────

export async function createCategory(userId: string, params: CreateCategoryParams) {
  const validated = createCategorySchema.parse(params);
  const cats = await repo.getCategories(userId);
  return repo.createCategory({
    userId,
    name: validated.name,
    icon: validated.icon ?? "dots",
    color: validated.color ?? "gray",
    sortOrder: validated.sortOrder ?? cats.length,
  });
}

export async function getCategories(userId: string) {
  return repo.getCategories(userId);
}

export async function updateCategory(id: string, userId: string, params: UpdateCategoryParams) {
  const validated = updateCategorySchema.parse(params);
  return repo.updateCategory(id, userId, validated);
}

export async function deleteCategory(id: string, userId: string) {
  return repo.deleteCategory(id, userId);
}

// ─── Budgets ───────────────────────────────────────────────────

export async function createBudget(userId: string, params: CreateBudgetParams) {
  const validated = createBudgetSchema.parse(params);
  return repo.createBudget({ userId, ...validated });
}

export async function getBudgets(userId: string) {
  return repo.getBudgets(userId);
}

export async function updateBudget(id: string, userId: string, params: UpdateBudgetParams) {
  const validated = updateBudgetSchema.parse(params);
  return repo.updateBudget(id, userId, validated);
}

export async function deleteBudget(id: string, userId: string) {
  return repo.deleteBudget(id, userId);
}

export async function getBudgetProgress(userId: string) {
  const budgets = await repo.getBudgets(userId);
  if (!budgets.length) return [];

  const now = dayjs();
  const results = [];

  for (const budget of budgets) {
    let periodStart: dayjs.Dayjs;
    let periodEnd: dayjs.Dayjs;

    if (budget.period === "weekly") {
      periodStart = now.startOf("isoWeek");
      periodEnd = now.endOf("isoWeek");
    } else {
      periodStart = now.startOf("month");
      periodEnd = now.endOf("month");
    }

    const entries = await repo.getEntriesByDateRange(
      userId,
      periodStart.toDate(),
      periodEnd.toDate(),
    );

    const actualMinutes = entries
      .filter((e) => e.categoryId === budget.categoryId && e.durationMinutes)
      .reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);

    results.push({
      ...budget,
      actualMinutes,
      remainingMinutes: Math.max(0, budget.targetMinutes - actualMinutes),
      percentage: Math.min(100, Math.round((actualMinutes / budget.targetMinutes) * 100)),
      isExceeded: actualMinutes > budget.targetMinutes,
    });
  }

  return results;
}

// ─── Dashboard ─────────────────────────────────────────────────

function getPeriodRange(period: string): { dateFrom: Date; dateTo: Date } {
  const now = dayjs();
  switch (period) {
    case "today":
      return { dateFrom: now.startOf("day").toDate(), dateTo: now.endOf("day").toDate() };
    case "week":
      return { dateFrom: now.startOf("isoWeek").toDate(), dateTo: now.endOf("isoWeek").toDate() };
    case "month":
      return { dateFrom: now.startOf("month").toDate(), dateTo: now.endOf("month").toDate() };
    case "year":
      return { dateFrom: now.startOf("year").toDate(), dateTo: now.endOf("year").toDate() };
    default:
      return { dateFrom: now.startOf("day").toDate(), dateTo: now.endOf("day").toDate() };
  }
}

export async function getDashboardMetrics(userId: string, period: string = "today") {
  const { dateFrom, dateTo } = getPeriodRange(period);
  const metrics = await repo.getDashboardMetrics(userId, dateFrom, dateTo);
  return {
    ...metrics,
    period,
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
  };
}

export async function getTimeDistribution(
  userId: string,
  period: string = "week",
) {
  const { dateFrom, dateTo } = getPeriodRange(period);
  const [byCategory, byDay] = await Promise.all([
    repo.getTimeByCategory(userId, dateFrom, dateTo),
    repo.getTimeByDay(userId, dateFrom, dateTo),
  ]);
  return { byCategory, byDay, period, dateFrom, dateTo };
}

export async function getProjectAnalysis(userId: string, period: string = "month") {
  const { dateFrom, dateTo } = getPeriodRange(period);
  const byProject = await repo.getTimeByProject(userId, dateFrom, dateTo);

  const now = dayjs();
  const allTime = await repo.getTotalStats(userId);
  const allTimeMinutes = allTime?.totalMinutes ?? 1;

  return {
    projects: byProject.map((p) => ({
      ...p,
      percentageOfTotal: Math.round((p.totalMinutes / allTimeMinutes) * 100),
    })),
    totalMinutes: byProject.reduce((s, p) => s + p.totalMinutes, 0),
  };
}

export async function getWeeklyTrend(userId: string) {
  const now = dayjs();
  const weeks: { week: string; totalMinutes: number; sessionCount: number }[] = [];

  for (let i = 0; i < 12; i++) {
    const weekStart = now.subtract(i, "week").startOf("isoWeek");
    const weekEnd = now.subtract(i, "week").endOf("isoWeek");
    const metrics = await repo.getDashboardMetrics(userId, weekStart.toDate(), weekEnd.toDate());
    weeks.unshift({
      week: weekStart.format("YYYY-[W]WW"),
      totalMinutes: metrics.totalMinutes,
      sessionCount: metrics.sessionCount,
    });
  }
  return weeks;
}

// ─── Productivity Stats ────────────────────────────────────────

export async function getProductivityStats(userId: string) {
  const [allTime, trackingDates] = await Promise.all([
    repo.getTotalStats(userId),
    repo.getTrackingDates(userId),
  ]);

  const now = dayjs();
  const daysSinceFirst = trackingDates.length
    ? now.diff(dayjs(trackingDates[trackingDates.length - 1]), "day") + 1
    : 0;

  const { calculateStreak } = await import("@/modules/habits");
  const streak = calculateStreak(trackingDates);

  const todayMetrics = await repo.getDashboardMetrics(
    userId,
    now.startOf("day").toDate(),
    now.endOf("day").toDate(),
  );
  const weekMetrics = await repo.getDashboardMetrics(
    userId,
    now.startOf("isoWeek").toDate(),
    now.endOf("isoWeek").toDate(),
  );
  const monthMetrics = await repo.getDashboardMetrics(
    userId,
    now.startOf("month").toDate(),
    now.endOf("month").toDate(),
  );

  return {
    totalHours: Math.round(((allTime?.totalMinutes ?? 0) / 60) * 100) / 100,
    totalSessions: allTime?.totalSessions ?? 0,
    averageDailyHours: daysSinceFirst
      ? Math.round(((allTime?.totalMinutes ?? 0) / 60 / daysSinceFirst) * 100) / 100
      : 0,
    averageWeeklyHours: weekMetrics.totalMinutes
      ? Math.round((weekMetrics.totalMinutes / 60) * 100) / 100
      : 0,
    averageMonthlyHours: monthMetrics.totalMinutes
      ? Math.round((monthMetrics.totalMinutes / 60) * 100) / 100
      : 0,
    averageSessionDuration: allTime?.totalSessions
      ? Math.round((allTime?.totalMinutes ?? 0) / allTime.totalSessions)
      : 0,
    consecutiveTrackingDays: streak.current,
    longestTrackingStreak: streak.longest,
    todayHours: Math.round((todayMetrics.totalMinutes / 60) * 100) / 100,
    weekHours: Math.round((weekMetrics.totalMinutes / 60) * 100) / 100,
    monthHours: Math.round((monthMetrics.totalMinutes / 60) * 100) / 100,
  };
}

// ─── Comparison ────────────────────────────────────────────────

export async function getComparison(userId: string) {
  const now = dayjs();
  const thisWeekRange = {
    dateFrom: now.startOf("isoWeek").toDate(),
    dateTo: now.endOf("isoWeek").toDate(),
  };
  const lastWeekRange = {
    dateFrom: now.subtract(1, "week").startOf("isoWeek").toDate(),
    dateTo: now.subtract(1, "week").endOf("isoWeek").toDate(),
  };
  const thisMonthRange = {
    dateFrom: now.startOf("month").toDate(),
    dateTo: now.endOf("month").toDate(),
  };
  const lastMonthRange = {
    dateFrom: now.subtract(1, "month").startOf("month").toDate(),
    dateTo: now.subtract(1, "month").endOf("month").toDate(),
  };

  const [thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
    repo.getDashboardMetrics(userId, thisWeekRange.dateFrom, thisWeekRange.dateTo),
    repo.getDashboardMetrics(userId, lastWeekRange.dateFrom, lastWeekRange.dateTo),
    repo.getDashboardMetrics(userId, thisMonthRange.dateFrom, thisMonthRange.dateTo),
    repo.getDashboardMetrics(userId, lastMonthRange.dateFrom, lastMonthRange.dateTo),
  ]);

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    week: {
      currentMinutes: thisWeek.totalMinutes,
      previousMinutes: lastWeek.totalMinutes,
      change: calcChange(thisWeek.totalMinutes, lastWeek.totalMinutes),
      currentSessions: thisWeek.sessionCount,
      previousSessions: lastWeek.sessionCount,
    },
    month: {
      currentMinutes: thisMonth.totalMinutes,
      previousMinutes: lastMonth.totalMinutes,
      change: calcChange(thisMonth.totalMinutes, lastMonth.totalMinutes),
      currentSessions: thisMonth.sessionCount,
      previousSessions: lastMonth.sessionCount,
    },
  };
}

// ─── Weekly Summary ────────────────────────────────────────────

export async function getWeeklySummary(userId: string) {
  const now = dayjs();
  const weekStart = now.startOf("isoWeek").toDate();
  const weekEnd = now.endOf("isoWeek").toDate();

  const [metrics, byCategory, byProject] = await Promise.all([
    repo.getDashboardMetrics(userId, weekStart, weekEnd),
    repo.getTimeByCategory(userId, weekStart, weekEnd),
    repo.getTimeByProject(userId, weekStart, weekEnd),
  ]);

  const categories = await repo.getCategories(userId);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const topCategory = byCategory.length
    ? { name: categoryMap.get(byCategory[0].categoryId ?? "") ?? "Uncategorized", minutes: byCategory[0].totalMinutes }
    : null;

  const topProject = byProject.length
    ? { projectId: byProject[0].projectId, minutes: byProject[0].totalMinutes }
    : null;

  const avgDailyHours =
    metrics.sessionCount > 0
      ? Math.round((metrics.totalMinutes / 60 / 7) * 100) / 100
      : 0;

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalHours: Math.round((metrics.totalMinutes / 60) * 100) / 100,
    totalSessions: metrics.sessionCount,
    mostUsedCategory: topCategory,
    mostWorkedProject: topProject,
    longestSession: metrics.maxDuration,
    averageDailyHours: avgDailyHours,
    categoryBreakdown: byCategory.map((c) => ({
      categoryId: c.categoryId,
      name: categoryMap.get(c.categoryId ?? "") ?? "Uncategorized",
      minutes: c.totalMinutes,
      sessions: c.sessionCount,
    })),
  };
}

// ─── CSV Export ────────────────────────────────────────────────

export async function exportCSV(
  userId: string,
  dateFrom: string,
  dateTo: string,
): Promise<string> {
  const entries = await repo.getEntriesByDateRange(
    userId,
    new Date(dateFrom),
    new Date(dateTo),
  );

  const categories = await repo.getCategories(userId);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const header = "Title,Description,Category,Project,Tags,Start Time,End Time,Duration (min),Billable,Notes\n";
  const rows = entries.map((e) => {
    const catName = categoryMap.get(e.categoryId ?? "") ?? "";
    const start = e.startTime ? dayjs(e.startTime).format("YYYY-MM-DD HH:mm") : "";
    const end = e.endTime ? dayjs(e.endTime).format("YYYY-MM-DD HH:mm") : "";
    const tags = (e.tags ?? []).join("; ");
    const billable = e.isBillable ? "Yes" : "No";
    const notes = (e.notes ?? "").replace(/"/g, '""');
    return `"${e.title}","${e.description ?? ""}","${catName}","${e.projectId ?? ""}","${tags}","${start}","${end}","${e.durationMinutes ?? ""}","${billable}","${notes}"`;
  });

  return header + rows.join("\n");
}

// ─── User Preferences ──────────────────────────────────────────

export async function getPreferences(userId: string) {
  const prefs = await repo.getPreferences(userId);
  if (!prefs) {
    return repo.upsertPreferences(userId, { widgetVisibility: {} });
  }
  return prefs;
}

export async function updateWidgetVisibility(
  userId: string,
  visibility: Record<string, boolean>,
) {
  return repo.upsertPreferences(userId, { widgetVisibility: visibility });
}

// ─── Projects (cross-plugin) ───────────────────────────────────

export async function getAvailableProjects(userId: string) {
  try {
    const { connectToDatabase } = await import("@/lib/mongodb");
    const { TaskProject } = await import("@/lib/models/tasks");
    await connectToDatabase();
    const docs = await TaskProject.find({ userId })
      .select({ _id: 1, title: 1, color: 1 })
      .lean();
    return docs.map((doc: any) => ({
      id: doc._id.toString(),
      title: doc.title,
      color: doc.color,
    }));
  } catch {
    return [];
  }
}
