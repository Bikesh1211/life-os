import { getJournalEntries } from "@/modules/journal";
import { getMoodLogs } from "@/modules/wellness";
import { getHeatmap } from "@/modules/habits";
import { travelService } from "@/modules/travel";
import { getEventsByDateRange } from "./repository";
import type { TimelineEvent } from "./repository";
import {
  travelTrips,
  travelJournals as travelJournalsTable,
  travelPhotos,
  travelVisitedPlaces,
} from "@/modules/travel/schema";
import { db } from "@/core/database";
import { eq, isNull, and, sql, asc } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────

export type StoryCardSource = "journal" | "mood" | "habit" | "travel" | "timeline";

export type StoryCard = {
  id: string;
  source: StoryCardSource;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  date: string;
  metadata: Record<string, unknown>;
};

export type StoryDay = {
  date: string;
  cards: StoryCard[];
};

export type GetStoryParams = {
  userId: string;
  dateFrom: string;
  dateTo: string;
  sources?: StoryCardSource[];
  keyword?: string;
};

// ─── Helpers ───────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function applyKeywordFilter(cards: StoryCard[], keyword: string): StoryCard[] {
  const kw = keyword.toLowerCase();
  return cards.filter(
    (c) =>
      c.title.toLowerCase().includes(kw) ||
      (c.description && c.description.toLowerCase().includes(kw)),
  );
}

// ─── Timeline events ───────────────────────────────────────────────

async function collectTimelineEvents(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
  linkedKeys: Set<string>,
): Promise<StoryCard[]> {
  const events = await getEventsByDateRange(userId, dateFrom, dateTo);
  const cards: StoryCard[] = [];

  for (const event of events) {
    if (event.linkedEntityId && event.linkedEntityType) {
      linkedKeys.add(`${event.linkedEntityType}:${event.linkedEntityId}`);
    }
    cards.push({
      id: event.id,
      source: "timeline",
      type: "timeline_event",
      title: event.title,
      description: event.description ?? undefined,
      timestamp: event.eventDate.toISOString(),
      date: toDateStr(event.eventDate),
      metadata: {
        category: event.category,
        importance: event.importance,
        recurrence: event.recurrence,
        isPinned: event.isPinned,
        activityType: event.activityType,
        tags: event.tags,
        startTime: event.startTime,
        endTime: event.endTime,
        durationMinutes: event.durationMinutes,
        mood: event.mood,
        energy: event.energy,
        location: event.location,
        color: event.color,
        icon: event.icon,
        linkedEntityId: event.linkedEntityId,
        linkedEntityType: event.linkedEntityType,
      },
    });
  }

  return cards;
}

// ─── Journal entries ───────────────────────────────────────────────

async function collectJournalEntries(
  userId: string,
  dateFrom: string,
  dateTo: string,
  linkedKeys: Set<string>,
): Promise<StoryCard[]> {
  const entries = await getJournalEntries(userId, {
    dateFrom: new Date(dateFrom).toISOString(),
    dateTo: new Date(dateTo).toISOString(),
  });

  const cards: StoryCard[] = [];
  for (const entry of entries) {
    if (linkedKeys.has(`journal:${entry.id}`)) continue;
    const date = entry.eventDate
      ? toDateStr(entry.eventDate)
      : toDateStr(entry.createdAt);
    cards.push({
      id: entry.id,
      source: "journal",
      type: "journal_entry",
      title: entry.title,
      description: entry.content?.slice(0, 300) ?? undefined,
      timestamp: (entry.eventDate ?? entry.createdAt).toISOString(),
      date,
      metadata: {
        mood: entry.mood,
        tags: entry.tags,
        reflectionScore: entry.reflectionScore,
        isPrivate: entry.isPrivate,
        hasEventDate: !!entry.eventDate,
      },
    });
  }

  return cards;
}

// ─── Mood logs ─────────────────────────────────────────────────────

