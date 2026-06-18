import { db } from "@/core/database";
import { and, eq, desc, asc, isNull, sql, inArray } from "drizzle-orm";
import {
  networkConnections,
  networkMeetups,
  networkMeetupConnections,
  networkEvents,
  networkEventConnections,
  networkMemories,
  networkMemoryConnections,
  networkGifts,
  networkTripParticipants,
} from "./schema";

export type NetworkConnection = typeof networkConnections.$inferSelect;
export type NetworkMeetup = typeof networkMeetups.$inferSelect;
export type NetworkEvent = typeof networkEvents.$inferSelect;
export type NetworkMemory = typeof networkMemories.$inferSelect;
export type NetworkGift = typeof networkGifts.$inferSelect;
export type NetworkTripParticipant = typeof networkTripParticipants.$inferSelect;

export type CreateConnectionInput = typeof networkConnections.$inferInsert;
export type CreateMeetupInput = typeof networkMeetups.$inferInsert;
export type CreateEventInput = typeof networkEvents.$inferInsert;
export type CreateMemoryInput = typeof networkMemories.$inferInsert;
export type CreateGiftInput = typeof networkGifts.$inferInsert;
export type CreateTripParticipantInput = typeof networkTripParticipants.$inferInsert;

function byUser(table: any, userId: string) {
  return eq(table.userId, userId);
}

// ── Connections ──

export async function createConnection(input: CreateConnectionInput) {
  const [r] = await db.insert(networkConnections).values(input).returning();
  return r;
}

export async function updateConnection(id: string, userId: string, input: Partial<CreateConnectionInput>) {
  const [r] = await db
    .update(networkConnections)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(networkConnections.id, id), byUser(networkConnections, userId)))
    .returning();
  return r;
}

export async function deleteConnection(id: string, userId: string) {
  await db.delete(networkConnections).where(and(eq(networkConnections.id, id), byUser(networkConnections, userId)));
}

export async function getConnection(id: string, userId: string) {
  const [r] = await db
    .select()
    .from(networkConnections)
    .where(and(eq(networkConnections.id, id), byUser(networkConnections, userId)))
    .limit(1);
  return r ?? null;
}

export async function getConnections(userId: string) {
  return db
    .select()
    .from(networkConnections)
    .where(byUser(networkConnections, userId))
    .orderBy(desc(networkConnections.createdAt));
}

export async function getConnectionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(networkConnections).where(inArray(networkConnections.id, ids));
}

export async function getFavoriteConnections(userId: string) {
  return db
    .select()
    .from(networkConnections)
    .where(and(byUser(networkConnections, userId), eq(networkConnections.isFavorite, true)))
    .orderBy(desc(networkConnections.createdAt));
}

export async function getUpcomingBirthdays(userId: string) {
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return db
    .select()
    .from(networkConnections)
    .where(and(byUser(networkConnections, userId), sql`to_char(birthday, 'MM-DD') >= ${monthDay}`))
    .orderBy(sql`to_char(birthday, 'MM-DD')`)
    .limit(20);
}

// ── Meetups ──

export async function createMeetup(input: CreateMeetupInput) {
  const [r] = await db.insert(networkMeetups).values(input).returning();
  return r;
}

export async function updateMeetup(id: string, userId: string, input: Partial<CreateMeetupInput>) {
  const [r] = await db
    .update(networkMeetups)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(networkMeetups.id, id), byUser(networkMeetups, userId)))
    .returning();
  return r;
}

export async function deleteMeetup(id: string, userId: string) {
  await db.delete(networkMeetups).where(and(eq(networkMeetups.id, id), byUser(networkMeetups, userId)));
}

export async function getMeetup(id: string, userId: string) {
  const [r] = await db
    .select()
    .from(networkMeetups)
    .where(and(eq(networkMeetups.id, id), byUser(networkMeetups, userId)))
    .limit(1);
  return r ?? null;
}

export async function getMeetups(userId: string) {
  return db
    .select()
    .from(networkMeetups)
    .where(byUser(networkMeetups, userId))
    .orderBy(desc(networkMeetups.date));
}

export async function getMeetupConnectionIds(meetupId: string) {
  const rows = await db
    .select({ connectionId: networkMeetupConnections.connectionId })
    .from(networkMeetupConnections)
    .where(eq(networkMeetupConnections.meetupId, meetupId));
  return rows.map((r) => r.connectionId);
}

