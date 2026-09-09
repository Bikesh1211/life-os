import { z } from "zod";
import { cache } from "react";
import * as repo from "./repository";
import { awardXp } from "@/modules/gamification";
import { createTimelineEvent } from "@/modules/timeline";

const emptyStr = (v: unknown) => (v === "" || v === null || v === undefined) ? undefined : v;

// ── Validation Schemas ──

export const createConnectionSchema = z.object({
  name: z.string().min(1).max(200),
  nickname: z.preprocess(emptyStr, z.string().max(100).optional()),
  profilePictureUrl: z.preprocess(emptyStr, z.string().max(2000).optional()),
  gender: z.preprocess(emptyStr, z.string().max(50).optional()),
  birthday: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  phone: z.preprocess(emptyStr, z.string().max(50).optional()),
  email: z.preprocess(emptyStr, z.string().email().max(200).optional()),
  address: z.preprocess(emptyStr, z.string().max(500).optional()),
  country: z.preprocess(emptyStr, z.string().max(100).optional()),
  city: z.preprocess(emptyStr, z.string().max(100).optional()),
  occupation: z.preprocess(emptyStr, z.string().max(200).optional()),
  socialLinks: z.array(z.string().max(500)).max(20).optional(),
  relationshipTypes: z.array(z.string().max(50)).max(20).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.preprocess(emptyStr, z.string().max(5000).optional()),
  firstMetDate: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  friendshipAnniversary: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  lastMetDate: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  lastCallDate: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  lastMessageDate: z.preprocess(emptyStr, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});
export const updateConnectionSchema = createConnectionSchema.partial();
export type CreateConnectionParams = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionParams = z.infer<typeof updateConnectionSchema>;

export const createMeetupSchema = z.object({
  title: z.string().min(1).max(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.preprocess(emptyStr, z.string().max(300).optional()),
  photos: z.array(z.string().max(2000)).max(50).optional(),
  expense: z.number().int().min(0).optional(),
  notes: z.preprocess(emptyStr, z.string().max(5000).optional()),
  mood: z.preprocess(emptyStr, z.string().max(100).optional()),
  connectionIds: z.array(z.string().uuid()).optional(),
});
export const updateMeetupSchema = createMeetupSchema.partial();
export type CreateMeetupParams = z.infer<typeof createMeetupSchema>;

export const createEventSchema = z.object({
  eventType: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.preprocess(emptyStr, z.string().max(300).optional()),
  photos: z.array(z.string().max(2000)).max(50).optional(),
  expense: z.number().int().min(0).optional(),
  notes: z.preprocess(emptyStr, z.string().max(5000).optional()),
  connectionIds: z.array(z.string().uuid()).optional(),
});
export const updateEventSchema = createEventSchema.partial();
export type CreateEventParams = z.infer<typeof createEventSchema>;

export const createMemorySchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  photoUrls: z.array(z.string().max(2000)).max(100).optional(),
  videoUrls: z.array(z.string().max(2000)).max(20).optional(),
  audioUrl: z.string().max(2000).optional(),
  quotes: z.string().max(5000).optional(),
  memoryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().max(300).optional(),
  tags: z.array(z.string().max(50)).max(50).optional(),
  isFavorite: z.boolean().optional(),
  connectionIds: z.array(z.string().uuid()).optional(),
});
export const updateMemorySchema = createMemorySchema.partial();
export type CreateMemoryParams = z.infer<typeof createMemorySchema>;

export const createGiftSchema = z.object({
  connectionId: z.string().uuid(),
  direction: z.enum(["given", "received"]),
  giftName: z.string().min(1).max(300),
  occasion: z.string().max(200).optional(),
  price: z.number().int().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(5000).optional(),
});
export const updateGiftSchema = createGiftSchema.partial();
export type CreateGiftParams = z.infer<typeof createGiftSchema>;

export const addTripParticipantSchema = z.object({
  connectionId: z.string().uuid(),
  tripId: z.string().uuid(),
});

// ── Helpers ──

function iconFor(title: string): string | undefined {
  const lower = title.toLowerCase();
  if (lower.includes("☕") || lower.includes("coffee") || lower.includes("tea")) return "☕";
  if (lower.includes("🍕") || lower.includes("food") || lower.includes("dinner") || lower.includes("lunch")) return "🍕";
  if (lower.includes("🎉") || lower.includes("party") || lower.includes("birthday")) return "🎉";
  if (lower.includes("🏔") || lower.includes("trip") || lower.includes("travel")) return "✈️";
  return undefined;
}

