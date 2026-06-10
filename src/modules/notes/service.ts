import { cache } from "react";
import { z } from "zod";
import {
  createNote,
  getNoteById,
  getNotesForUser,
  updateNote,
  softDeleteNote,
  getNoteCountForUser,
  getRecentNotesForUser,
  createTag,
  getTagsForUser,
  updateTag,
  deleteTag,
  type CreateNoteInput,
  type UpdateNoteInput,
  type NoteFilters,
  type CreateNoteTagInput,
} from "./repository";

const categories = ["personal", "work", "study", "ideas", "journal"] as const;
const priorities = ["low", "medium", "high"] as const;

export const createNoteSchema = z.object({
  title: z.string().max(300).default("Untitled"),
  content: z.string().optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  reminderDate: z.string().datetime().optional().nullable(),
  priority: z.enum(priorities).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isArchived: z.coerce.boolean().optional(),
  isPinned: z.coerce.boolean().optional(),
  priority: z.enum(priorities).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().min(1).max(20).optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().min(1).max(20).optional(),
});

export type CreateNoteParams = z.infer<typeof createNoteSchema>;
export type UpdateNoteParams = z.infer<typeof updateNoteSchema>;
export type NoteFiltersParams = z.infer<typeof noteFiltersSchema>;

export async function createNoteEntry(userId: string, params: CreateNoteParams) {
  const validated = createNoteSchema.parse(params);
  const input: CreateNoteInput = {
    userId,
    title: validated.title,
    content: validated.content,
    category: validated.category,
    tags: validated.tags,
    isPinned: validated.isPinned,
    isArchived: validated.isArchived,
    reminderDate: validated.reminderDate ? new Date(validated.reminderDate) : undefined,
    priority: validated.priority,
  };
  return createNote(input);
}

export const getNote = cache(async (id: string, userId: string) => {
  return getNoteById(id, userId);
});

export const getNotes = cache(async (userId: string, filters: Partial<NoteFiltersParams> = {}) => {
  const validated = noteFiltersSchema.parse(filters);
  const dbFilters: NoteFilters = {
    search: validated.search,
    category: validated.category,
    tags: validated.tags,
    isArchived: validated.isArchived,
    isPinned: validated.isPinned,
    priority: validated.priority,
    sortBy: validated.sortBy,
    sortOrder: validated.sortOrder,
    limit: validated.limit,
    offset: validated.offset,
  };
  return getNotesForUser(userId, dbFilters);
});

export async function updateNoteEntry(id: string, userId: string, params: UpdateNoteParams) {
  const validated = updateNoteSchema.parse(params);
  return updateNote(id, userId, {
    ...validated,
    reminderDate: validated.reminderDate ? new Date(validated.reminderDate) : undefined,
  });
}

export async function deleteNoteEntry(id: string, userId: string) {
  return softDeleteNote(id, userId);
}

export async function togglePinNote(id: string, userId: string) {
  const note = await getNoteById(id, userId);
  if (!note) return null;
  return updateNote(id, userId, { isPinned: !note.isPinned });
}

export async function toggleArchiveNote(id: string, userId: string) {
  const note = await getNoteById(id, userId);
  if (!note) return null;
  return updateNote(id, userId, { isArchived: !note.isArchived });
}

export async function getNoteStats(userId: string) {
  const [totalNotes, recentNotes] = await Promise.all([
    getNoteCountForUser(userId),
    getRecentNotesForUser(userId, 5),
  ]);

  return {
    totalNotes,
    recentNotes,
  };
}

export async function createNoteTag(userId: string, params: z.infer<typeof createTagSchema>) {
  const validated = createTagSchema.parse(params);
  const input: CreateNoteTagInput = {
    userId,
    name: validated.name,
    color: validated.color,
  };
  return createTag(input);
}

export const getNoteTags = cache(async (userId: string) => {
  return getTagsForUser(userId);
});

export async function updateNoteTag(id: string, userId: string, params: z.infer<typeof updateTagSchema>) {
  const validated = updateTagSchema.parse(params);
  return updateTag(id, userId, validated);
}

export async function deleteNoteTag(id: string, userId: string) {
  return deleteTag(id, userId);
}
