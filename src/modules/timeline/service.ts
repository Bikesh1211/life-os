import { z } from "zod";
import {
  createEvent,
  getEventsForUser,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventStatsForUser,
  getUpcomingEventsForUser,
} from "./repository";
import type {
  TimelineEvent,
  CreateTimelineEventInput,
} from "./repository";
import dayjs from "dayjs";
import {
  computeDuration,
  computeNextOccurrence,
  getPrimaryUnit,
} from "./utils";
export type { DurationBreakdown } from "./utils";
export { computeDuration, computeNextOccurrence, getPrimaryUnit } from "./utils";

// ─── Zod Schemas ──────────────────────────────────────────────────

const categoryValues = [
  "personal",
  "career",
  "education",
  "health",
  "finance",
  "travel",
  "relationships",
  "business",
  "entertainment",
  "custom",
] as const;

const importanceValues = ["critical", "high", "medium", "low"] as const;

const recurrenceValues = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime({ message: "Invalid date format" }),
  category: z.enum(categoryValues).optional(),
  importance: z.enum(importanceValues).optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
  isPinned: z.boolean().optional(),
  activityType: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  durationMinutes: z.number().int().min(0).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  location: z.string().max(200).optional(),
  linkedEntityId: z.string().uuid().optional(),
  linkedEntityType: z.string().max(50).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime().optional(),
  category: z.enum(categoryValues).optional(),
  importance: z.enum(importanceValues).optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
  isPinned: z.boolean().optional(),
  activityType: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)").optional(),
  durationMinutes: z.number().int().min(0).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  location: z.string().max(200).optional(),
  linkedEntityId: z.string().uuid().optional(),
  linkedEntityType: z.string().max(50).optional(),
});

export type CreateEventParams = z.infer<typeof createEventSchema>;
export type UpdateEventParams = z.infer<typeof updateEventSchema>;

// ─── Event enrichment ────────────────────────────────────────────

export function withComputedDuration(
  event: TimelineEvent,
) {
  const effectiveDate =
    event.recurrence !== "none"
      ? computeNextOccurrence(event.eventDate, event.recurrence) ?? event.eventDate
      : event.eventDate;

  const duration = computeDuration(effectiveDate);
  const nextOccurrence =
    event.recurrence !== "none" ? effectiveDate : null;

  return { ...event, duration, nextOccurrence };
}

// ─── Service API ──────────────────────────────────────────────────

export async function createTimelineEvent(userId: string, params: CreateEventParams) {
  const validated = createEventSchema.parse(params);
  const input: CreateTimelineEventInput = {
    userId,
    title: validated.title,
    description: validated.description,
    eventDate: new Date(validated.eventDate),
    category: validated.category,
    importance: validated.importance,
    recurrence: validated.recurrence,
    color: validated.color,
    icon: validated.icon,
    isPinned: validated.isPinned,
    activityType: validated.activityType,
    tags: validated.tags,
    startTime: validated.startTime,
    endTime: validated.endTime,
    durationMinutes: validated.durationMinutes,
    mood: validated.mood,
    energy: validated.energy,
    location: validated.location,
    linkedEntityId: validated.linkedEntityId,
    linkedEntityType: validated.linkedEntityType,
  };
  return createEvent(input);
}

export async function getTimelineEvents(userId: string) {
  const events = await getEventsForUser(userId);
  return events.map(withComputedDuration);
}

export async function getTimelineEvent(id: string, userId: string) {
  const event = await getEventById(id, userId);
  if (!event) return null;
  return withComputedDuration(event);
}

export async function updateTimelineEvent(
  id: string,
  userId: string,
  params: UpdateEventParams,
) {
  const validated = updateEventSchema.parse(params);
  const input: Record<string, unknown> = { ...validated };
  if (validated.eventDate) {
    input.eventDate = new Date(validated.eventDate);
  }
  return updateEvent(id, userId, input);
}

export async function deleteTimelineEvent(id: string, userId: string) {
  return deleteEvent(id, userId);
}

// ─── Dashboard data exports ──────────────────────────────────────

export async function getUpcomingEvents(userId: string, limit = 5) {
  const events = await getUpcomingEventsForUser(userId, limit);
  return events.map(withComputedDuration);
}

export async function getLifeStats(userId: string) {
  const stats = await getEventStatsForUser(userId);
  return {
    total: stats.total,
    past: stats.past,
    future: stats.future,
    pinned: stats.pinned,
    longestRunning: null,
  };
}