// ── Connections ──

export async function createConnection(userId: string, params: CreateConnectionParams) {
  const validated = createConnectionSchema.parse(params);
  const conn = await repo.createConnection({
    ...validated,
    userId,
    fullName: validated.name,
    birthday: validated.birthday ? new Date(validated.birthday) : undefined,
    firstMetDate: validated.firstMetDate ? new Date(validated.firstMetDate) : undefined,
    friendshipAnniversary: validated.friendshipAnniversary ? new Date(validated.friendshipAnniversary) : undefined,
    lastMetDate: validated.lastMetDate ? new Date(validated.lastMetDate) : undefined,
    lastCallDate: validated.lastCallDate ? new Date(validated.lastCallDate) : undefined,
    lastMessageDate: validated.lastMessageDate ? new Date(validated.lastMessageDate) : undefined,
  } as any);

  try { await awardXp(userId, "connection_added", conn.id, `Added ${conn.name}`, 5); } catch {}

  if (validated.firstMetDate) {
    try {
      await createTimelineEvent(userId, {
        title: `Met ${conn.name}`,
        description: conn.nickname ? `(aka ${conn.nickname})` : undefined,
        eventDate: new Date(validated.firstMetDate).toISOString(),
        category: "relationships",
        importance: "medium",
        linkedEntityId: conn.id,
        linkedEntityType: "connection",
      });
    } catch {}
  }

  return conn;
}

export const getConnections = cache(async (userId: string) => repo.getConnections(userId));

export const getConnection = cache(async (id: string, userId: string) => repo.getConnection(id, userId));

export async function updateConnection(id: string, userId: string, params: UpdateConnectionParams) {
  const validated = updateConnectionSchema.parse(params);
  const updateData: Record<string, unknown> = { ...validated };
  if (validated.name !== undefined) updateData.fullName = validated.name;
  if (validated.birthday !== undefined) updateData.birthday = validated.birthday ? new Date(validated.birthday) : undefined;
  if (validated.firstMetDate !== undefined) updateData.firstMetDate = validated.firstMetDate ? new Date(validated.firstMetDate) : undefined;
  if (validated.friendshipAnniversary !== undefined) updateData.friendshipAnniversary = validated.friendshipAnniversary ? new Date(validated.friendshipAnniversary) : undefined;
  if (validated.lastMetDate !== undefined) updateData.lastMetDate = validated.lastMetDate ? new Date(validated.lastMetDate) : undefined;
  if (validated.lastCallDate !== undefined) updateData.lastCallDate = validated.lastCallDate ? new Date(validated.lastCallDate) : undefined;
  if (validated.lastMessageDate !== undefined) updateData.lastMessageDate = validated.lastMessageDate ? new Date(validated.lastMessageDate) : undefined;
  return repo.updateConnection(id, userId, updateData as any);
}

export async function deleteConnection(id: string, userId: string) {
  await repo.deleteConnection(id, userId);
}

export const getFavoriteConnections = cache(async (userId: string) => repo.getFavoriteConnections(userId));

export const getUpcomingBirthdays = cache(async (userId: string) => repo.getUpcomingBirthdays(userId));

// ── Meetups ──

export async function createMeetup(userId: string, params: CreateMeetupParams) {
  const validated = createMeetupSchema.parse(params);
  const { connectionIds, ...data } = validated;
  const meetup = await repo.createMeetup({
    userId,
    ...data,
    date: new Date(data.date),
  } as any);

  if (connectionIds?.length) {
    await repo.setMeetupConnections(meetup.id, connectionIds);
  }

  try { await awardXp(userId, "meetup_logged", meetup.id, `Meetup: ${meetup.title}`, 3); } catch {}

  try {
    await createTimelineEvent(userId, {
      title: meetup.title,
      eventDate: new Date(meetup.date).toISOString(),
      category: "relationships",
      importance: "low",
      linkedEntityId: meetup.id,
      linkedEntityType: "meetup",
      location: meetup.location ?? undefined,
    });
  } catch {}

  return meetup;
}

export const getMeetups = cache(async (userId: string) => repo.getMeetups(userId));

