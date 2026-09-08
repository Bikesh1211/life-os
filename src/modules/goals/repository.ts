import { connectToDatabase } from "@/lib/mongodb";
import { Goal as GoalModel, GoalMilestone as GoalMilestoneModel } from "@/lib/models/goals";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: string;
  deadline: Date | null;
  progress: number;
  status: string;
  category: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateGoalInput = {
  userId: string;
  title: string;
  description?: string | null;
  type?: string;
  deadline?: Date | null;
  progress?: number;
  status?: string;
  category?: string | null;
  tags?: string[];
};

export type GoalMilestone = {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  order: number;
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMilestoneInput = {
  goalId: string;
  title: string;
  completed?: boolean;
  order?: number;
  targetDate?: Date | null;
};

export const allowedGoalTypes = ["long-term", "short-term"] as const;
export const allowedGoalStatuses = ["draft", "active", "completed", "cancelled"] as const;

function mapGoal(doc: any): Goal {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    description: doc.description ?? null,
    type: doc.type,
    deadline: doc.deadline ?? null,
    progress: doc.progress,
    status: doc.status,
    category: doc.category ?? null,
    tags: doc.tags ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt ?? null,
  };
}

function mapMilestone(doc: any): GoalMilestone {
  return {
    id: doc._id.toString(),
    goalId: doc.goalId,
    title: doc.title,
    completed: doc.completed,
    order: doc.order,
    targetDate: doc.targetDate ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getGoals(userId: string, status?: string, type?: string) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const docs = await GoalModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapGoal);
}

export async function getGoalById(userId: string, goalId: string) {
  await connectToDatabase();
  const doc = await GoalModel.findOne({
    _id: goalId,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapGoal(doc) : null;
}

export async function createGoal(input: CreateGoalInput) {
  await connectToDatabase();
  const doc = await GoalModel.create({
    userId: input.userId,
    title: input.title,
    description: input.description ?? undefined,
    type: input.type ?? "short-term",
    deadline: input.deadline ?? undefined,
    progress: input.progress ?? 0,
    status: input.status ?? "draft",
    category: input.category ?? undefined,
    tags: input.tags ?? [],
  } as any);
  return mapGoal(doc.toObject());
}

export async function updateGoal(userId: string, goalId: string, input: Partial<CreateGoalInput>) {
  await connectToDatabase();
  const doc = await GoalModel.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapGoal(doc) : null;
}

export async function deleteGoal(userId: string, goalId: string) {
  await connectToDatabase();
  const doc = await GoalModel.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapGoal(doc) : null;
}

/**
 * Returns the set of goal IDs owned by a user, used to enforce ownership
 * on milestone queries.
 */
async function getOwnedGoalIds(userId: string): Promise<string[]> {
  const goals = await GoalModel.find({ userId, deletedAt: null })
    .select({ _id: 1 })
    .lean();
  return goals.map((g: any) => g._id.toString());
}

export async function getMilestones(goalId: string, userId: string) {
  await connectToDatabase();
  const ownedIds = await getOwnedGoalIds(userId);
  if (!ownedIds.includes(goalId)) return [];

  const docs = await GoalMilestoneModel.find({ goalId })
    .sort({ order: 1 })
    .lean();
  return docs.map(mapMilestone);
}

export async function createMilestone(input: CreateMilestoneInput) {
  await connectToDatabase();
  const doc = await GoalMilestoneModel.create({
    goalId: input.goalId,
    title: input.title,
    completed: input.completed ?? false,
    order: input.order ?? 0,
    targetDate: input.targetDate ?? undefined,
  } as any);
  return mapMilestone(doc.toObject());
}

export async function updateMilestone(
  milestoneId: string,
  userId: string,
  input: Partial<CreateMilestoneInput>,
) {
  await connectToDatabase();
  const ownedIds = await getOwnedGoalIds(userId);

  const milestone = await GoalMilestoneModel.findOne({ _id: milestoneId }).lean();
  if (!milestone || !ownedIds.includes(milestone.goalId.toString())) return null;

  const doc = await GoalMilestoneModel.findOneAndUpdate(
    { _id: milestoneId },
    { $set: { ...input, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapMilestone(doc) : null;
}

export async function deleteMilestone(milestoneId: string, userId: string) {
  await connectToDatabase();
  const ownedIds = await getOwnedGoalIds(userId);

  const milestone = await GoalMilestoneModel.findOne({ _id: milestoneId }).lean();
  if (!milestone || !ownedIds.includes(milestone.goalId.toString())) return null;

  const doc = await GoalMilestoneModel.findOneAndDelete({ _id: milestoneId });
  return doc ? mapMilestone(doc.toObject()) : null;
}

export async function getGoalCounts(userId: string) {
  await connectToDatabase();
  const rows = await GoalModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  let total = 0;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row._id] = row.count;
    total += row.count;
  }

  return {
    total,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    draft: counts.draft ?? 0,
  };
}

export async function getRecentGoals(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await GoalModel.find({ userId, deletedAt: null })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapGoal);
}

export async function getOverdueGoals(userId: string, limit = 10) {
  await connectToDatabase();
  const docs = await GoalModel.find({
    userId,
    status: "active",
    deletedAt: null,
    deadline: { $lt: new Date() },
  })
    .sort({ deadline: 1 })
    .limit(limit)
    .lean();
  return docs.map(mapGoal);
}
