import { db } from "@/core/database";
import { countdownEvents, countdownChecklistItems, countdownReminders, countdownMemories } from "./schema";
import { eq, and, isNull, desc, asc, lte, sql } from "drizzle-orm";

export type CountdownEvent = typeof countdownEvents.$inferSelect;
export type CountdownChecklistItem = typeof countdownChecklistItems.$inferSelect;
export type CountdownReminder = typeof countdownReminders.$inferSelect;
export type CountdownMemory = typeof countdownMemories.$inferSelect;

export type CreateCountdownEventInput = {
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  eventDate: Date;
  eventTime?: string | null;
  timezone?: string | null;
  location?: string | null;
  organizer?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  color?: string | null;
  icon?: string | null;
  notes?: string | null;
  isFavorited?: boolean;
  isArchived?: boolean;
  recurrence?: string | null;
  createTimelineEvent?: boolean;
  status?: string | null;
};

export type UpdateCountdownEventInput = Partial<Omit<CreateCountdownEventInput, "userId">>;

export type CreateChecklistItemInput = {
  eventId: string;
  text: string;
  order?: number;
};

export type CreateReminderInput = {
  eventId: string;
  offset: string;
  reminderAt: Date;
};

export type CreateMemoryInput = {
  eventId: string;
  photos?: string[];
  reflection?: string;
  rating?: number;
};

const eventColumns = {
  id: countdownEvents.id,
  userId: countdownEvents.userId,
  title: countdownEvents.title,
  description: countdownEvents.description,
  category: countdownEvents.category,
  eventDate: countdownEvents.eventDate,
  eventTime: countdownEvents.eventTime,
  timezone: countdownEvents.timezone,
  location: countdownEvents.location,
  organizer: countdownEvents.organizer,
  coverImage: countdownEvents.coverImage,
  bannerImage: countdownEvents.bannerImage,
  color: countdownEvents.color,
  icon: countdownEvents.icon,
  notes: countdownEvents.notes,
  isFavorited: countdownEvents.isFavorited,
  isArchived: countdownEvents.isArchived,
  recurrence: countdownEvents.recurrence,
  createTimelineEvent: countdownEvents.createTimelineEvent,
  status: countdownEvents.status,
  createdAt: countdownEvents.createdAt,
  updatedAt: countdownEvents.updatedAt,
  deletedAt: countdownEvents.deletedAt,
};

// ── Events ──

export async function createEvent(input: CreateCountdownEventInput) {
  const [event] = await db
    .insert(countdownEvents)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description ?? null,
      category: (input.category ?? "personal") as any,
      eventDate: input.eventDate,
      eventTime: input.eventTime ?? null,
      timezone: input.timezone ?? null,
      location: input.location ?? null,
      organizer: input.organizer ?? null,
      coverImage: input.coverImage ?? null,
      bannerImage: input.bannerImage ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      notes: input.notes ?? null,
      isFavorited: input.isFavorited ?? false,
      isArchived: input.isArchived ?? false,
      recurrence: (input.recurrence ?? "none") as any,
      createTimelineEvent: input.createTimelineEvent ?? true,
      status: (input.status ?? "pending") as any,
    })
    .returning(eventColumns);
  return event;
}

export async function getEventById(id: string, userId: string) {
  const [event] = await db
    .select(eventColumns)
    .from(countdownEvents)
    .where(and(eq(countdownEvents.id, id), eq(countdownEvents.userId, userId), isNull(countdownEvents.deletedAt)))
    .limit(1);
  return event ?? null;
}

export async function getEventsForUser(userId: string, status?: string) {
  const conditions = [eq(countdownEvents.userId, userId), isNull(countdownEvents.deletedAt)];
  if (status) { conditions.push(eq(countdownEvents.status, status as any)); }
  return db
    .select(eventColumns)
    .from(countdownEvents)
    .where(and(...conditions))
    .orderBy(desc(countdownEvents.eventDate));
}

