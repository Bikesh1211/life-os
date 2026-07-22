import { db } from "@/core/database";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  scripts,
  scriptSections,
  scriptCategories,
  scriptVersions,
  scriptPracticeSessions,
  scriptQuestions,
  scriptActionItems,
  scriptChecklistItems,
  scriptStructureTemplates,
} from "./schema";

export type Script = typeof scripts.$inferSelect;
export type ScriptSection = typeof scriptSections.$inferSelect;
export type ScriptCategory = typeof scriptCategories.$inferSelect;
export type ScriptVersion = typeof scriptVersions.$inferSelect;
export type ScriptPracticeSession = typeof scriptPracticeSessions.$inferSelect;
export type ScriptQuestion = typeof scriptQuestions.$inferSelect;
export type ScriptActionItem = typeof scriptActionItems.$inferSelect;
export type ScriptChecklistItem = typeof scriptChecklistItems.$inferSelect;

export type CreateScriptInput = typeof scripts.$inferInsert;
export type CreateScriptSectionInput = typeof scriptSections.$inferInsert;
export type CreateScriptCategoryInput = typeof scriptCategories.$inferInsert;
export type CreateScriptVersionInput = typeof scriptVersions.$inferInsert;
export type CreateScriptPracticeSessionInput = typeof scriptPracticeSessions.$inferInsert;
export type CreateScriptQuestionInput = typeof scriptQuestions.$inferInsert;
export type CreateScriptActionItemInput = typeof scriptActionItems.$inferInsert;
export type CreateScriptChecklistItemInput = typeof scriptChecklistItems.$inferInsert;

// ── Scripts ──

export async function createScript(input: CreateScriptInput) {
  const [script] = await db.insert(scripts).values(input).returning();
  return script;
}

export async function getScriptsForUser(
  userId: string,
  opts: {
    status?: string;
    search?: string;
    categoryId?: string;
    tags?: string[];
    priority?: string;
    difficulty?: string;
    isFavorite?: boolean;
    sortBy?: "createdAt" | "title" | "updatedAt" | "eventDate" | "wordCount";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
    includeTrashed?: boolean;
  } = {},
) {
  const conditions: SQL[] = [
    eq(scripts.userId, userId),
    opts.includeTrashed ? sql`${scripts.deletedAt} is not null` : isNull(scripts.deletedAt),
  ];

  if (opts.status) conditions.push(eq(scripts.status, opts.status as never));
  if (opts.categoryId) conditions.push(eq(scripts.categoryId, opts.categoryId));
  if (opts.priority) conditions.push(eq(scripts.priority, opts.priority as never));
  if (opts.difficulty) conditions.push(eq(scripts.difficulty, opts.difficulty as never));
  if (opts.isFavorite !== undefined) conditions.push(eq(scripts.isFavorite, opts.isFavorite));
  if (opts.search) {
    conditions.push(
      sql`to_tsvector('english', ${scripts.title} || ' ' || coalesce(${scripts.subtitle}, '') || ' ' || coalesce(${scripts.speaker}, '') || ' ' || coalesce(${scripts.venue}, '')) @@ plainto_tsquery('english', ${opts.search})`,
    );
  }
  if (opts.tags && opts.tags.length > 0) {
    conditions.push(
      sql`${scripts.tags} && ${sql`ARRAY[${sql.join(opts.tags.map((t) => sql`${t}`), sql`, `)}]::text[]`}`,
    );
  }

  const orderCol = opts.sortBy ? scripts[opts.sortBy] : scripts.createdAt;
  const orderFn = opts.sortOrder === "asc" ? asc : desc;

  return db
    .select()
    .from(scripts)
    .where(and(...conditions))
    .orderBy(orderFn(orderCol))
    .limit(opts.limit ?? 100)
    .offset(opts.offset ?? 0);
}

export async function getScriptById(id: string, userId: string) {
  const [script] = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, id), eq(scripts.userId, userId), isNull(scripts.deletedAt)));
  return script ?? null;
}

export async function updateScript(id: string, userId: string, input: Partial<CreateScriptInput>) {
  const [script] = await db
    .update(scripts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(scripts.id, id), eq(scripts.userId, userId)))
    .returning();
  return script ?? null;
}

export async function deleteScript(id: string, userId: string) {
  const [script] = await db
    .update(scripts)
    .set({ deletedAt: new Date() })
    .where(and(eq(scripts.id, id), eq(scripts.userId, userId)))
    .returning();
  return script ?? null;
}

