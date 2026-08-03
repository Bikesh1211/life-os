import { db } from "@/core/database";
import { integrityCommitments, integrityCommitmentEvents, integrityDailyCheckins, integrityDailySnapshots } from "./schema";
import { eq, and, isNull, desc, asc, count, gte, lte, inArray, sql } from "drizzle-orm";

export type Commitment = typeof integrityCommitments.$inferSelect;
export type CreateCommitmentInput = typeof integrityCommitments.$inferInsert;
export type CommitmentEvent = typeof integrityCommitmentEvents.$inferSelect;
export type CreateEventInput = typeof integrityCommitmentEvents.$inferInsert;
export type DailyCheckin = typeof integrityDailyCheckins.$inferSelect;
export type CreateCheckinInput = typeof integrityDailyCheckins.$inferInsert;
export type DailySnapshot = typeof integrityDailySnapshots.$inferSelect;
export type CreateSnapshotInput = typeof integrityDailySnapshots.$inferInsert;

export async function getCommitments(
  userId: string,
  status?: string,
  category?: string,
  difficulty?: string,
  priority?: string,
) {
  const conditions = [eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)];
  if (status) conditions.push(eq(integrityCommitments.status, status as any));
  if (category) conditions.push(eq(integrityCommitments.category, category));
  if (difficulty) conditions.push(eq(integrityCommitments.difficulty, difficulty as any));
  if (priority) conditions.push(eq(integrityCommitments.priority, priority));

  return db
    .select()
    .from(integrityCommitments)
    .where(and(...conditions))
    .orderBy(desc(integrityCommitments.createdAt));
}

