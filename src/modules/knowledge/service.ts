import { z } from "zod";
import {
  createEntry,
  getEntriesForUser,
  getEntryById,
  updateEntry,
  deleteEntry,
  searchEntries,
  createLink,
  getLinksForEntry,
  removeLink,
  getSubjects,
  getDueReviews,
} from "./repository";
import type { KnowledgeEntry, SearchKnowledgeParams } from "./repository";
import dayjs from "dayjs";

const difficultyValues = ["beginner", "intermediate", "advanced"] as const;
const reviewStatusValues = ["not_reviewed", "reviewing", "mastered"] as const;
const relationshipValues = ["related_to", "prerequisite", "builds_on", "references"] as const;

export const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  subject: z.string().min(1, "Subject is required").max(100),
  subcategory: z.string().max(100).optional(),
  dateLearned: z.string().datetime({ message: "Invalid date format" }),
  summary: z.string().max(5000).optional(),
  detailedNotes: z.string().max(50000).optional(),
  keyTakeaways: z.string().max(10000).optional(),
  examples: z.string().max(10000).optional(),
  resources: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(50).optional(),
  difficultyLevel: z.enum(difficultyValues).optional(),
  learningSource: z.string().max(100).optional(),
  resourceUrl: z.string().max(1000).optional(),
  masteryLevel: z.number().int().min(1).max(10).optional(),
  confidenceScore: z.number().int().min(1).max(10).optional(),
  timeSpent: z.number().int().min(0).optional(),
  nextActions: z.string().max(5000).optional(),
});

export const updateEntrySchema = z.object({
  title: z.string().min(1).max(300).optional(),
  subject: z.string().min(1).max(100).optional(),
  subcategory: z.string().max(100).optional(),
  dateLearned: z.string().datetime().optional(),
  summary: z.string().max(5000).optional(),
  detailedNotes: z.string().max(50000).optional(),
  keyTakeaways: z.string().max(10000).optional(),
  examples: z.string().max(10000).optional(),
  resources: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(50).optional(),
  difficultyLevel: z.enum(difficultyValues).optional(),
  learningSource: z.string().max(100).optional(),
  resourceUrl: z.string().max(1000).optional(),
  masteryLevel: z.number().int().min(1).max(10).optional(),
  confidenceScore: z.number().int().min(1).max(10).optional(),
  timeSpent: z.number().int().min(0).optional(),
  reviewStatus: z.enum(reviewStatusValues).optional(),
  lastReviewedAt: z.string().datetime().optional(),
  nextActions: z.string().max(5000).optional(),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  subject: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  masteryMin: z.number().int().min(1).max(10).optional(),
  masteryMax: z.number().int().min(1).max(10).optional(),
  learningSource: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "most_reviewed"]).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const createLinkSchema = z.object({
  linkedEntryId: z.string().uuid(),
  relationshipType: z.enum(relationshipValues).default("related_to"),
});

export type CreateEntryParams = z.infer<typeof createEntrySchema>;
export type UpdateEntryParams = z.infer<typeof updateEntrySchema>;
export type SearchParams = z.infer<typeof searchSchema>;

export async function createKnowledgeEntry(userId: string, params: CreateEntryParams) {
  const validated = createEntrySchema.parse(params);
  return createEntry({
    userId,
    title: validated.title,
    subject: validated.subject,
    subcategory: validated.subcategory,
    dateLearned: new Date(validated.dateLearned),
    summary: validated.summary,
    detailedNotes: validated.detailedNotes,
    keyTakeaways: validated.keyTakeaways,
    examples: validated.examples,
    resources: validated.resources,
    tags: validated.tags,
    difficultyLevel: validated.difficultyLevel,
    learningSource: validated.learningSource,
    resourceUrl: validated.resourceUrl,
    masteryLevel: validated.masteryLevel,
    confidenceScore: validated.confidenceScore,
    timeSpent: validated.timeSpent,
    nextActions: validated.nextActions,
  });
}

export async function getKnowledgeEntries(userId: string) {
  return getEntriesForUser(userId);
}

export async function getKnowledgeEntry(id: string, userId: string) {
  return getEntryById(id, userId);
}

