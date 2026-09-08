import { z } from "zod";
import { createTimelineEvent } from "@/modules/timeline";
import {
  createItem,
  getItemsForUser,
  getItemById,
  updateItem,
  deleteItem,
  getDashboardStats,
  createAnnotation,
  getAnnotationsForUser,
  updateAnnotation,
  deleteAnnotation,
  createNote,
  getNotesForUser,
  updateNote,
  deleteNote,
  createSession,
  getSessionsForUser,
  updateSession,
  deleteSession,
  type CreateItemInput,
  type CreateAnnotationInput,
  type CreateNoteInput,
  type CreateSessionInput,
} from "./repository";

// ─── Zod Schemas ──────────────────────────────────────────────────

const itemTypes = ["book", "article", "pdf", "research_paper"] as const;
const readingStatuses = ["want_to_read", "reading", "completed", "on_hold", "dropped"] as const;
const annotationTypes = ["highlight", "quote"] as const;

export const createItemSchema = z.object({
  type: z.enum(itemTypes),
  title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional(),
  authors: z.array(z.string().max(200)).max(50).default([]),
  publisher: z.string().max(200).optional(),
  isbn: z.string().max(20).optional(),
  doi: z.string().max(200).optional(),
  journal: z.string().max(300).optional(),
  url: z.string().max(2000).optional(),
  fileUrl: z.string().max(2000).optional(),
  coverUrl: z.string().max(2000).optional(),
  description: z.string().max(5000).optional(),
  language: z.string().max(10).default("en"),
  publishedYear: z.number().int().min(-3000).max(2100).optional(),
  pageCount: z.number().int().min(1).max(100000).optional(),
  status: z.enum(readingStatuses).default("want_to_read"),
  currentPage: z.number().int().min(0).default(0),
  tags: z.array(z.string().max(50)).max(30).default([]),
  isFavorited: z.boolean().default(false),
  rating: z.number().int().min(1).max(10).optional(),
  review: z.string().max(10000).optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const createAnnotationSchema = z.object({
  readingItemId: z.string().uuid(),
  type: z.enum(annotationTypes),
  text: z.string().min(1).max(5000),
  color: z.string().max(20).optional(),
  note: z.string().max(2000).optional(),
  page: z.number().int().min(0).optional(),
  location: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  isFavorited: z.boolean().default(false),
});

export const createNoteSchema = z.object({
  readingItemId: z.string().uuid(),
  title: z.string().min(1).max(300),
  content: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export const createSessionSchema = z.object({
  readingItemId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  pagesRead: z.number().int().min(0).optional(),
  note: z.string().max(2000).optional(),
});

export type CreateItemParams = z.infer<typeof createItemSchema>;
export type UpdateItemParams = z.infer<typeof updateItemSchema>;
export type CreateAnnotationParams = z.infer<typeof createAnnotationSchema>;
export type CreateNoteParams = z.infer<typeof createNoteSchema>;
export type CreateSessionParams = z.infer<typeof createSessionSchema>;

// ─── Items ────────────────────────────────────────────────────────

export async function createReadingItem(userId: string, params: CreateItemParams) {
  const validated = createItemSchema.parse(params);
  const input: CreateItemInput = {
    userId,
    ...validated,
    startDate: validated.status === "reading" ? new Date() : undefined,
  };
  const item = await createItem(input);

  if (validated.status === "reading") {
    try {
      await createTimelineEvent(userId, {
        title: `Started reading: ${item.title}`,
        eventDate: new Date().toISOString(),
        category: "education",
        importance: "medium",
        linkedEntityId: item.id,
        linkedEntityType: "reading_item",
        tags: item.tags,
      });
    } catch {}
  }

  return item;
}

export async function getReadingItems(userId: string, filters: {
  type?: string;
  status?: string;
  tags?: string[];
  search?: string;
  favorites?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "title" | "updatedAt" | "lastOpenedAt" | "rating";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
} = {}) {
  return getItemsForUser(userId, filters);
}

export async function getReadingItem(id: string, userId: string) {
  return getItemById(id, userId);
}

export async function updateReadingItem(id: string, userId: string, params: UpdateItemParams) {
  const validated = updateItemSchema.parse(params);
  const previous = await getItemById(id, userId);
  if (!previous) return null;

  const input: Partial<CreateItemInput> = { ...validated };

  if (!previous.startDate && validated.status === "reading") {
    input.startDate = new Date();
  }

  if (validated.status === "completed" && previous.status !== "completed") {
    input.endDate = new Date();
    try {
      await createTimelineEvent(userId, {
        title: `Finished reading: ${previous.title}`,
        eventDate: new Date().toISOString(),
        category: "education",
        importance: "high",
        linkedEntityId: id,
        linkedEntityType: "reading_item",
        tags: previous.tags,
      });
    } catch {}
  }

  return updateItem(id, userId, input);
}

export async function deleteReadingItem(id: string, userId: string) {
  return deleteItem(id, userId);
}

export async function getReadingDashboard(userId: string) {
  const stats = await getDashboardStats(userId);

  const items = stats.items;
  const totalBooks = items.filter((i: any) => i.type === "book").reduce((s: number, i: any) => s + Number(i.count), 0);
  const totalArticles = items.filter((i: any) => i.type === "article").reduce((s: number, i: any) => s + Number(i.count), 0);
  const totalPdfs = items.filter((i: any) => i.type === "pdf").reduce((s: number, i: any) => s + Number(i.count), 0);
  const totalPapers = items.filter((i: any) => i.type === "research_paper").reduce((s: number, i: any) => s + Number(i.count), 0);
  const booksRead = items.filter((i: any) => i.type === "book" && i.status === "completed").reduce((s: number, i: any) => s + Number(i.count), 0);
  const pagesRead = Number(stats.sessions.pagesRead);
  const hoursRead = Math.round(Number(stats.sessions.totalMinutes) / 60);
  const totalQuotes = Number(stats.annotations);

  // Currently reading
  const currentlyReading = await getItemsForUser(userId, { status: "reading", limit: 5 });

  return {
    totalBooks,
    totalArticles,
    totalPdfs,
    totalPapers,
    booksRead,
    pagesRead,
    hoursRead,
    totalQuotes,
    currentlyReading,
    currentlyReadingCount: stats.currentlyReading,
  };
}

// ─── Annotations ──────────────────────────────────────────────────

export async function createReadingAnnotation(userId: string, params: CreateAnnotationParams) {
  const validated = createAnnotationSchema.parse(params);
  const input: any = {
    userId,
    itemId: validated.readingItemId,
    content: validated.text,
    type: validated.type,
    color: validated.color,
    note: validated.note,
    page: validated.page,
    location: validated.location,
    tags: validated.tags,
    isFavorited: validated.isFavorited,
  };
  return createAnnotation(input);
}

export async function getReadingAnnotations(userId: string, filters: {
  readingItemId?: string;
  type?: string;
  isFavorited?: boolean;
  search?: string;
} = {}) {
  return getAnnotationsForUser(userId, filters);
}

export async function updateReadingAnnotation(id: string, userId: string, params: Partial<CreateAnnotationParams>) {
  return updateAnnotation(id, userId, params);
}

export async function deleteReadingAnnotation(id: string, userId: string) {
  return deleteAnnotation(id, userId);
}

// ─── Notes ────────────────────────────────────────────────────────

export async function createReadingNote(userId: string, params: CreateNoteParams) {
  const validated = createNoteSchema.parse(params);
  const input: any = {
    userId,
    itemId: validated.readingItemId,
    title: validated.title,
    content: validated.content ?? "",
    tags: validated.tags,
  };
  return createNote(input);
}

export async function getReadingNotes(userId: string, filters: { readingItemId?: string; search?: string } = {}) {
  return getNotesForUser(userId, filters);
}

export async function updateReadingNote(id: string, userId: string, params: Partial<CreateNoteParams>) {
  return updateNote(id, userId, params);
}

export async function deleteReadingNote(id: string, userId: string) {
  return deleteNote(id, userId);
}

// ─── Sessions ─────────────────────────────────────────────────────

export async function createReadingSession(userId: string, params: CreateSessionParams) {
  const validated = createSessionSchema.parse(params);
  const input: any = {
    userId,
    itemId: validated.readingItemId,
    startTime: new Date(validated.startTime),
    endTime: validated.endTime ? new Date(validated.endTime) : undefined,
    pagesRead: validated.pagesRead,
    notes: validated.note,
  };
  const session = await createSession(input);

  // Update item's lastOpenedAt and currentPage
  if (validated.pagesRead) {
    const item = await getItemById(validated.readingItemId, userId);
    if (item) {
      const newPage = Math.min(
        (item.currentPage ?? 0) + validated.pagesRead,
        (item as any).pageCount ?? Infinity,
      );
      await updateItem(validated.readingItemId, userId, {
        currentPage: newPage,
        ...( { lastOpenedAt: new Date() } as any ),
      });
    }
  } else {
    await updateItem(validated.readingItemId, userId, {
      ...( { lastOpenedAt: new Date() } as any ),
    });
  }

  return session;
}

export async function getReadingSessions(userId: string, filters: { readingItemId?: string; dateFrom?: string; dateTo?: string } = {}) {
  return getSessionsForUser(userId, filters);
}

export async function updateReadingSession(id: string, userId: string, params: Partial<CreateSessionParams>) {
  const input: Record<string, unknown> = { ...params };
  if (params.startTime) input.startTime = new Date(params.startTime);
  if (params.endTime) input.endTime = new Date(params.endTime);
  return updateSession(id, userId, input as Partial<CreateSessionInput>);
}

export async function deleteReadingSession(id: string, userId: string) {
  return deleteSession(id, userId);
}