async function collectMoodLogs(
  userId: string,
  dateFrom: string,
  dateTo: string,
  linkedKeys: Set<string>,
): Promise<StoryCard[]> {
  const logs = await getMoodLogs(userId, { dateFrom, dateTo });

  const cards: StoryCard[] = [];
  for (const log of logs) {
    if (linkedKeys.has(`mood:${log.id}`)) continue;
    const date = toDateStr(new Date(log.createdAt));
    const avgScore = Math.round(
      (log.happiness +
        (11 - log.stress) +
        (11 - log.anxiety) +
        log.motivation +
        log.energy +
        log.confidence +
        log.focus +
        (11 - log.mentalFatigue)) /
        8,
    );

    cards.push({
      id: log.id,
      source: "mood",
      type: "mood_log",
      title: `Mood check-in: ${avgScore}/10`,
      description: log.notes ?? undefined,
      timestamp: log.createdAt.toISOString(),
      date,
      metadata: {
        happiness: log.happiness,
        stress: log.stress,
        anxiety: log.anxiety,
        motivation: log.motivation,
        energy: log.energy,
        confidence: log.confidence,
        focus: log.focus,
        mentalFatigue: log.mentalFatigue,
        avgScore,
        emoji: log.emoji,
        tags: log.tags,
      },
    });
  }

  return cards;
}

// ─── Habit completions ─────────────────────────────────────────────

async function collectHabitCompletions(
  userId: string,
  dateFrom: string,
  dateTo: string,
  linkedKeys: Set<string>,
): Promise<StoryCard[]> {
  const heatmap = await getHeatmap(userId, { dateFrom, dateTo });

  const cards: StoryCard[] = [];
  for (const day of heatmap) {
    if (!day.date || day.count === 0) continue;
    const key = `habit:${day.date}`;
    if (linkedKeys.has(key)) continue;
    linkedKeys.add(key);
    cards.push({
      id: `habit-${day.date}`,
      source: "habit",
      type: "habit_completion",
      title: `${day.count} habit${day.count > 1 ? "s" : ""} completed`,
      description: undefined,
      timestamp: new Date(day.date + "T12:00:00").toISOString(),
      date: day.date,
      metadata: { count: day.count },
    });
  }

  return cards;
}

// ─── Travel data ───────────────────────────────────────────────────