export async function setMeetupConnections(meetupId: string, connectionIds: string[]) {
  await db.delete(networkMeetupConnections).where(eq(networkMeetupConnections.meetupId, meetupId));
  if (connectionIds.length > 0) {
    await db.insert(networkMeetupConnections).values(
      connectionIds.map((connectionId) => ({ meetupId, connectionId })),
    );
  }
}

// ── Events ──

export async function createEvent(input: CreateEventInput) {
  const [r] = await db.insert(networkEvents).values(input).returning();
  return r;
}

export async function updateEvent(id: string, userId: string, input: Partial<CreateEventInput>) {
  const [r] = await db
    .update(networkEvents)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(networkEvents.id, id), byUser(networkEvents, userId)))
    .returning();
  return r;
}

export async function deleteEvent(id: string, userId: string) {
  await db.delete(networkEvents).where(and(eq(networkEvents.id, id), byUser(networkEvents, userId)));
}

export async function getEvent(id: string, userId: string) {
  const [r] = await db
    .select()
    .from(networkEvents)
    .where(and(eq(networkEvents.id, id), byUser(networkEvents, userId)))
    .limit(1);
  return r ?? null;
}

export async function getEvents(userId: string) {
  return db
    .select()
    .from(networkEvents)
    .where(byUser(networkEvents, userId))
    .orderBy(desc(networkEvents.date));
}

export async function getEventConnectionIds(eventId: string) {
  const rows = await db
    .select({ connectionId: networkEventConnections.connectionId })
    .from(networkEventConnections)
    .where(eq(networkEventConnections.eventId, eventId));
  return rows.map((r) => r.connectionId);
}

export async function setEventConnections(eventId: string, connectionIds: string[]) {
  await db.delete(networkEventConnections).where(eq(networkEventConnections.eventId, eventId));
  if (connectionIds.length > 0) {
    await db.insert(networkEventConnections).values(
      connectionIds.map((connectionId) => ({ eventId, connectionId })),
    );
  }
}

// ── Memories ──

export async function createMemory(input: CreateMemoryInput) {
  const [r] = await db.insert(networkMemories).values(input).returning();
  return r;
}

export async function updateMemory(id: string, userId: string, input: Partial<CreateMemoryInput>) {
  const [r] = await db
    .update(networkMemories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(networkMemories.id, id), byUser(networkMemories, userId)))
    .returning();
  return r;
}

export async function deleteMemory(id: string, userId: string) {
  await db.delete(networkMemories).where(and(eq(networkMemories.id, id), byUser(networkMemories, userId)));
}

export async function getMemory(id: string, userId: string) {
  const [r] = await db
    .select()
    .from(networkMemories)
    .where(and(eq(networkMemories.id, id), byUser(networkMemories, userId)))
    .limit(1);
  return r ?? null;
}

export async function getMemories(userId: string) {
  return db
    .select()
    .from(networkMemories)
    .where(byUser(networkMemories, userId))
    .orderBy(desc(networkMemories.memoryDate));
}

export async function getFavoriteMemories(userId: string) {
  return db
    .select()
    .from(networkMemories)
    .where(and(byUser(networkMemories, userId), eq(networkMemories.isFavorite, true)))
    .orderBy(desc(networkMemories.memoryDate));
}

export async function getMemoryConnectionIds(memoryId: string) {
  const rows = await db
    .select({ connectionId: networkMemoryConnections.connectionId })
    .from(networkMemoryConnections)
    .where(eq(networkMemoryConnections.memoryId, memoryId));
  return rows.map((r) => r.connectionId);
}

export async function setMemoryConnections(memoryId: string, connectionIds: string[]) {
  await db.delete(networkMemoryConnections).where(eq(networkMemoryConnections.memoryId, memoryId));
  if (connectionIds.length > 0) {
    await db.insert(networkMemoryConnections).values(
      connectionIds.map((connectionId) => ({ memoryId, connectionId })),
    );
  }
}

// ── Gifts ──

export async function createGift(input: CreateGiftInput) {
  const [r] = await db.insert(networkGifts).values(input).returning();
  return r;
}

