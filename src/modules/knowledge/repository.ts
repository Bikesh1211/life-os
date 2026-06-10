import { db } from "@/core/database";
import { knowledgeEntries, knowledgeEntryLinks, type difficultyLevelEnum, type reviewStatusEnum } from "./schema";
import { eq, and, isNull, desc, asc, sql, or } from "drizzle-orm";

export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type KnowledgeEntryLink = typeof knowledgeEntryLinks.$inferSelect;

export type CreateKnowledgeEntryInput = {
  userId: string;
  title: string;
  subject: string;
  subcategory?: string;
  dateLearned: Date;
  summary?: string;
  detailedNotes?: string;
  keyTakeaways?: string;
  examples?: string;
  resources?: string;
  tags?: string[];
  difficultyLevel?: typeof difficultyLevelEnum.enumValues[number];
  learningSource?: string;
  resourceUrl?: string;
  masteryLevel?: number;
  confidenceScore?: number;
  timeSpent?: number;
  nextActions?: string;
};

export type UpdateKnowledgeEntryInput = Partial<Omit<CreateKnowledgeEntryInput, "userId">>;

export type SearchKnowledgeParams = {
  query?: string;
  subject?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  masteryMin?: number;
  masteryMax?: number;
  learningSource?: string;
  sortBy?: "newest" | "oldest" | "most_reviewed";
  limit?: number;
  offset?: number;
};

export async function createEntry(input: CreateKnowledgeEntryInput) {
  const [entry] = await db
    .insert(knowledgeEntries)
    .values({
      userId: input.userId,
      title: input.title,
      subject: input.subject,
      subcategory: input.subcategory,
      dateLearned: input.dateLearned,
      summary: input.summary,
      detailedNotes: input.detailedNotes,
      keyTakeaways: input.keyTakeaways,
      examples: input.examples,
      resources: input.resources,
      tags: input.tags ?? [],
      difficultyLevel: input.difficultyLevel ?? "beginner",
      learningSource: input.learningSource,
      resourceUrl: input.resourceUrl,
      masteryLevel: input.masteryLevel ?? 1,
      confidenceScore: input.confidenceScore ?? 1,
      timeSpent: input.timeSpent,
      nextActions: input.nextActions,
    })
    .returning();
  return entry;
}

export async function getEntriesForUser(userId: string) {
  return db
    .select()
    .from(knowledgeEntries)
    .where(and(eq(knowledgeEntries.userId, userId), isNull(knowledgeEntries.deletedAt)))
    .orderBy(desc(knowledgeEntries.dateLearned));
}

export async function getEntryById(id: string, userId: string) {
  const [entry] = await db
    .select()
    .from(knowledgeEntries)
    .where(
      and(
        eq(knowledgeEntries.id, id),
        eq(knowledgeEntries.userId, userId),
        isNull(knowledgeEntries.deletedAt),
      ),
    );
  return entry ?? null;
}

export async function updateEntry(id: string, userId: string, input: UpdateKnowledgeEntryInput) {
  const [entry] = await db
    .update(knowledgeEntries)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(knowledgeEntries.id, id),
        eq(knowledgeEntries.userId, userId),
        isNull(knowledgeEntries.deletedAt),
      ),
    )
    .returning();
  return entry ?? null;
}

export async function deleteEntry(id: string, userId: string) {
  const [entry] = await db
    .update(knowledgeEntries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(knowledgeEntries.id, id),
        eq(knowledgeEntries.userId, userId),
        isNull(knowledgeEntries.deletedAt),
      ),
    )
    .returning();
  return entry ?? null;
}