export async function getScriptDashboardStats(userId: string) {
  const [stats] = await db
    .select({
      totalScripts: sql<number>`count(*)::int`,
      draftCount: sql<number>`count(*) filter (where ${scripts.status} = 'draft')::int`,
      practicingCount: sql<number>`count(*) filter (where ${scripts.status} = 'practicing')::int`,
      readyCount: sql<number>`count(*) filter (where ${scripts.status} = 'ready')::int`,
      archivedCount: sql<number>`count(*) filter (where ${scripts.status} = 'archived')::int`,
      favoriteCount: sql<number>`count(*) filter (where ${scripts.isFavorite} = true)::int`,
      totalWordCount: sql<number>`coalesce(sum(${scripts.wordCount})::int, 0)`,
      totalDuration: sql<number>`coalesce(sum(${scripts.totalDurationSeconds})::int, 0)`,
    })
    .from(scripts)
    .where(and(eq(scripts.userId, userId), isNull(scripts.deletedAt)));

  return stats ?? {
    totalScripts: 0,
    draftCount: 0,
    practicingCount: 0,
    readyCount: 0,
    archivedCount: 0,
    favoriteCount: 0,
    totalWordCount: 0,
    totalDuration: 0,
  };
}

export async function getUpcomingScripts(userId: string, limit = 5) {
  return db
    .select()
    .from(scripts)
    .where(
      and(
        eq(scripts.userId, userId),
        isNull(scripts.deletedAt),
        sql`${scripts.eventDate} is not null`,
        sql`${scripts.eventDate} >= now()`,
      ),
    )
    .orderBy(asc(scripts.eventDate))
    .limit(limit);
}

export async function getRecentScripts(userId: string, limit = 5) {
  return db
    .select()
    .from(scripts)
    .where(and(eq(scripts.userId, userId), isNull(scripts.deletedAt)))
    .orderBy(desc(scripts.updatedAt))
    .limit(limit);
}

export async function getFavoriteScripts(userId: string, limit = 5) {
  return db
    .select()
    .from(scripts)
    .where(and(eq(scripts.userId, userId), eq(scripts.isFavorite, true), isNull(scripts.deletedAt)))
    .orderBy(desc(scripts.updatedAt))
    .limit(limit);
}

// ── Sections ──

export async function createSection(input: CreateScriptSectionInput) {
  const [section] = await db.insert(scriptSections).values(input).returning();
  return section;
}

export async function getSectionsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptSections)
    .where(eq(scriptSections.scriptId, scriptId))
    .orderBy(asc(scriptSections.sortOrder));
}

export async function getSectionById(id: string) {
  const [section] = await db.select().from(scriptSections).where(eq(scriptSections.id, id));
  return section ?? null;
}

export async function updateSection(id: string, input: Partial<CreateScriptSectionInput>) {
  const [section] = await db
    .update(scriptSections)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(scriptSections.id, id))
    .returning();
  return section ?? null;
}

export async function deleteSection(id: string) {
  const [section] = await db.delete(scriptSections).where(eq(scriptSections.id, id)).returning();
  return section ?? null;
}

export async function reorderSections(items: { id: string; sortOrder: number }[]) {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(scriptSections)
        .set({ sortOrder: item.sortOrder })
        .where(eq(scriptSections.id, item.id));
    }
  });
}

export async function getScriptWordCount(scriptId: string) {
  const [result] = await db
    .select({
      totalWords: sql<number>`coalesce(sum(${scriptSections.wordCount})::int, 0)`,
      sectionCount: sql<number>`count(*)::int`,
      totalDuration: sql<number>`coalesce(sum(${scriptSections.estimatedDurationSeconds})::int, 0)`,
    })
    .from(scriptSections)
    .where(eq(scriptSections.scriptId, scriptId));
  return result ?? { totalWords: 0, sectionCount: 0, totalDuration: 0 };
}

// ── Categories ──

export async function createScriptCategory(input: CreateScriptCategoryInput) {
  const [cat] = await db.insert(scriptCategories).values(input).returning();
  return cat;
}

export async function getCategoriesForUser(userId: string) {
  return db
    .select()
    .from(scriptCategories)
    .where(and(eq(scriptCategories.userId, userId), eq(scriptCategories.isArchived, false)))
    .orderBy(asc(scriptCategories.sortOrder));
}

export async function getAllCategories() {
  return db
    .select()
    .from(scriptCategories)
    .orderBy(asc(scriptCategories.sortOrder));
}

export async function getCategoryById(id: string) {
  const [cat] = await db.select().from(scriptCategories).where(eq(scriptCategories.id, id));
  return cat ?? null;
}

export async function updateScriptCategory(id: string, input: Partial<CreateScriptCategoryInput>) {
  const [cat] = await db
    .update(scriptCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(scriptCategories.id, id))
    .returning();
  return cat ?? null;
}

export async function deleteScriptCategory(id: string) {
  const [cat] = await db.delete(scriptCategories).where(eq(scriptCategories.id, id)).returning();
  return cat ?? null;
}

// ── Structure Templates ──

export async function getTemplatesForCategory(categoryId: string) {
  return db
    .select()
    .from(scriptStructureTemplates)
    .where(eq(scriptStructureTemplates.categoryId, categoryId));
}

export async function getAllTemplates() {
  return db.select().from(scriptStructureTemplates);
}

// ── Versions ──

