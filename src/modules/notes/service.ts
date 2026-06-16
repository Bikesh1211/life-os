import { cache } from "react";
import { z } from "zod";
import {
  createNote,
  getNoteById,
  getNotesForUser,
  updateNote,
  softDeleteNote,
  restoreNote,
  duplicateNote,
  getNoteCountForUser,
  getRecentNotesForUser,
  createTag,
  getTagsForUser,
  updateTag,
  deleteTag,
  createFolder,
  getFoldersForUser,
  getFolderById,
  updateFolder,
  deleteFolder,
  createNoteLink,
  getNoteLinks,
  getBacklinks,
  deleteNoteLink,
  type CreateNoteInput,
  type UpdateNoteInput,
  type NoteFilters,
  type CreateNoteTagInput,
  type CreateNoteFolderInput,
} from "./repository";

const categories = ["personal", "work", "study", "ideas", "journal"] as const;
const priorities = ["low", "medium", "high"] as const;
const statuses = ["draft", "published", "archived"] as const;
const folderColors = ["blue", "green", "red", "yellow", "purple", "pink", "orange", "cyan", "teal", "grape"] as const;

export const createNoteSchema = z.object({
  title: z.string().max(300).default("Untitled"),
  content: z.string().optional(),
  contentJson: z.any().optional(),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().max(2000).optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isPinned: z.boolean().optional(),
  status: z.enum(statuses).optional(),
  folderId: z.string().uuid().optional().nullable(),
  reminderDate: z.string().datetime().optional().nullable(),
  priority: z.enum(priorities).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).optional(),
  status: z.enum(statuses).optional(),
  isPinned: z.coerce.boolean().optional(),
  priority: z.enum(priorities).optional(),
  folderId: z.string().optional(),
  includeArchived: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
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

export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional().nullable(),
  color: z.enum(folderColors).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateFolderSchema = createFolderSchema.partial();

export const createLinkSchema = z.object({
  linkedNoteId: z.string().uuid(),
});

export type CreateNoteParams = z.infer<typeof createNoteSchema>;
export type UpdateNoteParams = z.infer<typeof updateNoteSchema>;
export type NoteFiltersParams = z.infer<typeof noteFiltersSchema>;
export type CreateFolderParams = z.infer<typeof createFolderSchema>;

export async function createNoteEntry(userId: string, params: CreateNoteParams) {
  const validated = createNoteSchema.parse(params);
  const input: CreateNoteInput = {
    userId,
    title: validated.title,
    content: validated.content,
    contentJson: validated.contentJson,
    excerpt: validated.excerpt,
    coverImage: validated.coverImage,
    category: validated.category,
    tags: validated.tags,
    isPinned: validated.isPinned,
    status: validated.status,
    folderId: validated.folderId ?? undefined,
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
    status: validated.status,
    isPinned: validated.isPinned,
    priority: validated.priority,
    folderId: validated.folderId,
    includeArchived: validated.includeArchived,
    includeDeleted: validated.includeDeleted,
    sortBy: validated.sortBy,
    sortOrder: validated.sortOrder,
    limit: validated.limit,
    offset: validated.offset,
  };
  return getNotesForUser(userId, dbFilters);
});

export async function updateNoteEntry(id: string, userId: string, params: UpdateNoteParams) {
  const validated = updateNoteSchema.parse(params);
  const updateData: Record<string, unknown> = {};
  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.content !== undefined) updateData.content = validated.content;
  if (validated.contentJson !== undefined) updateData.contentJson = validated.contentJson;
  if (validated.excerpt !== undefined) updateData.excerpt = validated.excerpt;
  if (validated.coverImage !== undefined) updateData.coverImage = validated.coverImage;
  if (validated.category !== undefined) updateData.category = validated.category;
  if (validated.tags !== undefined) updateData.tags = validated.tags;
  if (validated.isPinned !== undefined) updateData.isPinned = validated.isPinned;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.folderId !== undefined) updateData.folderId = validated.folderId;
  if (validated.reminderDate !== undefined) updateData.reminderDate = validated.reminderDate ? new Date(validated.reminderDate) : null;
  if (validated.priority !== undefined) updateData.priority = validated.priority;

  return updateNote(id, userId, updateData);
}

export async function deleteNoteEntry(id: string, userId: string) {
  return softDeleteNote(id, userId);
}

export async function restoreNoteEntry(id: string, userId: string) {
  return restoreNote(id, userId);
}

export async function duplicateNoteEntry(id: string, userId: string) {
  return duplicateNote(id, userId);
}

export async function togglePinNote(id: string, userId: string) {
  const note = await getNoteById(id, userId);
  if (!note) return null;
  return updateNote(id, userId, { isPinned: !note.isPinned });
}

export async function toggleArchiveNote(id: string, userId: string) {
  const note = await getNoteById(id, userId);
  if (!note) return null;
  const newStatus = note.status === "archived" ? "published" : "archived";
  return updateNote(id, userId, { status: newStatus });
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

// ── Tags ──

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

// ── Folders ──

export async function createNoteFolder(userId: string, params: CreateFolderParams) {
  const validated = createFolderSchema.parse(params);
  const input: CreateNoteFolderInput = {
    userId,
    name: validated.name,
    parentId: validated.parentId ?? undefined,
    color: validated.color,
    icon: validated.icon,
    order: validated.order,
  };
  return createFolder(input);
}

export const getNoteFolders = cache(async (userId: string) => {
  const folders = await getFoldersForUser(userId);
  const notesCount = await getNoteCountForUser(userId);

  const folderStats = new Map<string, number>();
  for (const f of folders) {
    folderStats.set(f.id, 0);
  }

  return folders.map((f) => ({
    ...f,
    noteCount: folderStats.get(f.id) ?? 0,
  }));
});

export async function updateNoteFolder(id: string, userId: string, params: z.infer<typeof updateFolderSchema>) {
  const validated = updateFolderSchema.parse(params);
  return updateFolder(id, userId, {
    ...validated,
    parentId: validated.parentId ?? undefined,
  });
}

export async function deleteNoteFolder(id: string, userId: string) {
  return deleteFolder(id, userId);
}

// ── Links ──

export async function createNoteLinkEntry(noteId: string, linkedNoteId: string) {
  return createNoteLink(noteId, linkedNoteId);
}

export async function getNoteLinksWithDetails(noteId: string) {
  return getNoteLinks(noteId);
}

export async function getNoteBacklinks(noteId: string) {
  return getBacklinks(noteId);
}

export async function deleteNoteLinkEntry(linkId: string) {
  return deleteNoteLink(linkId);
}