async function collectTravelData(
  userId: string,
  dateFrom: string,
  dateTo: string,
  linkedKeys: Set<string>,
): Promise<StoryCard[]> {
  const cards: StoryCard[] = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  // Trips overlapping the date range
  const trips = await db
    .select()
    .from(travelTrips)
    .where(
      and(
        eq(travelTrips.userId, userId),
        isNull(travelTrips.deletedAt),
        sql`${travelTrips.startDate} <= ${end.toISOString()}`,
        sql`${travelTrips.endDate} >= ${start.toISOString()}`,
      ),
    );

  for (const trip of trips) {
    if (linkedKeys.has(`trip:${trip.id}`)) continue;
    linkedKeys.add(`trip:${trip.id}`);
    const tripDate = toDateStr(trip.startDate ?? trip.createdAt);
    cards.push({
      id: trip.id,
      source: "travel",
      type: "trip",
      title: `Trip: ${trip.title}`,
      description: `${trip.destination}${trip.country ? `, ${trip.country}` : ""}`,
      timestamp: (trip.startDate ?? trip.createdAt).toISOString(),
      date: tripDate,
      metadata: {
        destination: trip.destination,
        country: trip.country,
        status: trip.status,
        startDate: trip.startDate?.toISOString(),
        endDate: trip.endDate?.toISOString(),
        budget: trip.budget,
        currency: trip.currency,
        travelers: trip.travelers,
      },
    });
  }

  // Travel journals in date range
  const journals = await db
    .select()
    .from(travelJournalsTable)
    .where(
      and(
        eq(travelJournalsTable.userId, userId),
        isNull(travelJournalsTable.deletedAt),
        sql`${travelJournalsTable.date} >= ${start.toISOString()}`,
        sql`${travelJournalsTable.date} <= ${end.toISOString()}`,
      ),
    );

  for (const journal of journals) {
    if (linkedKeys.has(`travel_journal:${journal.id}`)) continue;
    linkedKeys.add(`travel_journal:${journal.id}`);
    const date = journal.date ? toDateStr(journal.date) : toDateStr(journal.createdAt);
    cards.push({
      id: journal.id,
      source: "travel",
      type: "travel_journal",
      title: journal.title,
      description: journal.content?.slice(0, 300) ?? undefined,
      timestamp: (journal.date ?? journal.createdAt).toISOString(),
      date,
      metadata: {
        location: journal.location,
        mood: journal.mood,
        favoriteMoment: journal.favoriteMoment,
        foodTried: journal.foodTried,
      },
    });
  }

  // Photos in date range
  const photos = await db
    .select()
    .from(travelPhotos)
    .where(
      and(
        eq(travelPhotos.userId, userId),
        isNull(travelPhotos.deletedAt),
        sql`${travelPhotos.dateTaken} >= ${start.toISOString()}`,
        sql`${travelPhotos.dateTaken} <= ${end.toISOString()}`,
      ),
    );

  for (const photo of photos) {
    if (linkedKeys.has(`photo:${photo.id}`)) continue;
    linkedKeys.add(`photo:${photo.id}`);
    const date = photo.dateTaken
      ? toDateStr(photo.dateTaken)
      : toDateStr(photo.createdAt);
    cards.push({
      id: photo.id,
      source: "travel",
      type: "photo",
      title: photo.caption ?? "Photo",
      description: photo.location ?? undefined,
      timestamp: (photo.dateTaken ?? photo.createdAt).toISOString(),
      date,
      metadata: {
        url: photo.url,
        thumbnail: photo.thumbnail,
        caption: photo.caption,
        location: photo.location,
        tags: photo.tags,
        album: photo.album,
      },
    });
  }

  return cards;
}

// ─── Main aggregation ─────────────────────────────────────────────

export async function getStory(params: GetStoryParams): Promise<StoryDay[]> {
  const { userId, dateFrom, dateTo, sources, keyword } = params;
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);

  // Track linked entities to deduplicate
  const linkedKeys = new Set<string>();

  // Gather cards from all active sources
  const allCards: StoryCard[] = [];
  const sourceSet = sources
    ? new Set<StoryCardSource>(sources)
    : new Set<StoryCardSource>(["timeline", "journal", "mood", "habit", "travel"]);

  const promises: Promise<StoryCard[]>[] = [];

  if (sourceSet.has("timeline")) {
    promises.push(collectTimelineEvents(userId, startDate, endDate, linkedKeys));
  }
  if (sourceSet.has("journal")) {
    promises.push(collectJournalEntries(userId, dateFrom, dateTo, linkedKeys));
  }
  if (sourceSet.has("mood")) {
    promises.push(collectMoodLogs(userId, dateFrom, dateTo, linkedKeys));
  }
  if (sourceSet.has("habit")) {
    promises.push(collectHabitCompletions(userId, dateFrom, dateTo, linkedKeys));
  }
  if (sourceSet.has("travel")) {
    promises.push(collectTravelData(userId, dateFrom, dateTo, linkedKeys));
  }

  const results = await Promise.all(promises);
  for (const cards of results) {
    allCards.push(...cards);
  }

  // Apply keyword filter
  let filtered = allCards;
  if (keyword) {
    filtered = applyKeywordFilter(allCards, keyword);
  }

  // Group by day
  const dayMap = new Map<string, StoryCard[]>();
  for (const card of filtered) {
    const existing = dayMap.get(card.date);
    if (existing) {
      existing.push(card);
    } else {
      dayMap.set(card.date, [card]);
    }
  }

  // Build sorted days
  const days: StoryDay[] = [];
  for (const [date, cards] of dayMap) {
    cards.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    days.push({ date, cards });
  }

  days.sort((a, b) => b.date.localeCompare(a.date));

  return days;
}