export async function createScriptVersion(input: CreateScriptVersionInput) {
  const [version] = await db.insert(scriptVersions).values(input).returning();
  return version;
}

export async function getVersionsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(desc(scriptVersions.createdAt));
}

export async function getVersionById(id: string) {
  const [version] = await db.select().from(scriptVersions).where(eq(scriptVersions.id, id));
  return version ?? null;
}

// ── Practice Sessions ──

export async function createPracticeSession(input: CreateScriptPracticeSessionInput) {
  const [session] = await db.insert(scriptPracticeSessions).values(input).returning();
  return session;
}

export async function getPracticeSessionsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptPracticeSessions)
    .where(eq(scriptPracticeSessions.scriptId, scriptId))
    .orderBy(desc(scriptPracticeSessions.practicedAt));
}

export async function getRecentPracticeSessions(userId: string, limit = 10) {
  return db
    .select()
    .from(scriptPracticeSessions)
    .where(eq(scriptPracticeSessions.userId, userId))
    .orderBy(desc(scriptPracticeSessions.practicedAt))
    .limit(limit);
}

export async function getPracticeSessionById(id: string) {
  const [session] = await db.select().from(scriptPracticeSessions).where(eq(scriptPracticeSessions.id, id));
  return session ?? null;
}

export async function getPracticeSessionStats(userId: string) {
  const [stats] = await db
    .select({
      totalSessions: sql<number>`count(*)::int`,
      totalDuration: sql<number>`coalesce(sum(${scriptPracticeSessions.durationSeconds})::int, 0)`,
      avgConfidence: sql<number>`coalesce(avg(${scriptPracticeSessions.confidence})::float, 0)`,
      avgRating: sql<number>`coalesce(avg(${scriptPracticeSessions.rating})::float, 0)`,
      avgVoiceQuality: sql<number>`coalesce(avg(${scriptPracticeSessions.voiceQuality})::float, 0)`,
      avgEyeContact: sql<number>`coalesce(avg(${scriptPracticeSessions.eyeContact})::float, 0)`,
    })
    .from(scriptPracticeSessions)
    .where(eq(scriptPracticeSessions.userId, userId));
  return stats ?? {
    totalSessions: 0,
    totalDuration: 0,
    avgConfidence: 0,
    avgRating: 0,
    avgVoiceQuality: 0,
    avgEyeContact: 0,
  };
}

// ── Questions ──

export async function createQuestion(input: CreateScriptQuestionInput) {
  const [question] = await db.insert(scriptQuestions).values(input).returning();
  return question;
}

export async function getQuestionsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptQuestions)
    .where(eq(scriptQuestions.scriptId, scriptId))
    .orderBy(desc(scriptQuestions.createdAt));
}

export async function getQuestionById(id: string) {
  const [question] = await db.select().from(scriptQuestions).where(eq(scriptQuestions.id, id));
  return question ?? null;
}

export async function updateQuestion(id: string, input: Partial<CreateScriptQuestionInput>) {
  const [question] = await db
    .update(scriptQuestions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(scriptQuestions.id, id))
    .returning();
  return question ?? null;
}

export async function deleteQuestion(id: string) {
  const [question] = await db.delete(scriptQuestions).where(eq(scriptQuestions.id, id)).returning();
  return question ?? null;
}

// ── Action Items ──

export async function createActionItem(input: CreateScriptActionItemInput) {
  const [item] = await db.insert(scriptActionItems).values(input).returning();
  return item;
}

export async function getActionItemsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptActionItems)
    .where(eq(scriptActionItems.scriptId, scriptId))
    .orderBy(asc(scriptActionItems.sortOrder));
}

export async function updateActionItem(id: string, input: Partial<CreateScriptActionItemInput>) {
  const [item] = await db
    .update(scriptActionItems)
    .set(input)
    .where(eq(scriptActionItems.id, id))
    .returning();
  return item ?? null;
}

export async function deleteActionItem(id: string) {
  const [item] = await db.delete(scriptActionItems).where(eq(scriptActionItems.id, id)).returning();
  return item ?? null;
}

// ── Checklist Items ──

export async function createChecklistItem(input: CreateScriptChecklistItemInput) {
  const [item] = await db.insert(scriptChecklistItems).values(input).returning();
  return item;
}

export async function getChecklistItemsForScript(scriptId: string) {
  return db
    .select()
    .from(scriptChecklistItems)
    .where(eq(scriptChecklistItems.scriptId, scriptId))
    .orderBy(asc(scriptChecklistItems.sortOrder));
}

export async function updateChecklistItem(id: string, input: Partial<CreateScriptChecklistItemInput>) {
  const [item] = await db
    .update(scriptChecklistItems)
    .set(input)
    .where(eq(scriptChecklistItems.id, id))
    .returning();
  return item ?? null;
}

export async function deleteChecklistItem(id: string) {
  const [item] = await db.delete(scriptChecklistItems).where(eq(scriptChecklistItems.id, id)).returning();
  return item ?? null;
}
