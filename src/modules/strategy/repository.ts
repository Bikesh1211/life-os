import { db } from "@/core/database/client";
import { strategySections, strategyVersions } from "./schema";
import { and, eq, isNull, asc, desc, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type StrategySection = InferSelectModel<typeof strategySections>;
export type StrategyVersion = InferSelectModel<typeof strategyVersions>;

export type CreateSectionInput = {
  userId: string;
  sectionType: string;
  content: unknown;
  sortOrder?: number;
  isPinned?: boolean;
};

export type UpdateSectionInput = {
  content?: unknown;
  sortOrder?: number;
  isPinned?: boolean;
};

export type CreateVersionInput = {
  userId: string;
  snapshot: unknown;
  summary?: string;
  wordCount: number;
};

export async function getAllSections(userId: string): Promise<StrategySection[]> {
  return db
    .select()
    .from(strategySections)
    .where(and(eq(strategySections.userId, userId), isNull(strategySections.deletedAt)))
    .orderBy(asc(strategySections.sectionType), asc(strategySections.sortOrder));
}

export async function getSectionsByType(userId: string, sectionType: string): Promise<StrategySection[]> {
  return db
    .select()
    .from(strategySections)
    .where(
      and(eq(strategySections.userId, userId), eq(strategySections.sectionType, sectionType), isNull(strategySections.deletedAt)),
    )
    .orderBy(asc(strategySections.sortOrder));
}

export async function createSection(input: CreateSectionInput): Promise<StrategySection> {
  const [section] = await db
    .insert(strategySections)
    .values({
      userId: input.userId,
      sectionType: input.sectionType,
      content: input.content,
      sortOrder: input.sortOrder ?? 0,
      isPinned: input.isPinned ?? false,
    })
    .returning();
  return section;
}

export async function updateSection(id: string, userId: string, input: UpdateSectionInput): Promise<StrategySection | null> {
  const [section] = await db
    .update(strategySections)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(strategySections.id, id), eq(strategySections.userId, userId), isNull(strategySections.deletedAt)))
    .returning();
  return section ?? null;
}

export async function softDeleteSection(id: string, userId: string): Promise<StrategySection | null> {
  const [section] = await db
    .update(strategySections)
    .set({ deletedAt: new Date() })
    .where(and(eq(strategySections.id, id), eq(strategySections.userId, userId)))
    .returning();
  return section ?? null;
}

export async function getNextSortOrder(userId: string, sectionType: string): Promise<number> {
  const [result] = await db
    .select({ max: sql<number>`COALESCE(MAX(${strategySections.sortOrder}), -1) + 1` })
    .from(strategySections)
    .where(
      and(eq(strategySections.userId, userId), eq(strategySections.sectionType, sectionType), isNull(strategySections.deletedAt)),
    );
  return result.max;
}

export async function getSectionWordCount(userId: string): Promise<number> {
  const sections = await getAllSections(userId);
  let total = 0;
  for (const section of sections) {
    total += countWordsInContent(section.content);
  }
  return total;
}

function countWordsInContent(content: unknown): number {
  if (!content) return 0;
  return JSON.stringify(content).trim().split(/\s+/).filter(Boolean).length;
}

export async function getNextVersionNumber(userId: string): Promise<number> {
  const [result] = await db
    .select({ max: sql<number>`COALESCE(MAX(${strategyVersions.versionNumber}), 0) + 1` })
    .from(strategyVersions)
    .where(eq(strategyVersions.userId, userId));
  return result.max;
}

export async function createVersion(input: CreateVersionInput & { versionNumber: number }): Promise<StrategyVersion> {
  const [version] = await db
    .insert(strategyVersions)
    .values({
      userId: input.userId,
      versionNumber: input.versionNumber,
      snapshot: input.snapshot,
      summary: input.summary,
      wordCount: input.wordCount,
    })
    .returning();
  return version;
}

export async function getVersions(userId: string): Promise<StrategyVersion[]> {
  return db
    .select()
    .from(strategyVersions)
    .where(eq(strategyVersions.userId, userId))
    .orderBy(desc(strategyVersions.versionNumber));
}

export async function getVersionById(id: string, userId: string): Promise<StrategyVersion | null> {
  const [version] = await db
    .select()
    .from(strategyVersions)
    .where(and(eq(strategyVersions.id, id), eq(strategyVersions.userId, userId)));
  return version ?? null;
}
