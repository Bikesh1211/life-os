import "server-only";

import { cache } from "react";
import { readArchiveRows } from "./repository";
import type {
  ArchiveRows,
  JournalRow,
  TripDayRow,
  TripRow,
  VisitedRow,
  WishRow,
} from "./repository";
import {
  byNewestExpedition,
  byNewestPlace,
  collectPhotos,
  computeStats,
  expeditionNumber,
  iso,
  isImageSrc,
  makeSlug,
  matchesSlug,
  spanInDays,
  type Expedition,
  type ExpeditionPhoto,
  type ExploredPlace,
  type ExploreStats,
  type PlacePriority,
  type PlanningStatus,
  type RouteStop,
  type TravelCategory,
  type TravelDifficulty,
} from "./expedition";

/**
 * The Adventure Archive, read on the server.
 *
 * Five sources, one archive: trips, visited places, the wishlist and the photo
 * album from the travel tables, plus the travel *journals* for the written
 * story. That last one is the connection that matters and the reason nothing is
 * duplicated — a trip's narrative lives in exactly one place, and Explore links
 * to it rather than holding a second copy.
 *
 * Wrapped in React's `cache` because a page that needs the archive in its
 * layout, again in `generateMetadata` and again in the body would otherwise pay
 * for it three times inside one request.
 *
 * There is no sample archive and that is deliberate. An expedition archive is a
 * record of where one person has actually been — inventing entries for it would
 * be inventing journeys. An unreachable database yields an empty archive that
 * says so.
 */

export interface Archive {
  expeditions: Expedition[];
  places: ExploredPlace[];
  photos: ExpeditionPhoto[];
  stories: ArchiveStory[];
  stats: ExploreStats;
  /** True when the database could not be reached or holds nothing yet. */
  empty: boolean;
}

/** A travel journal, read as the written account of an expedition. */
export interface ArchiveStory {
  id: string;
  slug: string;
  title: string;
  href: string;
  description: string;
  location?: string;
  date?: string;
  mood?: string;
  content?: string;
  story?: string;
  coverImage?: string;
  tripId?: string;
  tripTitle?: string;
  tripSlug?: string;
}

const EMPTY_ARCHIVE: Archive = {
  expeditions: [],
  places: [],
  photos: [],
  stories: [],
  stats: computeStats([], [], 0, 0),
  empty: true,
};

/* ── Row → view model ────────────────────────────────────────────────────── */

function toVisitedPlace(
  row: VisitedRow,
  trip?: { id: string; title: string; slug: string },
): ExploredPlace {
  return {
    id: row.id,
    /* A visited row names a country, a city and optionally the specific spot.
       The most specific one that exists is the record's name; the rest is where
       it is. Falling back the other way would file every place in a city under
       the city's own name and make the archive unreadable. */
    name: row.place?.trim() || row.city,
    slug: makeSlug(row.place?.trim() || row.city, row.id),
    city: row.city,
    country: row.country,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    elevation: row.elevation ?? undefined,
    description: row.notes ?? undefined,
    notes: row.notes ?? undefined,
    mapsUrl: row.mapsUrl ?? undefined,
    visitedAt: iso(row.visitStart),
    status: "VISITED",
    category: (row.category as TravelCategory | null) ?? undefined,
    rating: row.rating ?? undefined,
    /* No tag column on a visited place, and no need for one: `activities` is
       already the list of what was done there, which is what the archive's tags
       are for. A second free-text list would only drift from this one. */
    tags: row.activities ?? [],
    coverImage: row.coverImage ?? undefined,
    gallery: row.gallery ?? [],
    isFavorite: row.isFavorited,
    companions: row.companions ?? [],
    tripId: row.tripId ?? undefined,
    tripTitle: trip?.title,
    tripSlug: trip?.slug,
  };
}

function toPlannedPlace(row: WishRow): ExploredPlace {
  return {
    id: row.id,
    name: row.title,
    slug: makeSlug(row.title, row.id),
    city: row.city ?? "",
    country: row.country ?? "",
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    description: row.description ?? undefined,
    notes: row.description ?? undefined,
    visitedAt: iso(row.visitedAt),
    status: "WISHLIST",
    category: (row.category as TravelCategory | null) ?? undefined,
    tags: row.tags ?? [],
    coverImage: row.coverImage ?? undefined,
    gallery: [],
    isFavorite: row.isFavorited,
    companions: [],
    why: row.whyVisit ?? row.inspirationalQuote ?? undefined,
    bestSeason: row.bestSeason ?? undefined,
    difficulty: (row.difficulty as TravelDifficulty | null) ?? undefined,
    priority: row.priority as PlacePriority,
    planningStatus: (row.planningStatus as PlanningStatus | null) ?? undefined,
    estimatedBudget: row.estimatedBudget ?? undefined,
    plannedYear: row.plannedYear ?? undefined,
  };
}