export async function getCommitmentById(userId: string, commitmentId: string) {
  const result = await db
    .select()
    .from(integrityCommitments)
    .where(
      and(
        eq(integrityCommitments.id, commitmentId),
        eq(integrityCommitments.userId, userId),
        isNull(integrityCommitments.deletedAt),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getCommitmentsByIds(userId: string, commitmentIds: string[]) {
  if (commitmentIds.length === 0) return [];
  return db
    .select()
    .from(integrityCommitments)
    .where(
      and(
        inArray(integrityCommitments.id, commitmentIds),
        eq(integrityCommitments.userId, userId),
        isNull(integrityCommitments.deletedAt),
      ),
    );
}

export async function createCommitment(input: CreateCommitmentInput) {
  const result = await db.insert(integrityCommitments).values(input).returning();
  return result[0];
}

export async function updateCommitment(
  userId: string,
  commitmentId: string,
  input: Partial<CreateCommitmentInput>,
) {
  const result = await db
    .update(integrityCommitments)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(integrityCommitments.id, commitmentId), eq(integrityCommitments.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteCommitment(userId: string, commitmentId: string) {
  const result = await db
    .update(integrityCommitments)
    .set({ deletedAt: new Date() })
    .where(and(eq(integrityCommitments.id, commitmentId), eq(integrityCommitments.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getCommitmentCounts(userId: string) {
  const baseCondition = and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt));

  const [totalResult] = await db
    .select({ value: count() })
    .from(integrityCommitments)
    .where(baseCondition);

  const statuses = ["pending", "in_progress", "completed_unverified", "completed_verified", "failed", "missed", "cancelled"] as const;
  const counts: Record<string, number> = {};
  counts.all = Number(totalResult?.value ?? 0);

  for (const s of statuses) {
    const [r] = await db
      .select({ value: count() })
      .from(integrityCommitments)
      .where(and(baseCondition, eq(integrityCommitments.status, s as any)));
    counts[s] = Number(r?.value ?? 0);
  }

  return counts as Record<string, number>;
}

export async function createEvent(input: CreateEventInput) {
  const result = await db.insert(integrityCommitmentEvents).values(input).returning();
  return result[0];
}

export async function getEventsForCommitment(commitmentId: string) {
  return db
    .select()
    .from(integrityCommitmentEvents)
    .where(eq(integrityCommitmentEvents.commitmentId, commitmentId))
    .orderBy(asc(integrityCommitmentEvents.timestamp));
}

export async function getRecentEvents(userId: string, limit = 50) {
  const commitmentIds = db
    .select({ id: integrityCommitments.id })
    .from(integrityCommitments)
    .where(eq(integrityCommitments.userId, userId));

  return db
    .select()
    .from(integrityCommitmentEvents)
    .where(inArray(integrityCommitmentEvents.commitmentId, commitmentIds))
    .orderBy(desc(integrityCommitmentEvents.timestamp))
    .limit(limit);
}

export async function getCheckin(userId: string, date: string) {
  const result = await db
    .select()
    .from(integrityDailyCheckins)
    .where(
      and(
        eq(integrityDailyCheckins.userId, userId),
        eq(integrityDailyCheckins.date, date),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function upsertCheckin(input: CreateCheckinInput & { id?: string }) {
  if (input.id) {
    const result = await db
      .update(integrityDailyCheckins)
      .set({
        accomplishments: input.accomplishments ?? null,
        excuses: input.excuses ?? null,
        distractions: input.distractions ?? null,
        proudOf: input.proudOf ?? null,
        improvement: input.improvement ?? null,
        excuseTags: input.excuseTags ?? null,
        updatedAt: new Date(),
      })
      .where(eq(integrityDailyCheckins.id, input.id))
      .returning();
    return result[0];
  }
  const result = await db.insert(integrityDailyCheckins).values(input).returning();
  return result[0];
}

export async function getCheckinsInRange(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select()
    .from(integrityDailyCheckins)
    .where(
      and(
        eq(integrityDailyCheckins.userId, userId),
        gte(integrityDailyCheckins.date, dateFrom),
        lte(integrityDailyCheckins.date, dateTo),
      ),
    )
    .orderBy(asc(integrityDailyCheckins.date));
}

export async function getAllCommitmentsForUser(userId: string) {
  return db
    .select()
    .from(integrityCommitments)
    .where(and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)));
}

export async function getCommitmentsByDateRange(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  return db
    .select()
    .from(integrityCommitments)
    .where(
      and(
        eq(integrityCommitments.userId, userId),
        isNull(integrityCommitments.deletedAt),
        gte(integrityCommitments.createdAt, dateFrom),
        lte(integrityCommitments.createdAt, dateTo),
      ),
    );
}

export async function getCategoryDistribution(userId: string) {
  const result = await db
    .select({
      category: integrityCommitments.category,
      count: count(),
    })
    .from(integrityCommitments)
    .where(and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)))
    .groupBy(integrityCommitments.category)
    .orderBy(desc(count()));
  return result;
}

export async function getDifficultyDistribution(userId: string) {
  const result = await db
    .select({
      difficulty: integrityCommitments.difficulty,
      count: count(),
      completed: sql<number>`COUNT(*) FILTER (WHERE status IN ('completed_unverified', 'completed_verified'))`,
    })
    .from(integrityCommitments)
    .where(and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)))
    .groupBy(integrityCommitments.difficulty);
  return result;
}

export async function getCompletionTrend(userId: string, dateFrom: string, dateTo: string) {
  const result = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      count: count(),
    })
    .from(integrityCommitments)
    .where(
      and(
        eq(integrityCommitments.userId, userId),
        isNull(integrityCommitments.deletedAt),
        gte(integrityCommitments.createdAt, new Date(dateFrom)),
        lte(integrityCommitments.createdAt, new Date(dateTo + "T23:59:59")),
      ),
    )
    .groupBy(sql`DATE(created_at)`)
    .orderBy(asc(sql`DATE(created_at)`));
  return result;
}

export async function getDayOfWeekDistribution(userId: string) {
  const all = await db
    .select({
      createdAt: integrityCommitments.createdAt,
      status: integrityCommitments.status,
    })
    .from(integrityCommitments)
    .where(and(eq(integrityCommitments.userId, userId), isNull(integrityCommitments.deletedAt)));

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

export async function getSnapshot(userId: string, date: string) {
  const result = await db
    .select()
    .from(integrityDailySnapshots)
    .where(
      and(
        eq(integrityDailySnapshots.userId, userId),
        eq(integrityDailySnapshots.date, date),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getLatestSnapshot(userId: string) {
  const result = await db
    .select()
    .from(integrityDailySnapshots)
    .where(eq(integrityDailySnapshots.userId, userId))
    .orderBy(desc(integrityDailySnapshots.date))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertSnapshot(input: CreateSnapshotInput & { id?: string }) {
  if (input.id) {
    const result = await db
      .update(integrityDailySnapshots)
      .set({
        score: input.score,
        streak: input.streak,
        level: input.level,
        levelTitle: input.levelTitle,
        subScores: input.subScores,
        commitmentRate: input.commitmentRate,
        isAllCompleted: input.isAllCompleted,
        updatedAt: new Date(),
      })
      .where(eq(integrityDailySnapshots.id, input.id))
      .returning();
    return result[0];
  }
  const result = await db.insert(integrityDailySnapshots).values(input).returning();
  return result[0];
}

export async function getSnapshotsInRange(userId: string, dateFrom: string, dateTo: string) {
  return db
    .select()
    .from(integrityDailySnapshots)
    .where(
      and(
        eq(integrityDailySnapshots.userId, userId),
        gte(integrityDailySnapshots.date, dateFrom),
        lte(integrityDailySnapshots.date, dateTo),
      ),
    )
    .orderBy(asc(integrityDailySnapshots.date));
}

export async function getExcuseTagDistribution(userId: string, dateFrom?: string, dateTo?: string) {
  const conditions = [eq(integrityDailyCheckins.userId, userId)];

  if (dateFrom) conditions.push(gte(integrityDailyCheckins.date, dateFrom));
  if (dateTo) conditions.push(lte(integrityDailyCheckins.date, dateTo));

  const results = await db
    .select({
      date: integrityDailyCheckins.date,
      excuseTags: integrityDailyCheckins.excuseTags,
    })
    .from(integrityDailyCheckins)
    .where(and(...conditions))
    .orderBy(desc(integrityDailyCheckins.date));

  const tagCounts: Record<string, number> = {};
  for (const row of results) {
    if (row.excuseTags) {
      for (const tag of row.excuseTags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
  }

  const sorted = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return sorted;
}

export async function getLinkedCommitments(userId: string, entityType: string, entityId: string) {
  return db
    .select()
    .from(integrityCommitments)
    .where(
      and(
        eq(integrityCommitments.userId, userId),
        eq(integrityCommitments.linkedEntityType, entityType),
        eq(integrityCommitments.linkedEntityId, entityId),
        isNull(integrityCommitments.deletedAt),
      ),
    );
}
