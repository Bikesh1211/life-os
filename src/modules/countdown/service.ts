import { z } from "zod";
import dayjs from "dayjs";
import {
  createEvent, getEventById, getEventsForUser, updateEvent, softDeleteEvent,
  createChecklistItem, getChecklistItems, updateChecklistItem, deleteChecklistItem,
  createReminder, getRemindersForEvent, getDueReminders, markReminderSent, deleteReminder,
  createMemory, getMemoryForEvent, updateMemory,
  type CreateCountdownEventInput, type UpdateCountdownEventInput,
} from "./repository";

const categoryValues = [
  "football", "movies", "concerts", "travel", "retreats",
  "birthdays", "weddings", "festivals", "exams", "meetings",
  "product-launches", "holidays", "personal", "custom",
] as const;

const statusValues = ["pending", "completed", "archived"] as const;
const recurrenceValues = ["none", "yearly"] as const;
const reminderOffsetPattern = /^(\d+)(d|h|m)$/;

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(categoryValues).optional(),
  eventDate: z.string().datetime({ message: "Invalid date format" }),
  eventTime: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().regex(/^\d{2}:\d{2}$/, "Invalid time (HH:mm)").optional(),
  ),
  timezone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  organizer: z.string().max(200).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  bannerImage: z.string().url().optional().or(z.literal("")),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
  notes: z.string().max(10000).optional(),
  isFavorited: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  createTimelineEvent: z.boolean().optional(),
  status: z.enum(statusValues).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(categoryValues).optional(),
  eventDate: z.string().datetime().optional(),
  eventTime: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().regex(/^\d{2}:\d{2}$/, "Invalid time (HH:mm)").optional(),
  ),
  timezone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  organizer: z.string().max(200).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  bannerImage: z.string().url().optional().or(z.literal("")),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
  notes: z.string().max(10000).optional(),
  isFavorited: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  createTimelineEvent: z.boolean().optional(),
  status: z.enum(statusValues).optional(),
});

export type CreateEventParams = z.infer<typeof createEventSchema>;
export type UpdateEventParams = z.infer<typeof updateEventSchema>;

export type CountdownProgress = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  elapsedPercent: number;
  isComplete: boolean;
  isPast: boolean;
};

function computeProgress(eventDate: Date, createdAt: Date): CountdownProgress {
  const now = dayjs();
  const target = dayjs(eventDate);
  const created = dayjs(createdAt);

  const isPast = target.isBefore(now);
  const totalDuration = target.diff(created, "second");
  const elapsed = now.diff(created, "second");

  const remainingSeconds = Math.max(0, target.diff(now, "second"));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays: Math.floor(totalDuration / 86400),
    elapsedPercent: totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 0,
    isComplete: remainingSeconds === 0,
    isPast,
  };
}

function computeNextTarget(eventDate: Date, recurrence: string): Date {
  if (recurrence !== "yearly") return eventDate;
  const now = dayjs();
  const date = dayjs(eventDate);
  if (date.isAfter(now)) return eventDate;
  let current = date.add(1, "year");
  while (current.isBefore(now)) { current = current.add(1, "year"); }
  return current.toDate();
}

type EnrichedFields = { progress: CountdownProgress; targetDate: Date };
type EnrichedEvent = ReturnType<typeof enrichEvent>;

function enrichEvent(event: NonNullable<Awaited<ReturnType<typeof getEventById>>>) {
  const targetDate = computeNextTarget(event.eventDate, event.recurrence);
  const progress = computeProgress(targetDate, event.createdAt);
  return { ...event, progress, targetDate };
}

export type { EnrichedFields, EnrichedEvent };

// ── Event CRUD ──

export async function createCountdownEvent(userId: string, params: CreateEventParams) {
  const validated = createEventSchema.parse(params);
  const input: CreateCountdownEventInput = {
    userId,
    title: validated.title,
    description: validated.description,
    category: validated.category,
    eventDate: new Date(validated.eventDate),
    eventTime: validated.eventTime,
    timezone: validated.timezone,
    location: validated.location,
    organizer: validated.organizer,
    coverImage: validated.coverImage || undefined,
    bannerImage: validated.bannerImage || undefined,
    color: validated.color,
    icon: validated.icon,
    notes: validated.notes,
    isFavorited: validated.isFavorited,
    isArchived: validated.isArchived,
    recurrence: validated.recurrence,
    createTimelineEvent: validated.createTimelineEvent,
    status: validated.status,
  };

  const event = await createEvent(input);

  if (validated.createTimelineEvent !== false && event) {
    try {
      const { createTimelineEvent } = await import("@/modules/timeline");
      await createTimelineEvent(userId, {
        title: validated.title,
        description: validated.description,
        eventDate: validated.eventDate,
        category: mapCountdownCategoryToTimeline(validated.category ?? "personal") as any,
        color: validated.color,
        icon: validated.icon,
        linkedEntityId: event.id,
        linkedEntityType: "countdown",
      });
    } catch {
      // Timeline event creation is best-effort
    }
  }

  return event ? enrichEvent(event) : null;
}

function mapCountdownCategoryToTimeline(category: string): string {
  const map: Record<string, string> = {
    football: "entertainment",
    movies: "entertainment",
    concerts: "entertainment",
    travel: "travel",
    retreats: "travel",
    birthdays: "personal",
    weddings: "relationships",
    festivals: "entertainment",
    exams: "education",
    meetings: "career",
    "product-launches": "career",
    holidays: "personal",
    personal: "personal",
    custom: "custom",
  };
  return map[category] ?? "personal";
}