/**
 * Whether a wishlist row still belongs on the bucket list.
 *
 * `isVisited` is the one field that moves a destination out of "The Next
 * Expeditions" and into the archive. A visited wishlist row is not dropped —
 * it is not a *plan* any more, and the honest place for it is nowhere in the
 * planned list rather than in both lists at once.
 */
function stillPlanned(row: WishRow): boolean {
  return !row.isVisited;
}

/* ── The archive ─────────────────────────────────────────────────────────── */

export const loadArchive = cache(async (userId: string): Promise<Archive> => {
  let rows: ArchiveRows;

  try {
    rows = await readArchiveRows(userId);
  } catch (error) {
    console.error(
      "[explore] archive unavailable:",
      error instanceof Error ? error.message : error,
    );
    return EMPTY_ARCHIVE;
  }

  const { trips, visited, wishlist, album, journals, days } = rows;

  /* Trip slugs first: places and stories both need to link to an expedition,
     and both need the same slug the expedition itself will carry. */
  const tripMeta = new Map(
    trips.map((t) => [t.id, { id: t.id, title: t.title, slug: makeSlug(t.title, t.id) }]),
  );

  const places = [
    ...visited.map((row) => toVisitedPlace(row, row.tripId ? tripMeta.get(row.tripId) : undefined)),
    ...wishlist.filter(stillPlanned).map(toPlannedPlace),
  ].sort(byNewestPlace);

  /* The written accounts. A journal linked to a trip is that expedition's
     story; an unlinked one is a story in its own right, and both are readable
     at the same URL. */
  const stories: ArchiveStory[] = journals.map((j) => {
    const trip = j.tripId ? tripMeta.get(j.tripId) : undefined;
    const slug = makeSlug(j.title, j.id);
    return {
      id: j.id,
      slug,
      title: j.title,
      href: `/travel/explore/stories/${slug}`,
      description: firstLine(j.content ?? j.story ?? "") || (j.location ?? ""),
      location: j.location ?? undefined,
      date: iso(j.date),
      mood: j.mood ?? undefined,
      content: j.content ?? undefined,
      story: j.story ?? undefined,
      coverImage: isImageSrc(j.coverImage) ? j.coverImage : undefined,
      tripId: j.tripId ?? undefined,
      tripTitle: trip?.title,
      tripSlug: trip?.slug,
    };
  });

  const storyByTrip = new Map<string, ArchiveStory>();
  for (const story of stories) {
    if (story.tripId && !storyByTrip.has(story.tripId)) storyByTrip.set(story.tripId, story);
  }

  const journalsByTrip = new Map<string, JournalRow[]>();
  for (const j of journals) {
    if (!j.tripId) continue;
    const list = journalsByTrip.get(j.tripId);
    if (list) list.push(j);
    else journalsByTrip.set(j.tripId, [j]);
  }

  const daysByTrip = new Map<string, TripDayRow[]>();
  for (const d of days) {
    const list = daysByTrip.get(d.tripId);
    if (list) list.push(d);
    else daysByTrip.set(d.tripId, [d]);
  }

  const photosByTrip = new Map<string, string[]>();
  for (const p of album) {
    if (!p.tripId || !isImageSrc(p.url)) continue;
    const list = photosByTrip.get(p.tripId);
    if (list) list.push(p.url);
    else photosByTrip.set(p.tripId, [p.url]);
  }

  /* Numbered oldest-first so `Expedition 001` is the first one taken and a new
     trip never renumbers the ones before it — then presented newest-first. */
  const chronological = trips
    .slice()
    .sort((a, b) =>
      (iso(a.startDate) ?? iso(a.createdAt) ?? "").localeCompare(
        iso(b.startDate) ?? iso(b.createdAt) ?? "",
      ),
    );

  const expeditions = chronological
    .map((trip, index) =>
      toExpedition(trip, {
        number: expeditionNumber(index),
        slug: tripMeta.get(trip.id)!.slug,
        places: places
          .filter((p) => p.tripId === trip.id)
          .sort((a, b) => (a.visitedAt ?? "").localeCompare(b.visitedAt ?? "")),
        journals: journalsByTrip.get(trip.id) ?? [],
        days: daysByTrip.get(trip.id) ?? [],
        albumGallery: photosByTrip.get(trip.id) ?? [],
        storyHref: storyByTrip.get(trip.id)?.href,
      }),
    )
    .sort(byNewestExpedition);

  const albumPhotos: ExpeditionPhoto[] = album.map((p) => ({
    src: p.url,
    title: p.caption ?? undefined,
    location: p.location ?? undefined,
    date: iso(p.dateTaken),
    category: p.album ?? undefined,
  }));

  const photos = collectPhotos(expeditions, places, albumPhotos);

  return {
    expeditions,
    places,
    photos,
    stories,
    stats: computeStats(expeditions, places, photos.length, stories.length),
    empty: expeditions.length === 0 && places.length === 0,
  };
});

