import { cache } from "react";
import { z } from "zod";
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
  getJournalCoverage,
  createVersion,
  getEntryVersions,
  getVersionById,
  createBookmark,
  getEntryBookmarks,
  deleteBookmark,
  createHighlight,
  getEntryHighlights,
  updateHighlight,
  deleteHighlight,
  createWritingSession,
  endWritingSession,
  getEntrySessions,
  getSessionStats,
  type CreateJournalEntryInput,
  type JournalFilters,
} from "./repository";
import { createTimelineEvent } from "@/modules/timeline";

const moodValues = ["happy", "sad", "neutral", "anxious", "stressed", "motivated", "excited"] as const;

export const createEntrySchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().optional(),
  mood: z.enum(moodValues).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  reflectionScore: z.number().int().min(1).max(10).optional(),
  isPinned: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  eventDate: z.string().datetime().optional(),
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
    isPinned: validated.isPinned,
    isPrivate: validated.isPrivate,
    eventDate: validated.eventDate ? new Date(validated.eventDate) : undefined,
  };
  const entry = await createEntry(input);

  try {
    const eventDate = validated.eventDate ? new Date(validated.eventDate) : entry.createdAt;
    await createTimelineEvent(userId, {
      title: validated.title,
      description: validated.content?.slice(0, 200),
      eventDate: eventDate.toISOString(),
      category: "personal",
      importance: "medium",
      linkedEntityId: entry.id,
      linkedEntityType: "journal",
      tags: validated.tags,
    });
  } catch {}

  return entry;
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
  return updateEntry(id, userId, {
    ...validated,
    eventDate: validated.eventDate ? new Date(validated.eventDate) : undefined,
  });
}

export async function getJournalCoverageForUser(userId: string) {
  return getJournalCoverage(userId);
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

// ── Journal Versions ──

export const createVersionSchema = z.object({
  note: z.string().max(500).optional(),
});

export type CreateVersionParams = z.infer<typeof createVersionSchema>;

export async function saveJournalEntryVersion(entryId: string, userId: string, params: CreateVersionParams) {
  const entry = await getEntryById(entryId, userId);
  if (!entry) return null;

  const wordCount = countWords(entry.content ?? "");
  const version = await createVersion({
    entryId: entry.id,
    content: entry.content ?? "",
    title: entry.title,
    wordCount,
    note: params.note,
  });
  return version;
}

export async function getJournalEntryVersions(entryId: string) {
  return getEntryVersions(entryId);
}

export async function restoreJournalEntryVersion(versionId: string, entryId: string, userId: string) {
  const version = await getVersionById(versionId);
  if (!version || version.entryId !== entryId) return null;

  const entry = await getEntryById(entryId, userId);
  if (!entry) return null;

  return updateEntry(entryId, userId, {
    content: version.content,
    title: version.title,
  });
}

// ── Journal Bookmarks ──

export const createBookmarkSchema = z.object({
  position: z.any(),
  excerpt: z.string().max(500).optional(),
  label: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
});

export type CreateBookmarkParams = z.infer<typeof createBookmarkSchema>;

export async function addBookmark(userId: string, entryId: string, params: CreateBookmarkParams) {
  const validated = createBookmarkSchema.parse(params);
  return createBookmark({
    userId,
    entryId,
    position: validated.position,
    excerpt: validated.excerpt,
    label: validated.label,
    color: validated.color,
  });
}

export async function getEntryBookmarksForUser(userId: string, entryId: string) {
  return getEntryBookmarks(userId, entryId);
}

export async function removeBookmark(id: string, userId: string) {
  return deleteBookmark(id, userId);
}

// ── Journal Highlights ──

export const createHighlightSchema = z.object({
  position: z.any(),
  text: z.string().min(1).max(2000),
  color: z.string().max(50).optional(),
  note: z.string().max(1000).optional(),
});

export const updateHighlightSchema = z.object({
  color: z.string().max(50).optional(),
  note: z.string().max(1000).optional(),
});

export type CreateHighlightParams = z.infer<typeof createHighlightSchema>;
export type UpdateHighlightParams = z.infer<typeof updateHighlightSchema>;

export async function addHighlight(userId: string, entryId: string, params: CreateHighlightParams) {
  const validated = createHighlightSchema.parse(params);
  return createHighlight({
    userId,
    entryId,
    position: validated.position,
    text: validated.text,
    color: validated.color,
    note: validated.note,
  });
}

export async function getEntryHighlightsForUser(userId: string, entryId: string) {
  return getEntryHighlights(userId, entryId);
}

export async function modifyHighlight(id: string, userId: string, params: UpdateHighlightParams) {
  const validated = updateHighlightSchema.parse(params);
  return updateHighlight(id, userId, validated);
}

export async function removeHighlight(id: string, userId: string) {
  return deleteHighlight(id, userId);
}

// ── Journal Writing Sessions ──

export async function startJournalWritingSession(userId: string, entryId: string) {
  return createWritingSession({ userId, entryId, startedAt: new Date() });
}

export async function stopJournalWritingSession(id: string, userId: string, wordsAdded: number) {
  return endWritingSession(id, userId, new Date(), wordsAdded);
}

export async function getJournalEntrySessions(entryId: string, userId: string) {
  return getEntrySessions(entryId, userId);
}

export async function getJournalSessionStats(userId: string) {
  return getSessionStats(userId);
}

// ── Export ──

function countWords(content: string): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export async function exportEntryAsMarkdown(entryId: string, userId: string) {
  const entry = await getEntryById(entryId, userId);
  if (!entry) return null;

  const date = (entry.eventDate ?? entry.createdAt).toISOString().split("T")[0];
  const mood = entry.mood ? `*Mood:* ${entry.mood}\n` : "";
  const tags = entry.tags?.length ? `*Tags:* ${entry.tags.join(", ")}\n` : "";
  const score = entry.reflectionScore ? `*Reflection:* ${entry.reflectionScore}/10\n` : "";

  return `# ${entry.title}

*Date:* ${date}
${mood}${tags}${score}
---
${entry.content ?? ""}
`;
}

export async function exportEntryAsJson(entryId: string, userId: string) {
  const entry = await getEntryById(entryId, userId);
  if (!entry) return null;

  return {
    title: entry.title,
    date: (entry.eventDate ?? entry.createdAt).toISOString(),
    mood: entry.mood,
    tags: entry.tags,
    reflectionScore: entry.reflectionScore,
    isPinned: entry.isPinned,
    isPrivate: entry.isPrivate,
    content: entry.content,
  };
}