export async function searchEntries(userId: string, params: SearchKnowledgeParams) {
  const conditions: (ReturnType<typeof sql>)[] = [
    sql`${knowledgeEntries.userId} = ${userId}`,
    sql`${knowledgeEntries.deletedAt} IS NULL`,
  ];

  if (params.query) {
    const pattern = `%${params.query}%`;
    conditions.push(sql`(
      ${knowledgeEntries.title} ILIKE ${pattern}
      OR ${knowledgeEntries.summary} ILIKE ${pattern}
      OR ${knowledgeEntries.detailedNotes} ILIKE ${pattern}
      OR ${knowledgeEntries.keyTakeaways} ILIKE ${pattern}
      OR ${params.query} = ANY(${knowledgeEntries.tags})
    )`);
  }

  if (params.subject) {
    conditions.push(sql`${knowledgeEntries.subject} = ${params.subject}`);
  }

  if (params.tags && params.tags.length > 0) {
    conditions.push(sql`${knowledgeEntries.tags} && ARRAY[${params.tags}]::text[]`);
  }

  if (params.dateFrom) {
    conditions.push(sql`${knowledgeEntries.dateLearned} >= ${params.dateFrom}`);
  }

  if (params.dateTo) {
    conditions.push(sql`${knowledgeEntries.dateLearned} <= ${params.dateTo}`);
  }

  if (params.masteryMin !== undefined) {
    conditions.push(sql`${knowledgeEntries.masteryLevel} >= ${params.masteryMin}`);
  }

  if (params.masteryMax !== undefined) {
    conditions.push(sql`${knowledgeEntries.masteryLevel} <= ${params.masteryMax}`);
  }

  if (params.learningSource) {
    conditions.push(sql`${knowledgeEntries.learningSource} = ${params.learningSource}`);
  }

  let orderBy = sql`${knowledgeEntries.dateLearned} DESC`;
  if (params.sortBy === "oldest") {
    orderBy = sql`${knowledgeEntries.dateLearned} ASC`;
  } else if (params.sortBy === "most_reviewed") {
    orderBy = sql`${knowledgeEntries.lastReviewedAt} DESC NULLS LAST`;
  }

  return db
    .select()
    .from(knowledgeEntries)
    .where(sql.join(conditions, sql` AND `))
    .orderBy(orderBy)
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0);
}

export async function createLink(
  entryId: string,
  linkedEntryId: string,
  relationshipType: string,
  userId: string,
) {
  const entry = await getEntryById(entryId, userId);
  const linked = await getEntryById(linkedEntryId, userId);
  if (!entry || !linked) return null;

  const [link] = await db
    .insert(knowledgeEntryLinks)
    .values({ entryId, linkedEntryId, relationshipType })
    .returning();
  return link;
}

export async function getLinksForEntry(entryId: string, userId: string) {
  const entry = await getEntryById(entryId, userId);
  if (!entry) return [];

  return db
    .select({
      link: knowledgeEntryLinks,
      linkedEntry: knowledgeEntries,
    })
    .from(knowledgeEntryLinks)
    .innerJoin(
      knowledgeEntries,
      eq(knowledgeEntryLinks.linkedEntryId, knowledgeEntries.id),
    )
    .where(
      and(
        eq(knowledgeEntryLinks.entryId, entryId),
        isNull(knowledgeEntries.deletedAt),
      ),
    );
}

export async function removeLink(linkId: string, userId: string) {
  const [link] = await db
    .select()
    .from(knowledgeEntryLinks)
    .where(eq(knowledgeEntryLinks.id, linkId))
    .limit(1);

  if (!link) return null;

  const entry = await getEntryById(link.entryId, userId);
  if (!entry) return null;

  const [deleted] = await db
    .delete(knowledgeEntryLinks)
    .where(eq(knowledgeEntryLinks.id, linkId))
    .returning();
  return deleted;
}

export async function getSubjects(userId: string) {
  const rows = await db
    .select({ subject: knowledgeEntries.subject })
    .from(knowledgeEntries)
    .where(
      and(
        eq(knowledgeEntries.userId, userId),
        isNull(knowledgeEntries.deletedAt),
      ),
    )
    .groupBy(knowledgeEntries.subject)
    .orderBy(knowledgeEntries.subject);

  return rows.map((r) => r.subject);
}

export async function getDueReviews(userId: string) {
  return db
    .select()
    .from(knowledgeEntries)
    .where(
      and(
        eq(knowledgeEntries.userId, userId),
        isNull(knowledgeEntries.deletedAt),
        sql`${knowledgeEntries.reviewStatus} != 'mastered'`,
        or(
          isNull(knowledgeEntries.lastReviewedAt),
          sql`${knowledgeEntries.lastReviewedAt} <= NOW() - INTERVAL '1 day'`,
        ),
      ),
    )
    .orderBy(asc(knowledgeEntries.lastReviewedAt));
}