export async function getCountdownEvents(userId: string, status?: string, limit?: number) {
  const events = await getEventsForUser(userId, status, limit);
  return events.map(enrichEvent);
}

export async function getNearestCountdownEvent(userId: string) {
  const events = await getEventsForUser(userId, "pending", 1);
  if (events.length === 0) return null;
  return enrichEvent(events[0]);
}

export async function getCountdownEvent(id: string, userId: string) {
  const event = await getEventById(id, userId);
  if (!event) return null;
  return enrichEvent(event);
}

export async function updateCountdownEvent(id: string, userId: string, params: UpdateEventParams) {
  const validated = updateEventSchema.parse(params);
  const input: UpdateCountdownEventInput = {};
  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      (input as Record<string, unknown>)[key] = key === "eventDate" ? new Date(value as string) : value;
    }
  }
  const event = await updateEvent(id, userId, input);
  return event ? enrichEvent(event) : null;
}

export async function deleteCountdownEvent(id: string, userId: string) {
  return softDeleteEvent(id, userId);
}

// ── Checklist ──

export async function addChecklistItem(eventId: string, text: string, order?: number) {
  return createChecklistItem({ eventId, text, order });
}

export async function getChecklist(eventId: string) {
  const items = await getChecklistItems(eventId);
  const completed = items.filter((i) => i.isCompleted).length;
  const total = items.length;
  return { items, completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export async function toggleChecklistItem(id: string, isCompleted: boolean) {
  return updateChecklistItem(id, { isCompleted });
}

export async function removeChecklistItem(id: string) {
  return deleteChecklistItem(id);
}

// ── Reminders ──

export const REMINDER_PRESETS = [
  { label: "180 days before", offset: "180d" },
  { label: "90 days before", offset: "90d" },
  { label: "30 days before", offset: "30d" },
  { label: "14 days before", offset: "14d" },
  { label: "7 days before", offset: "7d" },
  { label: "3 days before", offset: "3d" },
  { label: "1 day before", offset: "1d" },
  { label: "12 hours before", offset: "12h" },
  { label: "3 hours before", offset: "3h" },
  { label: "1 hour before", offset: "1h" },
  { label: "30 minutes before", offset: "30m" },
  { label: "At event time", offset: "0m" },
] as const;

function computeReminderAt(eventDate: Date, offset: string): Date {
  const match = offset.match(reminderOffsetPattern);
  if (!match) return eventDate;
  const value = parseInt(match[1], 10);
  const unit = match[2] as "d" | "h" | "m";
  const units: Record<string, dayjs.ManipulateType> = { d: "day", h: "hour", m: "minute" };
  return dayjs(eventDate).subtract(value, units[unit]).toDate();
}

export async function addReminder(eventId: string, offset: string) {
  const event = await getEventById(eventId, "");
  if (!event) throw new Error("Event not found");
  const reminderAt = computeReminderAt(event.eventDate, offset);
  return createReminder({ eventId, offset, reminderAt });
}

export async function getReminders(eventId: string) {
  return getRemindersForEvent(eventId);
}

export async function removeReminder(id: string) {
  return deleteReminder(id);
}

// ── Reminder polling ──

export async function processDueReminders() {
  const now = new Date();
  const due = await getDueReminders(now);

  for (const reminder of due) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const event = await getEventById(reminder.eventId, "");
        if (event) {
          new Notification(`Countdown: ${event.title}`, {
            body: `${event.title} is coming up!`,
            icon: event.coverImage ?? undefined,
          });
        }
      } catch {
        // Notification failed silently
      }
    }
    await markReminderSent(reminder.id);
  }

  return due.length;
}

// ── Memories ──

export async function addMemory(eventId: string, params: { photos?: string[]; reflection?: string; rating?: number }) {
  return createMemory({ eventId, ...params });
}

export async function getMemory(eventId: string) {
  return getMemoryForEvent(eventId);
}

// ── Dashboard ──

export async function getNearestEvent(userId: string) {
  const events = await getEventsForUser(userId, "pending");
  const enriched = events.map(enrichEvent).filter((e) => !e.progress.isPast);
  if (enriched.length === 0) return null;
  enriched.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  return enriched[0];
}

export async function getCountdownStats(userId: string) {
  const events = await getEventsForUser(userId);
  const now = dayjs();
  const pending = events.filter((e) => e.status === "pending");
  const completed = events.filter((e) => e.status === "completed");
  const upcoming = pending.filter((e) => dayjs(e.eventDate).isAfter(now));
  const nearest = upcoming.length > 0
    ? upcoming.reduce((a, b) => dayjs(a.eventDate).diff(now) < dayjs(b.eventDate).diff(now) ? a : b)
    : null;

  return {
    total: events.length,
    pending: pending.length,
    completed: completed.length,
    upcomingCount: upcoming.length,
    nearestEvent: nearest ? enrichEvent(nearest) : null,
  };
}

// ── Post-event completion ──

export async function completeEvent(id: string, userId: string) {
  const event = await getEventById(id, userId);
  if (!event) return null;
  if (event.recurrence === "yearly") {
    // For yearly events, don't mark complete — next occurrence is computed
    return enrichEvent(event);
  }
  return updateCountdownEvent(id, userId, { status: "completed" });
}
