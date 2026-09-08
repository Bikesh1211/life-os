import { connectToDatabase } from "@/lib/mongodb";
import {
  IntegrityCommitment,
  IntegrityCommitmentEvent,
  IntegrityDailyCheckin,
  IntegrityDailySnapshot,
} from "@/lib/models/integrity";

// ── Helpers ──

function toDoc(doc: any) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function toDocs(docs: any[]) {
  return docs.map(toDoc);
}

// ── Types ──

export type Commitment = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  difficulty: string;
  estimatedTime?: number;
  dueDate?: Date;
  dueTime?: string;
  startDate?: Date;
  tags: string[];
  color?: string;
  icon?: string;
  evidenceRequired: boolean;
  location?: string;
  repeatRule: string;
  reminderMinutesBefore?: number;
  status: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  completedAt?: Date;
  failedAt?: Date;
  missedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type CreateCommitmentInput = {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  difficulty?: string;
  estimatedTime?: number;
  dueDate?: Date;
  dueTime?: string;
  startDate?: Date;
  tags?: string[];
  color?: string;
  icon?: string;
  evidenceRequired?: boolean;
  location?: string;
  repeatRule?: string;
  reminderMinutesBefore?: number;
  status?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
};

export type CommitmentEvent = {
  id: string;
  commitmentId: string;
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEventInput = {
  commitmentId: string;
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
};

export type DailyCheckin = {
  id: string;
  userId: string;
  date: Date;
  blockers?: string;
  improvementNotes?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCheckinInput = {
  userId: string;
  date: Date;
  blockers?: string;
  improvementNotes?: string;
  summary?: string;
};

export type DailySnapshot = {
  id: string;
  userId: string;
  date: Date;
  score: number;
  streak: number;
  level?: string;
  subScores: Record<string, unknown>;
  commitmentRate: number;
  allCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSnapshotInput = {
  userId: string;
  date: Date;
  score: number;
  streak: number;
  level?: string;
  subScores: Record<string, unknown>;
  commitmentRate: number;
  allCompleted: boolean;
};

// ── Commitments ──

export async function getCommitments(
  userId: string,
  status?: string,
  category?: string,
  difficulty?: string,
  priority?: string,
) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: { $exists: false } };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (priority) filter.priority = priority;

  const docs = await IntegrityCommitment.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return toDocs(docs);
}

export async function getCommitmentById(userId: string, commitmentId: string) {
  await connectToDatabase();
  const doc = await IntegrityCommitment.findOne({
    _id: commitmentId,
    userId,
    deletedAt: { $exists: false },
  }).lean();
  return toDoc(doc);
}

export async function getCommitmentsByIds(userId: string, commitmentIds: string[]) {
  if (commitmentIds.length === 0) return [];
  await connectToDatabase();
  const docs = await IntegrityCommitment.find({
    _id: { $in: commitmentIds },
    userId,
    deletedAt: { $exists: false },
  }).lean();
  return toDocs(docs);
}

export async function createCommitment(input: CreateCommitmentInput) {
  await connectToDatabase();
  const doc = await IntegrityCommitment.create(input);
  return toDoc(doc);
}

export async function updateCommitment(
  userId: string,
  commitmentId: string,
  input: Partial<CreateCommitmentInput>,
) {
  await connectToDatabase();
  const doc = await IntegrityCommitment.findOneAndUpdate(
    { _id: commitmentId, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function deleteCommitment(userId: string, commitmentId: string) {
  await connectToDatabase();
  const doc = await IntegrityCommitment.findOneAndUpdate(
    { _id: commitmentId, userId },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return toDoc(doc);
}

export async function getCommitmentCounts(userId: string) {
  await connectToDatabase();
  const baseFilter = { userId, deletedAt: { $exists: false } };

  const total = await IntegrityCommitment.countDocuments(baseFilter);

  const statuses = [
    "pending",
    "in_progress",
    "completed_unverified",
    "completed_verified",
    "failed",
    "missed",
    "cancelled",
  ] as const;

  const counts: Record<string, number> = { all: total };
  for (const s of statuses) {
    counts[s] = await IntegrityCommitment.countDocuments({ ...baseFilter, status: s });
  }

  return counts;
}

// ── Events ──

export async function createEvent(input: CreateEventInput) {
  await connectToDatabase();
  const doc = await IntegrityCommitmentEvent.create(input);
  return toDoc(doc);
}

export async function getEventsForCommitment(commitmentId: string) {
  await connectToDatabase();
  const docs = await IntegrityCommitmentEvent.find({ commitmentId })
    .sort({ timestamp: 1 })
    .lean();
  return toDocs(docs);
}

export async function getRecentEvents(userId: string, limit = 50) {
  await connectToDatabase();

  const commitmentDocs = await IntegrityCommitment.find({ userId })
    .select({ _id: 1 })
    .lean();
  const commitmentIds = commitmentDocs.map((c: any) => c._id);

  if (commitmentIds.length === 0) return [];

  const docs = await IntegrityCommitmentEvent.find({ commitmentId: { $in: commitmentIds } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  return toDocs(docs);
}

// ── Daily Check-ins ──

export async function getCheckin(userId: string, date: string) {
  await connectToDatabase();
  const doc = await IntegrityDailyCheckin.findOne({
    userId,
    date: new Date(date),
  }).lean();
  return toDoc(doc);
}

export async function upsertCheckin(input: CreateCheckinInput & { id?: string }) {
  await connectToDatabase();

  if (input.id) {
    const doc = await IntegrityDailyCheckin.findOneAndUpdate(
      { _id: input.id },
      {
        blockers: input.blockers ?? null,
        improvementNotes: input.improvementNotes ?? null,
        summary: input.summary ?? null,
        updatedAt: new Date(),
      },
      { new: true },
    ).lean();
    return toDoc(doc);
  }

  const doc = await IntegrityDailyCheckin.create(input);
  return toDoc(doc);
}

export async function getCheckinsInRange(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const docs = await IntegrityDailyCheckin.find({
    userId,
    date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
  })
    .sort({ date: 1 })
    .lean();
  return toDocs(docs);
}

// ── Commitment Queries ──

export async function getAllCommitmentsForUser(userId: string) {
  await connectToDatabase();
  const docs = await IntegrityCommitment.find({
    userId,
    deletedAt: { $exists: false },
  }).lean();
  return toDocs(docs);
}

export async function getCommitmentsByDateRange(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  await connectToDatabase();
  const docs = await IntegrityCommitment.find({
    userId,
    deletedAt: { $exists: false },
    createdAt: { $gte: dateFrom, $lte: dateTo },
  }).lean();
  return toDocs(docs);
}

// ── Analytics ──

export async function getCategoryDistribution(userId: string) {
  await connectToDatabase();
  const results = await IntegrityCommitment.aggregate([
    { $match: { userId, deletedAt: { $exists: false } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return results.map((r: any) => ({ category: r._id, count: r.count }));
}

export async function getDifficultyDistribution(userId: string) {
  await connectToDatabase();
  const results = await IntegrityCommitment.aggregate([
    { $match: { userId, deletedAt: { $exists: false } } },
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $in: ["$status", ["completed_unverified", "completed_verified"]] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return results.map((r: any) => ({
    difficulty: r._id,
    count: r.count,
    completed: r.completed,
  }));
}

export async function getCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const results = await IntegrityCommitment.aggregate([
    {
      $match: {
        userId,
        deletedAt: { $exists: false },
        createdAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo + "T23:59:59") },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r: any) => ({ date: r._id, count: r.count }));
}

export async function getDayOfWeekDistribution(userId: string) {
  await connectToDatabase();
  const all = await IntegrityCommitment.find({
    userId,
    deletedAt: { $exists: false },
  })
    .select({ createdAt: 1, status: 1 })
    .lean();

  const dayCounts: Record<string, { total: number; completed: number }> = {
    Sunday: { total: 0, completed: 0 },
    Monday: { total: 0, completed: 0 },
    Tuesday: { total: 0, completed: 0 },
    Wednesday: { total: 0, completed: 0 },
    Thursday: { total: 0, completed: 0 },
    Friday: { total: 0, completed: 0 },
    Saturday: { total: 0, completed: 0 },
  };

  for (const row of all) {
    const day = new Date(row.createdAt).toLocaleDateString("en-US", { weekday: "long" });
    dayCounts[day].total++;
    if (row.status === "completed_unverified" || row.status === "completed_verified") {
      dayCounts[day].completed++;
    }
  }

  return dayCounts;
}

// ── Snapshots ──

export async function getSnapshot(userId: string, date: string) {
  await connectToDatabase();
  const doc = await IntegrityDailySnapshot.findOne({
    userId,
    date: new Date(date),
  }).lean();
  return toDoc(doc);
}

export async function getLatestSnapshot(userId: string) {
  await connectToDatabase();
  const doc = await IntegrityDailySnapshot.findOne({ userId })
    .sort({ date: -1 })
    .lean();
  return toDoc(doc);
}

export async function upsertSnapshot(input: CreateSnapshotInput & { id?: string }) {
  await connectToDatabase();

  if (input.id) {
    const doc = await IntegrityDailySnapshot.findOneAndUpdate(
      { _id: input.id },
      {
        score: input.score,
        streak: input.streak,
        level: input.level,
        subScores: input.subScores,
        commitmentRate: input.commitmentRate,
        allCompleted: input.allCompleted,
        updatedAt: new Date(),
      },
      { new: true },
    ).lean();
    return toDoc(doc);
  }

  const doc = await IntegrityDailySnapshot.create(input);
  return toDoc(doc);
}

export async function getSnapshotsInRange(userId: string, dateFrom: string, dateTo: string) {
  await connectToDatabase();
  const docs = await IntegrityDailySnapshot.find({
    userId,
    date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
  })
    .sort({ date: 1 })
    .lean();
  return toDocs(docs);
}

// ── Excuse Tags ──

export async function getExcuseTagDistribution(userId: string, dateFrom?: string, dateTo?: string) {
  await connectToDatabase();
  const filter: any = { userId };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const results = await IntegrityDailyCheckin.find(filter)
    .select({ excuseTags: 1 })
    .sort({ date: -1 })
    .lean();

  const tagCounts: Record<string, number> = {};
  for (const row of results) {
    const tags = (row as any).excuseTags;
    if (tags) {
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Linked Commitments ──

export async function getLinkedCommitments(userId: string, entityType: string, entityId: string) {
  await connectToDatabase();
  const docs = await IntegrityCommitment.find({
    userId,
    linkedEntityType: entityType,
    linkedEntityId: entityId,
    deletedAt: { $exists: false },
  }).lean();
  return toDocs(docs);
}