export async function updateGift(id: string, userId: string, input: Partial<CreateGiftInput>) {
  const [r] = await db
    .update(networkGifts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(networkGifts.id, id), byUser(networkGifts, userId)))
    .returning();
  return r;
}

export async function deleteGift(id: string, userId: string) {
  await db.delete(networkGifts).where(and(eq(networkGifts.id, id), byUser(networkGifts, userId)));
}

export async function getGift(id: string, userId: string) {
  const [r] = await db
    .select()
    .from(networkGifts)
    .where(and(eq(networkGifts.id, id), byUser(networkGifts, userId)))
    .limit(1);
  return r ?? null;
}

export async function getGifts(userId: string) {
  return db
    .select()
    .from(networkGifts)
    .where(byUser(networkGifts, userId))
    .orderBy(desc(networkGifts.date));
}

export async function getGiftsByConnection(connectionId: string, userId: string) {
  return db
    .select()
    .from(networkGifts)
    .where(and(eq(networkGifts.connectionId, connectionId), byUser(networkGifts, userId)))
    .orderBy(desc(networkGifts.date));
}

// ── Trip Participants ──

export async function addTripParticipant(input: CreateTripParticipantInput) {
  const [r] = await db.insert(networkTripParticipants).values(input).returning();
  return r;
}

export async function removeTripParticipant(connectionId: string, tripId: string, userId: string) {
  await db
    .delete(networkTripParticipants)
    .where(
      and(
        eq(networkTripParticipants.connectionId, connectionId),
        eq(networkTripParticipants.tripId, tripId),
        byUser(networkTripParticipants, userId),
      ),
    );
}

export async function getTripParticipantIds(tripId: string) {
  const rows = await db
    .select({ connectionId: networkTripParticipants.connectionId })
    .from(networkTripParticipants)
    .where(eq(networkTripParticipants.tripId, tripId));
  return rows.map((r) => r.connectionId);
}

export async function getConnectionsForTrip(tripId: string, userId: string) {
  const rows = await db
    .select()
    .from(networkTripParticipants)
    .innerJoin(
      networkConnections,
      eq(networkTripParticipants.connectionId, networkConnections.id),
    )
    .where(
      and(
        eq(networkTripParticipants.tripId, tripId),
        eq(networkTripParticipants.userId, userId),
      ),
    );
  return rows.map((r) => r.network_connections);
}

export async function getTripIdsForConnection(connectionId: string) {
  const rows = await db
    .select({ tripId: networkTripParticipants.tripId })
    .from(networkTripParticipants)
    .where(eq(networkTripParticipants.connectionId, connectionId));
  return rows.map((r) => r.tripId);
}

export async function getRecentMeetups(userId: string, limit = 5) {
  return db
    .select()
    .from(networkMeetups)
    .where(byUser(networkMeetups, userId))
    .orderBy(desc(networkMeetups.date))
    .limit(limit);
}

export async function getUpcomingEvents(userId: string, limit = 5) {
  const today = new Date().toISOString().split("T")[0];
  return db
    .select()
    .from(networkEvents)
    .where(and(byUser(networkEvents, userId), sql`date >= ${today}`))
    .orderBy(asc(networkEvents.date))
    .limit(limit);
}

export async function getDashboardStats(userId: string) {
  const [connectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkConnections)
    .where(byUser(networkConnections, userId));
  const [meetupCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkMeetups)
    .where(byUser(networkMeetups, userId));
  const [memoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkMemories)
    .where(byUser(networkMemories, userId));
  const [eventCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkEvents)
    .where(byUser(networkEvents, userId));
  const [giftCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkGifts)
    .where(byUser(networkGifts, userId));
  const [tripCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(networkTripParticipants)
    .where(byUser(networkTripParticipants, userId));
  const favoriteCount = (await getFavoriteConnections(userId)).length;

  return {
    totalConnections: Number(connectionCount?.count ?? 0),
    totalMeetups: Number(meetupCount?.count ?? 0),
    totalMemories: Number(memoryCount?.count ?? 0),
    totalEvents: Number(eventCount?.count ?? 0),
    totalGifts: Number(giftCount?.count ?? 0),
    totalTrips: Number(tripCount?.count ?? 0),
    favoriteCount,
  };
}
