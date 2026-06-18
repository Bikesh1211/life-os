import { db } from "@/core/database";
import { timelineEvents, type categoryEnum, type importanceEnum, type recurrenceEnum } from "./schema";
import { eq, and, isNull, desc, asc, inArray, sql } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type CreateTimelineEventInput = {
  userId: string;
  title: string;
  description?: string;
  eventDate: Date;
  category?: typeof categoryEnum.enumValues[number];
  importance?: typeof importanceEnum.enumValues[number];
  recurrence?: typeof recurrenceEnum.enumValues[number];
  color?: string;
  icon?: string;
  isPinned?: boolean;
  activityType?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  mood?: number;
  energy?: number;
  location?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
};

export type UpdateTimelineEventInput = Partial<Omit<CreateTimelineEventInput, "userId">>;

// ─── Queries ──────────────────────────────────────────────────────

export async function createEvent(input: CreateTimelineEventInput) {
  const [event] = await db
    .insert(timelineEvents)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description,
      eventDate: input.eventDate,
      category: input.category ?? "personal",
      importance: input.importance ?? "medium",
      recurrence: input.recurrence ?? "none",
      color: input.color,
      icon: input.icon,
      isPinned: input.isPinned ?? false,
      activityType: input.activityType,
      tags: input.tags,
      startTime: input.startTime,
      endTime: input.endTime,
      durationMinutes: input.durationMinutes,
      mood: input.mood,
      energy: input.energy,
      location: input.location,
      linkedEntityId: input.linkedEntityId,
      linkedEntityType: input.linkedEntityType,
    })
    .returning();
  return event;
}

export async function getEventsForUser(userId: string) {
  return db
    .select()
    .from(timelineEvents)
    .where(and(eq(timelineEvents.userId, userId), isNull(timelineEvents.deletedAt)))
    .orderBy(desc(timelineEvents.isPinned), asc(timelineEvents.eventDate));
}

export async function getEventById(id: string, userId: string) {
  const [event] = await db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.id, id),
        eq(timelineEvents.userId, userId),
        isNull(timelineEvents.deletedAt),
      ),
    );
  return event ?? null;
}

export async function updateEvent(id: string, userId: string, input: UpdateTimelineEventInput) {
  const [event] = await db
    .update(timelineEvents)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(timelineEvents.id, id),
        eq(timelineEvents.userId, userId),
        isNull(timelineEvents.deletedAt),
      ),
    )
    .returning();
  return event ?? null;
}

export async function deleteEvent(id: string, userId: string) {
  const [event] = await db
    .update(timelineEvents)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(timelineEvents.id, id),
        eq(timelineEvents.userId, userId),
        isNull(timelineEvents.deletedAt),
      ),
    )
    .returning();
  return event ?? null;
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  return db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.userId, userId),
        isNull(timelineEvents.deletedAt),
        sql`${timelineEvents.eventDate} >= ${startDate.toISOString()}`,
        sql`${timelineEvents.eventDate} <= ${endDate.toISOString()}`,
      ),
    )
    .orderBy(asc(timelineEvents.eventDate));
}

export async function getEventsByCategory(
  userId: string,
  category: typeof categoryEnum.enumValues[number],
) {
  return db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.userId, userId),
        eq(timelineEvents.category, category),
        isNull(timelineEvents.deletedAt),
      ),
    )
    .orderBy(desc(timelineEvents.eventDate));
}

export async function getEventsByIds(ids: string[], userId: string) {
  return db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.userId, userId),
        isNull(timelineEvents.deletedAt),
        inArray(timelineEvents.id, ids),
      ),
    )
    .orderBy(asc(timelineEvents.eventDate));
}