function toExpedition(
  row: TripRow,
  options: {
    number: string;
    slug: string;
    places: ExploredPlace[];
    journals: JournalRow[];
    days: TripDayRow[];
    albumGallery: string[];
    storyHref?: string;
  },
): Expedition {
  const { journals, days } = options;
  const startDate = iso(row.startDate);
  const endDate = iso(row.endDate);

  /* The trip's own gallery is its explicitly-filed images plus every photograph
     already filed against it in the album. Nobody should have to enter a URL
     twice for it to appear in both places. */
  const gallery = [...(row.gallery ?? []), ...options.albumGallery].filter(isImageSrc);

  return {
    id: row.id,
    number: options.number,
    title: row.title,
    slug: options.slug,
    destination: row.destination,
    country: row.country ?? undefined,
    description: row.notes ?? undefined,
    story: pick(journals.map((j) => j.story || j.content)),
    highlights: collect(journals.map((j) => j.favoriteMoment)),
    lessons: collect(journals.map((j) => j.lessonsLearned)),
    tips: collect(journals.map((j) => j.wouldDoAgain)),
    /* Field notes are the observations that were not prose: what was eaten and
       who was met. They are the lines someone wrote down at the time. */
    fieldNotes: collect(journals.flatMap((j) => [j.foodTried, j.peopleMet])),
    startDate,
    endDate,
    days: spanInDays(startDate, endDate),
    coverImage: isImageSrc(row.coverImage) ? row.coverImage : undefined,
    gallery: [...new Set(gallery)],
    category: (row.category as TravelCategory | null) ?? undefined,
    distanceKm: row.distanceKm ?? undefined,
    elevationM: row.elevationM ?? undefined,
    transportation: row.transportation ?? undefined,
    /* No companions column on a trip: the people are recorded against the
       places actually reached with them, so the expedition's party is the union
       of its legs rather than a third list to keep in step. */
    companions: [...new Set(options.places.flatMap((p) => p.companions))],
    difficulty: (row.difficulty as TravelDifficulty | null) ?? undefined,
    routeStops: toRouteStops(days),
    places: options.places,
    featured: row.featured,
    status: row.status,
    budget: row.budget ?? undefined,
    currency: row.currency ?? undefined,
    storyHref: options.storyHref,
  };
}

/**
 * The day-by-day plan, read as the legs of a journey.
 *
 * A day row carries a title, notes and a JSON list of places. Each named place
 * becomes a leg; a day with no places but a title of its own is still a leg,
 * because "rest day in Pokhara" is part of the journey.
 */
function toRouteStops(days: TripDayRow[]): RouteStop[] {
  const stops: RouteStop[] = [];

  for (const day of days) {
    const label = day.title?.trim() || `Day ${day.dayNumber}`;
    const named = Array.isArray(day.places)
      ? (day.places as unknown[])
          .map((p) => (typeof p === "string" ? p : ((p as { name?: string })?.name ?? "")))
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (named.length === 0) {
      stops.push({ name: label, at: `Day ${day.dayNumber}`, note: day.notes ?? undefined });
      continue;
    }

    named.forEach((name, index) => {
      stops.push({
        name,
        at: index === 0 ? `Day ${day.dayNumber}` : undefined,
        /* The day's note belongs to the day, so it rides on its first leg only
           — repeating it under every place would read as five separate notes
           that happen to be identical. */
        note: index === 0 ? (day.notes ?? day.title ?? undefined) : undefined,
      });
    });
  }

  return stops;
}

/* ── Small helpers ───────────────────────────────────────────────────────── */

function pick(values: (string | null | undefined)[]): string | undefined {
  for (const value of values) {
    if (value && value.trim()) return value;
  }
  return undefined;
}

function collect(values: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function firstLine(text: string): string {
  const line = text.split("\n").find((l) => l.trim());
  if (!line) return "";
  return line.trim().slice(0, 220);
}

/* ── Lookups ─────────────────────────────────────────────────────────────── */

export async function loadExpedition(
  userId: string,
  slug: string,
): Promise<Expedition | undefined> {
  const archive = await loadArchive(userId);
  return archive.expeditions.find((e) => matchesSlug(e, slug));
}

export async function loadPlace(
  userId: string,
  slug: string,
): Promise<ExploredPlace | undefined> {
  const archive = await loadArchive(userId);
  return archive.places.find((p) => matchesSlug(p, slug));
}

export async function loadStory(
  userId: string,
  slug: string,
): Promise<ArchiveStory | undefined> {
  const archive = await loadArchive(userId);
  return archive.stories.find((s) => matchesSlug(s, slug));
}
