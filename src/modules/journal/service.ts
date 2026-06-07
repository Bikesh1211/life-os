import { cache } from "react";
import { z } from "zod";
import { moodEnum } from "./schema";
import {
  createEntry,
  getEntryById,
  getEntriesForUser,
  updateEntry,
  softDeleteEntry,
  getEntryCountForUser,
  getRecentEntriesForUser,
  getMoodDistribution,
  getCommonTags,
  type CreateJournalEntryInput,
  type JournalFilters,
} from "./repository";

const moodValues = moodEnum.enumValues;

export const createEntrySchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().optional(),
  mood: z.enum(moodValues).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  reflectionScore: z.number().int().min(1).max(10).optional(),
  isPrivate: z.boolean().optional(),
});

export const updateEntrySchema = createEntrySchema.partial();

export const journalFiltersSchema = z.object({
  search: z.string().optional(),
  mood: z.enum(moodValues).optional(),
  tags: z.array(z.string().max(50)).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minScore: z.coerce.number().int().min(1).max(10).optional(),
  maxScore: z.coerce.number().int().min(1).max(10).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateEntryParams = z.infer<typeof createEntrySchema>;
export type UpdateEntryParams = z.infer<typeof updateEntrySchema>;
export type JournalFiltersParams = z.infer<typeof journalFiltersSchema>;

export async function createJournalEntry(userId: string, params: CreateEntryParams) {
  const validated = createEntrySchema.parse(params);
  const input: CreateJournalEntryInput = {
    userId,
    title: validated.title,
    content: validated.content,
    mood: validated.mood,
    tags: validated.tags,
    reflectionScore: validated.reflectionScore,
    isPrivate: validated.isPrivate,
  };
  return createEntry(input);
}

export const getJournalEntry = cache(async (id: string, userId: string) => {
  return getEntryById(id, userId);
});

export const getJournalEntries = cache(async (userId: string, filters: Partial<JournalFiltersParams> = {}) => {
  const validated = journalFiltersSchema.parse(filters);
  const dbFilters: JournalFilters = {
    search: validated.search,
    mood: validated.mood,
    tags: validated.tags,
    dateFrom: validated.dateFrom ? new Date(validated.dateFrom) : undefined,
    dateTo: validated.dateTo ? new Date(validated.dateTo) : undefined,
    minScore: validated.minScore,
    maxScore: validated.maxScore,
    sortBy: validated.sortBy,
    sortOrder: validated.sortOrder,
    limit: validated.limit,
    offset: validated.offset,
  };
  return getEntriesForUser(userId, dbFilters);
});

export async function updateJournalEntry(id: string, userId: string, params: UpdateEntryParams) {
  const validated = updateEntrySchema.parse(params);
  return updateEntry(id, userId, validated);
}

export async function deleteJournalEntry(id: string, userId: string) {
  return softDeleteEntry(id, userId);
}

export async function getJournalStats(userId: string) {
  const [totalEntries, recentEntries, moodDistribution, commonTags] = await Promise.all([
    getEntryCountForUser(userId),
    getRecentEntriesForUser(userId, 30, 5),
    getMoodDistribution(userId, 30),
    getCommonTags(userId, 10),
  ]);

  return {
    totalEntries,
    recentEntries,
    moodDistribution,
    commonTags,
  };
}
