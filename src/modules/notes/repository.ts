import { db } from "@/core/database";
import { notes, noteTags, noteFolders, noteLinks } from "./schema";
import { eq, and, isNull, desc, asc, sql, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export type Note = typeof notes.$inferSelect;
export type NoteTag = typeof noteTags.$inferSelect;
export type NoteFolder = typeof noteFolders.$inferSelect;
export type NoteLink = typeof noteLinks.$inferSelect;

export type CreateNoteInput = {
  userId: string;
  title: string;
  content?: string;
  contentJson?: unknown;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  status?: string;
  folderId?: string;
  reminderDate?: Date;
  priority?: string;
};

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "userId">>;

export type CreateNoteTagInput = {
  userId: string;
  name: string;
  color?: string;
};

export type CreateNoteFolderInput = {
  userId: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
  order?: number;
};

export type NoteFilters = {
  search?: string;
  category?: string;
  tags?: string[];
  status?: string;
  isPinned?: boolean;
  priority?: string;
  folderId?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export const noteColumns = {
  id: notes.id,
  userId: notes.userId,
  title: notes.title,
  content: notes.content,
  contentJson: notes.contentJson,
  excerpt: notes.excerpt,
  coverImage: notes.coverImage,
  category: notes.category,
  tags: notes.tags,
  isPinned: notes.isPinned,
  status: notes.status,
  folderId: notes.folderId,
  reminderDate: notes.reminderDate,
  priority: notes.priority,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
  deletedAt: notes.deletedAt,
};

// ── Notes ──

export async function createNote(input: CreateNoteInput) {
  const [note] = await db
    .insert(notes)
    .values({
      userId: input.userId,
      title: input.title,
      content: input.content ?? null,
      contentJson: input.contentJson ?? null,
      excerpt: input.excerpt ?? null,
      coverImage: input.coverImage ?? null,
      category: input.category ?? "personal",
      tags: input.tags ?? [],
      isPinned: input.isPinned ?? false,
      status: input.status ?? "published",
      folderId: input.folderId ?? null,
      reminderDate: input.reminderDate,
      priority: input.priority ?? "medium",
    })
    .returning(noteColumns);
  return note;
}

export async function getNoteById(id: string, userId: string) {
  const [note] = await db
    .select(noteColumns)
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)))
    .limit(1);
  return note ?? null;
}

export async function getNotesForUser(userId: string, filters: NoteFilters = {}) {
  const conditions: (SQL | undefined)[] = [
    eq(notes.userId, userId),
  ];

  if (filters.includeDeleted) {
    conditions.push(sql`${notes.deletedAt} IS NOT NULL`);
  } else {
    conditions.push(isNull(notes.deletedAt));

    if (filters.includeArchived) {
      // show all statuses including archived
    } else if (filters.status) {
      conditions.push(eq(notes.status, filters.status));
    } else {
      conditions.push(or(eq(notes.status, "published"), eq(notes.status, "draft")));
    }
  }

  if (filters.search) {
    conditions.push(
      sql`(to_tsvector('english', ${notes.title}) || to_tsvector('english', ${notes.content}) @@ plainto_tsquery('english', ${filters.search}))`,
    );
  }
  if (filters.category) {
    conditions.push(eq(notes.category, filters.category));
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(sql`${notes.tags} @> ${filters.tags}::text[]`);
  }
  if (filters.isPinned !== undefined) {
    conditions.push(eq(notes.isPinned, filters.isPinned));
  }
  if (filters.priority) {
    conditions.push(eq(notes.priority, filters.priority));
  }
  if (filters.folderId) {
    conditions.push(eq(notes.folderId, filters.folderId));
  }

  const orderByMap = {
    createdAt: notes.createdAt,
    updatedAt: notes.updatedAt,
    title: notes.title,
  };

  const orderColumn = orderByMap[filters.sortBy ?? "updatedAt"];
  const orderDirection = filters.sortOrder === "asc" ? asc : desc;

  const entries = await db
    .select(noteColumns)
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.isPinned), orderDirection(orderColumn))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  return entries;
}

export async function updateNote(id: string, userId: string, input: UpdateNoteInput) {
  const [note] = await db
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)))
    .returning(noteColumns);
  return note ?? null;
}

export async function softDeleteNote(id: string, userId: string) {
  const [note] = await db
    .update(notes)
    .set({ deletedAt: new Date(), status: "archived" })
    .where(and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)))
    .returning(noteColumns);
  return note ?? null;
}

export async function restoreNote(id: string, userId: string) {
  const [note] = await db
    .update(notes)
    .set({ deletedAt: null, status: "published" })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning(noteColumns);
  return note ?? null;
}

export async function duplicateNote(id: string, userId: string) {
  const original = await getNoteById(id, userId);
  if (!original) return null;

  const [note] = await db
    .insert(notes)
    .values({
      userId,
      title: `${original.title} (Copy)`,
      content: original.content,
      contentJson: original.contentJson,
      excerpt: original.excerpt,
      category: original.category ?? "personal",
      tags: original.tags ?? [],
      isPinned: false,
      status: "draft",
      folderId: original.folderId,
      priority: original.priority ?? "medium",
    })
    .returning(noteColumns);
  return note;
}

