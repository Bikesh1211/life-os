import { connectToDatabase } from "@/lib/mongodb";
import { Task as TaskModel, TaskProject as TaskProjectModel, TaskLabel as TaskLabelModel, TaskTasksLabel as TaskTasksLabelModel } from "@/lib/models/tasks";

// ── Types ──

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  userId: string;
  projectId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  descriptionJson: unknown;
  status: TaskStatus;
  priority: string;
  dueDate: Date | null;
  startDate: Date | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  recurrence: TaskRecurrence;
  recurrenceEndDate: Date | null;
  order: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TaskProject = {
  id: string;
  userId: string;
  title: string;
  color: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TaskLabel = {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
};

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

export const taskColumns = [
  "id", "userId", "projectId", "parentId", "title", "description",
  "descriptionJson", "status", "priority", "dueDate", "startDate",
  "estimatedMinutes", "actualMinutes", "recurrence", "recurrenceEndDate",
  "order", "completedAt", "createdAt", "updatedAt", "deletedAt",
];

function mapTask(doc: any): Task {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    projectId: doc.projectId ?? null,
    parentId: doc.parentId ?? null,
    title: doc.title,
    description: doc.description ?? null,
    descriptionJson: doc.descriptionJson ?? null,
    status: doc.status,
    priority: doc.priority,
    dueDate: doc.dueDate ?? null,
    startDate: doc.startDate ?? null,
    estimatedMinutes: doc.estimatedMinutes ?? null,
    actualMinutes: doc.actualMinutes ?? null,
    recurrence: doc.recurrence,
    recurrenceEndDate: doc.recurrenceEndDate ?? null,
    order: doc.order,
    completedAt: doc.completedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt ?? null,
  };
}

function mapProject(doc: any): TaskProject {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    color: doc.color,
    description: doc.description ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt ?? null,
  };
}

function mapLabel(doc: any): TaskLabel {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    color: doc.color,
    createdAt: doc.createdAt,
  };
}

// ── Tasks ──

export async function createTask(input: CreateTaskInput) {
  await connectToDatabase();
  const doc = await TaskModel.create({
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
  } as any);
  return mapTask(doc.toObject());
}

export async function getTaskById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TaskModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapTask(doc) : null;
}

export async function getTasksForUser(userId: string, filters: TaskFilters = {}) {
  await connectToDatabase();

  const filter: any = {
    userId,
    deletedAt: null,
  };

  if (filters.parentId === null) {
    filter.parentId = null;
  } else if (filters.parentId) {
    filter.parentId = filters.parentId;
  }

  if (filters.status) {
    if (filters.status === "active") {
      filter.status = { $in: ["todo", "in_progress"] };
    } else {
      filter.status = filters.status;
    }
  }

  if (filters.priority) {
    filter.priority = filters.priority;
  }

  if (filters.projectId) {
    filter.projectId = filters.projectId;
  }

  if (filters.noProject) {
    filter.projectId = null;
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    filter.dueDate = {};
    if (filters.dueDateFrom) filter.dueDate.$gte = filters.dueDateFrom;
    if (filters.dueDateTo) filter.dueDate.$lte = filters.dueDateTo;
  }

  if (filters.search) {
    filter.title = { $regex: filters.search, $options: "i" };
  }

  if (filters.labelIds && filters.labelIds.length > 0) {
    const taskIds = await TaskTasksLabelModel.find({
      labelId: { $in: filters.labelIds },
    })
      .select({ taskId: 1, _id: 0 })
      .lean();
    const ids = [...new Set(taskIds.map((r: any) => r.taskId))];
    filter._id = { $in: ids };
  }

  const sortMap: Record<string, any> = {
    createdAt: { createdAt: 1 },
    dueDate: { dueDate: 1 },
    title: { title: 1 },
    order: { order: 1 },
    priority: { priority: 1 },
  };

  const sortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
  const sort = sortBy === "priority"
    ? { priority: sortOrder }
    : { [sortBy]: sortOrder } as Record<string, any>;

  const docs = await TaskModel.find(filter)
    .sort(sort)
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 100)
    .lean();

  return docs.map(mapTask);
}

export async function updateTask(id: string, userId: string, input: UpdateTaskInput) {
  await connectToDatabase();
  const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (input.status === "done" && !input.completedAt) {
    updateData.completedAt = new Date();
  }
  if (input.status && input.status !== "done" && input.status !== "cancelled") {
    updateData.completedAt = null;
  }

  const doc = await TaskModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true },
  ).lean();
  return doc ? mapTask(doc) : null;
}

export async function softDeleteTask(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TaskModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapTask(doc) : null;
}