export async function updateKnowledgeEntry(
  id: string,
  userId: string,
  params: UpdateEntryParams,
) {
  const validated = updateEntrySchema.parse(params);
  const input: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      if (key === "dateLearned" || key === "lastReviewedAt") {
        input[key] = new Date(value as string);
      } else {
        input[key] = value;
      }
    }
  }
  return updateEntry(id, userId, input);
}

export async function deleteKnowledgeEntry(id: string, userId: string) {
  return deleteEntry(id, userId);
}

export async function searchKnowledge(userId: string, params: SearchParams) {
  const validated = searchSchema.parse(params);
  const searchParams: SearchKnowledgeParams = {
    query: validated.query,
    subject: validated.subject,
    tags: validated.tags,
    dateFrom: validated.dateFrom ? new Date(validated.dateFrom) : undefined,
    dateTo: validated.dateTo ? new Date(validated.dateTo) : undefined,
    masteryMin: validated.masteryMin,
    masteryMax: validated.masteryMax,
    learningSource: validated.learningSource,
    sortBy: validated.sortBy,
    limit: validated.limit,
    offset: validated.offset,
  };
  return searchEntries(userId, searchParams);
}

export async function addEntryLink(
  entryId: string,
  userId: string,
  params: z.infer<typeof createLinkSchema>,
) {
  const validated = createLinkSchema.parse(params);
  return createLink(entryId, validated.linkedEntryId, validated.relationshipType, userId);
}

export async function getEntryLinks(entryId: string, userId: string) {
  return getLinksForEntry(entryId, userId);
}

export async function deleteEntryLink(linkId: string, userId: string) {
  return removeLink(linkId, userId);
}

export async function getEntrySubjects(userId: string) {
  return getSubjects(userId);
}

export async function getReviewQueue(userId: string) {
  return getDueReviews(userId);
}

export async function markAsReviewed(id: string, userId: string, masteryLevel?: number) {
  const entry = await getEntryById(id, userId);
  if (!entry) return null;

  const update: Record<string, unknown> = {
    lastReviewedAt: new Date(),
    reviewStatus: "reviewing",
  };
  if (masteryLevel !== undefined) {
    update.masteryLevel = masteryLevel;
  }
  return updateEntry(id, userId, update);
}

export async function markAsMastered(id: string, userId: string) {
  return updateEntry(id, userId, {
    reviewStatus: "mastered",
    lastReviewedAt: new Date(),
  } as unknown as Record<string, unknown>);
}

function computeDaysUntilNextReview(masteryLevel: number): number {
  if (masteryLevel <= 3) return 1;
  if (masteryLevel <= 5) return 3;
  if (masteryLevel <= 7) return 7;
  if (masteryLevel <= 9) return 14;
  return 30;
}

export function getNextReviewDate(lastReviewedAt: Date | null, masteryLevel: number): Date | null {
  if (!lastReviewedAt) return new Date();
  const days = computeDaysUntilNextReview(masteryLevel);
  return dayjs(lastReviewedAt).add(days, "day").toDate();
}

export async function getDashboardStats(userId: string) {
  const entries = await getEntriesForUser(userId);
  const now = dayjs();
  const total = entries.length;
  const today = entries.filter((e: any) => dayjs(e.dateLearned).isAfter(now.startOf("day")));
  const thisWeek = entries.filter((e: any) => dayjs(e.dateLearned).isAfter(now.subtract(7, "day")));
  const thisMonth = entries.filter((e: any) => dayjs(e.dateLearned).isAfter(now.subtract(30, "day")));
  const totalHours = entries.reduce((sum: number, e: any) => sum + (e.timeSpent ?? 0), 0) / 60;

  const subjectCounts: Record<string, number> = {};
  for (const e of entries) {
    subjectCounts[e.subject] = (subjectCounts[e.subject] ?? 0) + 1;
  }
  const mostActiveSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total,
    learnedToday: today.length,
    learnedThisWeek: thisWeek.length,
    learnedThisMonth: thisMonth.length,
    totalHours: Math.round(totalHours * 10) / 10,
    mostActiveSubject,
    entriesBySubject: subjectCounts,
  };
}