export async function hardDeleteExpiredNotes(daysRetained = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysRetained);
  await db
    .delete(notes)
    .where(and(sql`${notes.deletedAt} < ${cutoff}`, sql`${notes.deletedAt} IS NOT NULL`));
}

export async function getNoteCountForUser(userId: string, status?: string) {
  const conditions: (SQL | undefined)[] = [
    eq(notes.userId, userId),
    isNull(notes.deletedAt),
  ];
  if (status) conditions.push(eq(notes.status, status));
  else conditions.push(or(eq(notes.status, "published"), eq(notes.status, "draft")));

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .where(and(...conditions));
  return result?.count ?? 0;
}

export async function getRecentNotesForUser(userId: string, limit = 10) {
  return db
    .select(noteColumns)
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt), or(eq(notes.status, "published"), eq(notes.status, "draft"))))
    .orderBy(desc(notes.updatedAt))
    .limit(limit);
}

// ── Tags ──

export async function createTag(input: CreateNoteTagInput) {
  const [tag] = await db
    .insert(noteTags)
    .values({
      userId: input.userId,
      name: input.name,
      color: input.color ?? "blue",
    })
    .onConflictDoNothing()
    .returning();
  return tag ?? null;
}

export async function getTagsForUser(userId: string) {
  return db
    .select()
    .from(noteTags)
    .where(eq(noteTags.userId, userId))
    .orderBy(asc(noteTags.name));
}

export async function updateTag(id: string, userId: string, input: { name?: string; color?: string }) {
  const [tag] = await db
    .update(noteTags)
    .set(input)
    .where(and(eq(noteTags.id, id), eq(noteTags.userId, userId)))
    .returning();
  return tag ?? null;
}

export async function deleteTag(id: string, userId: string) {
  const [tag] = await db
    .delete(noteTags)
    .where(and(eq(noteTags.id, id), eq(noteTags.userId, userId)))
    .returning();
  return tag ?? null;
}

// ── Folders ──

export async function createFolder(input: CreateNoteFolderInput) {
  const [folder] = await db
    .insert(noteFolders)
    .values({
      userId: input.userId,
      name: input.name,
      parentId: input.parentId ?? null,
      color: input.color ?? "blue",
      icon: input.icon ?? null,
      order: input.order ?? 0,
    })
    .returning();
  return folder;
}

export async function getFoldersForUser(userId: string) {
  return db
    .select()
    .from(noteFolders)
    .where(eq(noteFolders.userId, userId))
    .orderBy(asc(noteFolders.order), asc(noteFolders.name));
}

export async function getFolderById(id: string, userId: string) {
  const [folder] = await db
    .select()
    .from(noteFolders)
    .where(and(eq(noteFolders.id, id), eq(noteFolders.userId, userId)))
    .limit(1);
  return folder ?? null;
}

export async function updateFolder(id: string, userId: string, input: Partial<CreateNoteFolderInput>) {
  const [folder] = await db
    .update(noteFolders)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(noteFolders.id, id), eq(noteFolders.userId, userId)))
    .returning();
  return folder ?? null;
}

export async function deleteFolder(id: string, userId: string) {
  await db
    .update(notes)
    .set({ folderId: null })
    .where(and(eq(notes.folderId, id), eq(notes.userId, userId)));

  await db
    .update(noteFolders)
    .set({ parentId: null })
    .where(and(eq(noteFolders.parentId, id), eq(noteFolders.userId, userId)));

  const [folder] = await db
    .delete(noteFolders)
    .where(and(eq(noteFolders.id, id), eq(noteFolders.userId, userId)))
    .returning();
  return folder ?? null;
}

// ── Note Links ──

export async function createNoteLink(noteId: string, linkedNoteId: string) {
  const [link] = await db
    .insert(noteLinks)
    .values({ noteId, linkedNoteId })
    .returning();
  return link;
}

export async function getNoteLinks(noteId: string) {
  const rows = await db
    .select({
      link: noteLinks,
      linkedNote: {
        id: notes.id,
        title: notes.title,
        excerpt: notes.excerpt,
      },
    })
    .from(noteLinks)
    .innerJoin(notes, eq(noteLinks.linkedNoteId, notes.id))
    .where(eq(noteLinks.noteId, noteId));

  return rows.map((r) => ({ ...r.link, linkedNote: r.linkedNote }));
}

export async function getBacklinks(noteId: string) {
  const rows = await db
    .select({
      link: noteLinks,
      sourceNote: {
        id: notes.id,
        title: notes.title,
        excerpt: notes.excerpt,
      },
    })
    .from(noteLinks)
    .innerJoin(notes, eq(noteLinks.noteId, notes.id))
    .where(eq(noteLinks.linkedNoteId, noteId));

  return rows.map((r) => ({ ...r.link, sourceNote: r.sourceNote }));
}

export async function deleteNoteLink(linkId: string) {
  const [link] = await db
    .delete(noteLinks)
    .where(eq(noteLinks.id, linkId))
    .returning();
  return link ?? null;
}