export async function restoreTask(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TaskModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { deletedAt: null, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapTask(doc) : null;
}

export async function getTaskCounts(userId: string) {
  await connectToDatabase();
  const baseFilter = { userId, deletedAt: null };

  const [total, todo, inProgress, done, cancelled, overdue, noProject] = await Promise.all([
    TaskModel.countDocuments(baseFilter),
    TaskModel.countDocuments({ ...baseFilter, status: "todo" }),
    TaskModel.countDocuments({ ...baseFilter, status: "in_progress" }),
    TaskModel.countDocuments({ ...baseFilter, status: "done" }),
    TaskModel.countDocuments({ ...baseFilter, status: "cancelled" }),
    TaskModel.countDocuments({
      ...baseFilter,
      status: { $nin: ["done", "cancelled"] },
      dueDate: { $lt: new Date() },
    }),
    TaskModel.countDocuments({ ...baseFilter, projectId: null }),
  ]);

  return { total, todo, inProgress, done, cancelled, overdue, noProject };
}

export async function getSubtasks(parentId: string, userId: string) {
  await connectToDatabase();
  const docs = await TaskModel.find({
    parentId,
    userId,
    deletedAt: null,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return docs.map(mapTask);
}

// ── Projects ──

export async function createProject(input: CreateProjectInput) {
  await connectToDatabase();
  const doc = await TaskProjectModel.create({
    userId: input.userId,
    title: input.title,
    color: input.color ?? "blue",
    description: input.description ?? null,
  } as any);
  return mapProject(doc.toObject());
}

export async function getProjectsForUser(userId: string) {
  await connectToDatabase();
  const docs = await TaskProjectModel.find({ userId, deletedAt: null })
    .sort({ title: 1 })
    .lean();
  return docs.map(mapProject);
}

export async function getProjectById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TaskProjectModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapProject(doc) : null;
}

export async function updateProject(
  id: string,
  userId: string,
  input: Partial<CreateProjectInput>,
) {
  await connectToDatabase();
  const doc = await TaskProjectModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapProject(doc) : null;
}

export async function deleteProject(id: string, userId: string) {
  await connectToDatabase();
  await TaskModel.updateMany(
    { projectId: id, userId },
    { $set: { projectId: null } },
  );

  const doc = await TaskProjectModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapProject(doc) : null;
}

export async function getProjectStats(userId: string) {
  const projects = await getProjectsForUser(userId);
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return [];

  await connectToDatabase();
  const stats = await TaskModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        parentId: null,
        projectId: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: "$projectId",
        total: { $sum: 1 },
        doneCount: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = new Map(stats.map((s: any) => [s._id, s]));

  return projects.map((p: any) => ({
    ...p,
    taskCount: statsMap.get(p.id)?.total ?? 0,
    doneCount: statsMap.get(p.id)?.doneCount ?? 0,
  }));
}

// ── Labels ──

export async function createLabel(input: CreateLabelInput) {
  await connectToDatabase();
  try {
    const doc = await TaskLabelModel.create({
      userId: input.userId,
      name: input.name,
      color: input.color ?? "blue",
    });
    return mapLabel(doc.toObject());
  } catch {
    return null;
  }
}

export async function getLabelsForUser(userId: string) {
  await connectToDatabase();
  const docs = await TaskLabelModel.find({ userId })
    .sort({ name: 1 })
    .lean();
  return docs.map(mapLabel);
}

export async function updateLabel(id: string, userId: string, input: { name?: string; color?: string }) {
  await connectToDatabase();
  const doc = await TaskLabelModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: input },
    { new: true },
  ).lean();
  return doc ? mapLabel(doc) : null;
}

export async function deleteLabel(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TaskLabelModel.findOneAndDelete({ _id: id, userId });
  if (!doc) return null;

  await TaskTasksLabelModel.deleteMany({ labelId: id });
  return mapLabel(doc.toObject());
}

/**
 * Replaces a task's labels. Both sides are ownership-checked: the task must be
 * the caller's, and only labels the caller owns are linked.
 */
export async function setTaskLabels(taskId: string, userId: string, labelIds: string[]) {
  await connectToDatabase();
  const task = await TaskModel.findOne({ _id: taskId, userId }).lean();
  if (!task) return;

  await TaskTasksLabelModel.deleteMany({ taskId });
  if (labelIds.length === 0) return;

  const owned = await TaskLabelModel.find({
    _id: { $in: labelIds },
    userId,
  })
    .select({ _id: 1 })
    .lean();
  if (owned.length === 0) return;

  await TaskTasksLabelModel.insertMany(
    owned.map((label: any) => ({ taskId, labelId: label._id.toString() })),
  );
}

export async function getTaskLabels(taskId: string, userId: string) {
  await connectToDatabase();
  const rows = await TaskTasksLabelModel.find({ taskId })
    .populate({
      path: "labelId",
      match: { userId },
      select: "name color",
    })
    .lean();

  return rows
    .filter((r: any) => r.labelId)
    .map((r: any) => ({
      id: r.labelId._id.toString(),
      name: r.labelId.name,
      color: r.labelId.color,
    }));
}

export async function getTaskLabelsBatch(taskIds: string[], userId: string) {
  if (taskIds.length === 0) return [];
  await connectToDatabase();
  const rows = await TaskTasksLabelModel.find({ taskId: { $in: taskIds } })
    .populate({
      path: "labelId",
      match: { userId },
      select: "name color",
    })
    .lean();

  return rows
    .filter((r: any) => r.labelId)
    .map((r: any) => ({
      taskId: r.taskId,
      id: r.labelId._id.toString(),
      name: r.labelId.name,
      color: r.labelId.color,
    }));
}