export async function updateEvent(id: string, userId: string, input: UpdateCountdownEventInput) {
  const vals: Record<string, unknown> = { ...input, updatedAt: new Date() };
  for (const key of Object.keys(vals)) {
    if (vals[key] === undefined) delete vals[key];
  }
  const [event] = await db
    .update(countdownEvents)
    .set(vals as any)
    .where(and(eq(countdownEvents.id, id), eq(countdownEvents.userId, userId), isNull(countdownEvents.deletedAt)))
    .returning(eventColumns);
  return event ?? null;
}

export async function softDeleteEvent(id: string, userId: string) {
  const [event] = await db
    .update(countdownEvents)
    .set({ deletedAt: new Date(), status: "archived" })
    .where(and(eq(countdownEvents.id, id), eq(countdownEvents.userId, userId), isNull(countdownEvents.deletedAt)))
    .returning(eventColumns);
  return event ?? null;
}

// ── Checklist Items ──

export async function createChecklistItem(input: CreateChecklistItemInput) {
  const [item] = await db
    .insert(countdownChecklistItems)
    .values({ eventId: input.eventId, text: input.text, order: input.order ?? 0 })
    .returning();
  return item;
}

export async function getChecklistItems(eventId: string) {
  return db
    .select()
    .from(countdownChecklistItems)
    .where(eq(countdownChecklistItems.eventId, eventId))
    .orderBy(asc(countdownChecklistItems.order));
}

export async function updateChecklistItem(id: string, input: { text?: string; isCompleted?: boolean; order?: number }) {
  const [item] = await db
    .update(countdownChecklistItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(countdownChecklistItems.id, id))
    .returning();
  return item ?? null;
}

export async function deleteChecklistItem(id: string) {
  const [item] = await db
    .delete(countdownChecklistItems)
    .where(eq(countdownChecklistItems.id, id))
    .returning();
  return item ?? null;
}

// ── Reminders ──

export async function createReminder(input: CreateReminderInput) {
  const [reminder] = await db
    .insert(countdownReminders)
    .values({ eventId: input.eventId, offset: input.offset, reminderAt: input.reminderAt })
    .returning();
  return reminder;
}

export async function getRemindersForEvent(eventId: string) {
  return db
    .select()
    .from(countdownReminders)
    .where(eq(countdownReminders.eventId, eventId))
    .orderBy(asc(countdownReminders.reminderAt));
}

export async function getDueReminders(now: Date) {
  return db
    .select()
    .from(countdownReminders)
    .where(and(lte(countdownReminders.reminderAt, now), eq(countdownReminders.isSent, false)));
}

export async function markReminderSent(id: string) {
  const [reminder] = await db
    .update(countdownReminders)
    .set({ isSent: true })
    .where(eq(countdownReminders.id, id))
    .returning();
  return reminder ?? null;
}

export async function deleteReminder(id: string) {
  const [reminder] = await db
    .delete(countdownReminders)
    .where(eq(countdownReminders.id, id))
    .returning();
  return reminder ?? null;
}

// ── Memories ──

export async function createMemory(input: CreateMemoryInput) {
  const [memory] = await db
    .insert(countdownMemories)
    .values({
      eventId: input.eventId,
      photos: input.photos ?? [],
      reflection: input.reflection ?? null,
      rating: input.rating ?? null,
    })
    .returning();
  return memory;
}

export async function getMemoryForEvent(eventId: string) {
  const [memory] = await db
    .select()
    .from(countdownMemories)
    .where(eq(countdownMemories.eventId, eventId))
    .limit(1);
  return memory ?? null;
}

export async function updateMemory(id: string, input: { photos?: string[]; reflection?: string; rating?: number; archived?: boolean }) {
  const [memory] = await db
    .update(countdownMemories)
    .set(input)
    .where(eq(countdownMemories.id, id))
    .returning();
  return memory ?? null;
}