export const getMeetup = cache(async (id: string, userId: string) => {
  const meetup = await repo.getMeetup(id, userId);
  if (!meetup) return null;
  const connectionIds = await repo.getMeetupConnectionIds(id);
  const connections = connectionIds.length > 0 ? await repo.getConnectionsByIds(connectionIds) : [];
  return { ...meetup, connections };
});

export async function updateMeetup(id: string, userId: string, params: UpdateConnectionParams) {
  const validated = updateMeetupSchema.parse(params);
  const { connectionIds, ...data } = validated;
  const updateData: Record<string, unknown> = { ...data };
  if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : undefined;
  const meetup = await repo.updateMeetup(id, userId, updateData as any);
  if (connectionIds) {
    await repo.setMeetupConnections(id, connectionIds);
  }
  return meetup;
}

export async function deleteMeetup(id: string, userId: string) {
  await repo.deleteMeetup(id, userId);
}

// ── Events ──

export async function createEvent(userId: string, params: CreateEventParams) {
  const validated = createEventSchema.parse(params);
  const { connectionIds, ...data } = validated;
  const event = await repo.createEvent({
    userId,
    ...data,
    date: new Date(data.date),
  } as any);

  if (connectionIds?.length) {
    await repo.setEventConnections(event.id, connectionIds);
  }

  try { await awardXp(userId, "event_logged", event.id, `Event: ${event.title}`, 3); } catch {}

  try {
    await createTimelineEvent(userId, {
      title: `${event.eventType}: ${event.title}`,
      eventDate: new Date(event.date).toISOString(),
      category: "relationships",
      importance: "medium",
      linkedEntityId: event.id,
      linkedEntityType: "network_event",
      location: event.location ?? undefined,
    });
  } catch {}

  return event;
}

export const getEvents = cache(async (userId: string) => repo.getEvents(userId));

export const getEvent = cache(async (id: string, userId: string) => {
  const event = await repo.getEvent(id, userId);
  if (!event) return null;
  const connectionIds = await repo.getEventConnectionIds(id);
  const connections = connectionIds.length > 0 ? await repo.getConnectionsByIds(connectionIds) : [];
  return { ...event, connections };
});

export async function updateEvent(id: string, userId: string, params: UpdateConnectionParams) {
  const validated = updateEventSchema.parse(params);
  const { connectionIds, ...data } = validated;
  const updateData: Record<string, unknown> = { ...data };
  if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : undefined;
  const event = await repo.updateEvent(id, userId, updateData as any);
  if (connectionIds) {
    await repo.setEventConnections(id, connectionIds);
  }
  return event;
}

export async function deleteEvent(id: string, userId: string) {
  await repo.deleteEvent(id, userId);
}

// ── Memories ──

export async function createMemory(userId: string, params: CreateMemoryParams) {
  const validated = createMemorySchema.parse(params);
  const { connectionIds, ...data } = validated;
  const memory = await repo.createMemory({
    userId,
    ...data,
    memoryDate: data.memoryDate ? new Date(data.memoryDate) : undefined,
  } as any);

  if (connectionIds?.length) {
    await repo.setMemoryConnections(memory.id, connectionIds);
  }

  try { await awardXp(userId, "memory_created", memory.id, `Memory: ${memory.title}`, 5); } catch {}

  return memory;
}

export const getMemories = cache(async (userId: string) => repo.getMemories(userId));

export const getMemory = cache(async (id: string, userId: string) => {
  const memory = await repo.getMemory(id, userId);
  if (!memory) return null;
  const connectionIds = await repo.getMemoryConnectionIds(id);
  const connections = connectionIds.length > 0 ? await repo.getConnectionsByIds(connectionIds) : [];
  return { ...memory, connections };
});

export async function updateMemory(id: string, userId: string, params: UpdateConnectionParams) {
  const validated = updateMemorySchema.parse(params);
  const { connectionIds, ...data } = validated;
  const updateData: Record<string, unknown> = { ...data };
  if (data.memoryDate !== undefined) updateData.memoryDate = data.memoryDate ? new Date(data.memoryDate) : undefined;
  const memory = await repo.updateMemory(id, userId, updateData as any);
  if (connectionIds) {
    await repo.setMemoryConnections(id, connectionIds);
  }
  return memory;
}

export async function deleteMemory(id: string, userId: string) {
  await repo.deleteMemory(id, userId);
}

