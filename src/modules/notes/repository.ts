import { db } from "@/core/database";
import { notes, noteTags } from "./schema";
import { eq, and, isNull, desc, asc, sql, inArray, or } from "drizzle-orm";

export type Note = typeof notes.$inferSelect;
export type NoteTag = typeof noteTags.$inferSelect;

export type CreateNoteInput = {
  userId: string;
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  reminderDate?: Date;
  priority?: string;
};

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "userId">>;

export type CreateNoteTagInput = {
  userId: string;
  name: string;
  color?: string;
};

export type NoteFilters = {
  search?: string;
  category?: string;
  tags?: string[];
  isArchived?: boolean;
  isPinned?: boolean;
  priority?: string;
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
  category: notes.category,
  tags: notes.tags,
  isPinned: notes.isPinned,
  isArchived: notes.isArchived,
  reminderDate: notes.reminderDate,
  priority: notes.priority,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
  deletedAt: notes.deletedAt,
};

export async function createNote(input: CreateNoteInput) {
  const [note] = await db
    .insert(notes)
    .values({
      userId: input.userId,
      title: input.title,
      content: input.content,
      category: input.category ?? "personal",
      tags: input.tags ?? [],
      isPinned: input.isPinned ?? false,
      isArchived: input.isArchived ?? false,
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
  const conditions: ReturnType<typeof eq>[] = [
    eq(notes.userId, userId),
    isNull(notes.deletedAt),
  ];

  if (filters.isArchived !== undefined) {
    conditions.push(eq(notes.isArchived, filters.isArchived));
  } else {
    conditions.push(eq(notes.isArchived, false));
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

  const orderByMap = {
    createdAt: notes.createdAt,
    updatedAt: notes.updatedAt,
    title: notes.title,
  };

  const orderColumn = orderByMap[filters.sortBy ?? "createdAt"];
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
    .set({ deletedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)))
    .returning(noteColumns);
  return note ?? null;
}

export async function hardDeleteExpiredNotes(daysRetained = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysRetained);

  await db
    .delete(notes)
    .where(and(sql`${notes.deletedAt} < ${cutoff}`, sql`${notes.deletedAt} IS NOT NULL`));
}

export async function getNoteCountForUser(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt), eq(notes.isArchived, false)));
  return result?.count ?? 0;
}

export async function getRecentNotesForUser(userId: string, limit = 10) {
  return db
    .select(noteColumns)
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt), eq(notes.isArchived, false)))
    .orderBy(desc(notes.updatedAt))
    .limit(limit);
}

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
