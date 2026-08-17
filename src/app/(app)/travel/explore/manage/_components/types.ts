import { CATEGORIES } from "@/modules/travel/explore";

/**
 * What the desk edits.
 *
 * These mirror the API's row shapes rather than Explore's view models on
 * purpose: the archive derives an `Expedition` from a trip plus its journals
 * plus its places, and a form that edited the derivation would have nowhere to
 * send a change. The desk edits records; Explore reads what they add up to.
 */

export type Tab = "locations" | "expeditions" | "journals";

export type LocationKind = "VISITED" | "PLANNED";

export interface VisitedRecord {
  id: string;
  tripId: string | null;
  country: string;
  city: string;
  place: string | null;
  visitStart: string | null;
  visitEnd: string | null;
  rating: number | null;
  mood: string | null;
  notes: string | null;
  companions: string[];
  activities: string[];
  isFavorited: boolean;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  coverImage: string | null;
  gallery: string[];
  mapsUrl: string | null;
}

export interface WishlistRecord {
  id: string;
  title: string;
  description: string | null;
  country: string | null;
  city: string | null;
  priority: string;
  category: string | null;
  estimatedBudget: number | null;
  bestSeason: string | null;
  coverImage: string | null;
  whyVisit: string | null;
  plannedYear: number | null;
  tags: string[];
  isFavorited: boolean;
  isVisited: boolean;
  visitedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  difficulty: string | null;
  planningStatus: string | null;
}

export interface TripRecord {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  budget: number | null;
  currency: string | null;
  travelers: number | null;
  notes: string | null;
  category: string | null;
  distanceKm: number | null;
  elevationM: number | null;
  transportation: string | null;
  difficulty: string | null;
  gallery: string[];
  featured: boolean;
}

export interface JournalRecord {
  id: string;
  tripId: string | null;
  title: string;
  coverImage: string | null;
  location: string | null;
  date: string | null;
  mood: string | null;
  content: string | null;
  story: string | null;
  lessonsLearned: string | null;
  favoriteMoment: string | null;
  foodTried: string | null;
  peopleMet: string | null;
  wouldDoAgain: string | null;
}

/**
 * A location row as the list shows it — one shape over two tables.
 *
 * The desk lists visited places and bucket-list entries together because they
 * are the same thing at two moments in its life, which is exactly how Explore
 * reads them. `kind` says which table the row came from, so edit and delete
 * know where to send themselves.
 */
export interface LocationRow {
  id: string;
  kind: LocationKind;
  name: string;
  where: string;
  date: string | null;
  country: string;
  tripId: string | null;
  isFavorited: boolean;
  located: boolean;
  category: string | null;
  /** True for a bucket-list entry that has been ticked off. */
  reached: boolean;
}

/* ── Option lists ─────────────────────────────────────────────────────────
   Built from the archive's own category table, so the desk cannot offer a
   ninth kind that no page knows how to render. */

export const CATEGORY_OPTIONS: [string, string][] = [
  ["", "—"],
  ...CATEGORIES.map((c) => [c.key, c.label] as [string, string]),
];

export const DIFFICULTY_OPTIONS: [string, string][] = [
  ["", "—"],
  ["easy", "Easy"],
  ["moderate", "Moderate"],
  ["hard", "Hard"],
  ["extreme", "Extreme"],
];

export const PRIORITY_OPTIONS: [string, string][] = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["dream", "Dream"],
];

export const PLANNING_OPTIONS: [string, string][] = [
  ["", "—"],
  ["planned", "Planned"],
  ["researching", "Researching"],
  ["ready", "Ready to go"],
];

export const TRIP_STATUS_OPTIONS: [string, string][] = [
  ["planning", "Planning"],
  ["booked", "Booked"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export const MOOD_OPTIONS: [string, string][] = [
  ["", "—"],
  ["excited", "Excited"],
  ["loved_it", "Loved it"],
  ["peaceful", "Peaceful"],
  ["emotional", "Emotional"],
  ["amazing", "Amazing"],
  ["difficult", "Difficult"],
];