export const getFavoriteMemories = cache(async (userId: string) => repo.getFavoriteMemories(userId));

// ── Gifts ──

export async function createGift(userId: string, params: CreateGiftParams) {
  const validated = createGiftSchema.parse(params);
  return repo.createGift({
    userId,
    ...validated,
    date: validated.date ? new Date(validated.date) : undefined,
  } as any);
}

export const getGifts = cache(async (userId: string) => repo.getGifts(userId));

export const getGift = cache(async (id: string, userId: string) => repo.getGift(id, userId));

export const getGiftsByConnection = cache(async (connectionId: string, userId: string) =>
  repo.getGiftsByConnection(connectionId, userId),
);

export async function updateGift(id: string, userId: string, params: UpdateConnectionParams) {
  const validated = updateGiftSchema.parse(params);
  const updateData: Record<string, unknown> = { ...validated };
  if (validated.date !== undefined) updateData.date = validated.date ? new Date(validated.date) : undefined;
  return repo.updateGift(id, userId, updateData as any);
}

export async function deleteGift(id: string, userId: string) {
  await repo.deleteGift(id, userId);
}

// ── Trip Participants ──

export async function addTripParticipant(userId: string, connectionId: string, tripId: string) {
  const validated = addTripParticipantSchema.parse({ connectionId, tripId });
  return repo.addTripParticipant({ userId, ...validated });
}

export async function removeTripParticipant(connectionId: string, tripId: string, userId: string) {
  await repo.removeTripParticipant(connectionId, tripId, userId);
}

export const getConnectionsForTrip = cache(async (tripId: string, userId: string) =>
  repo.getConnectionsForTrip(tripId, userId),
);

export const getTripIdsForConnection = cache(async (connectionId: string) =>
  repo.getTripIdsForConnection(connectionId),
);

// ── Dashboard / Insights ──

export const getDashboardStats = cache(async (userId: string) => {
  const stats = await repo.getDashboardStats(userId);
  const birthdays = await getUpcomingBirthdays(userId);
  const recentMeetups = await repo.getRecentMeetups(userId, 5);
  const upcomingEvents = await repo.getUpcomingEvents(userId, 5);

  return { ...stats, upcomingBirthdays: birthdays.length, recentMeetups, upcomingEvents };
});

export const computeInsights = cache(async (userId: string): Promise<Insight[]> => {
  const connections = await repo.getConnections(userId);
  const insights: Insight[] = [];

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Birthday countdown
  const upcoming = await repo.getUpcomingBirthdays(userId);
  if (upcoming.length > 0) {
    insights.push({
      type: "upcoming_birthdays",
      message: `${upcoming.length} birthday${upcoming.length > 1 ? "s are" : " is"} coming this month.`,
      severity: "info",
      count: upcoming.length,
    });
  }

  // Days since last meetup per connection
  for (const conn of connections) {
    if (conn.lastMetDate) {
      const days = daysBetween(conn.lastMetDate, today);
      if (days > 60) {
        insights.push({
          type: "stale_connection",
          message: `You haven't met ${conn.name} for ${days} days.`,
          severity: days > 180 ? "warning" : "info",
          count: days,
          connectionId: conn.id,
        });
      }
    }
  }

  // Longest friendship
  const withAnniversary = connections.filter((c) => c.friendshipAnniversary || c.firstMetDate);
  if (withAnniversary.length > 0) {
    let longest = { name: "", years: 0, id: "" };
    for (const conn of withAnniversary) {
      const date = conn.friendshipAnniversary ?? conn.firstMetDate!;
      const years = yearsBetween(date, today);
      if (years > longest.years) {
        longest = { name: conn.name, years, id: conn.id };
      }
    }
    if (longest.years > 0) {
      insights.push({
        type: "longest_friendship",
        message: `Your longest friendship is ${longest.years} year${longest.years > 1 ? "s" : ""} (${longest.name}).`,
        severity: "info",
        count: longest.years,
        connectionId: longest.id,
      });
    }
  }

  return insights;
});

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function yearsBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  let years = d2.getFullYear() - d1.getFullYear();
  const m = d2.getMonth() - d1.getMonth();
  if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) {
    years--;
  }
  return years;
}

export type Insight = {
  type: string;
  message: string;
  severity: "info" | "warning";
  count: number;
  connectionId?: string;
};
