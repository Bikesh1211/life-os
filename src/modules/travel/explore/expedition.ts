/**
 * The Adventure Archive's view models.
 *
 * Nothing here is a new table. `travel_trips`, `travel_visited_places` and
 * `travel_wishlist` already hold every outing taken, every place reached and
 * every destination still wanted — they back the Travel dashboard's tabs.
 * Explore Mode is a *second reading* of the same records, so what lives in this
 * file is the derivation: a trip plus its linked places plus its photographs
 * becomes an `Expedition`; a visited place, or a wishlist row, becomes an
 * `ExploredPlace`.
 *
 * Two consequences worth stating, because they are the whole point:
 *
 *   Adding a trip in the Travel tabs puts it on the expedition map, in the
 *   timeline, in the category views and in the archive's search at once — there
 *   is nothing to keep in step.
 *
 *   A wishlist row *is* a bucket-list entry. `isVisited` already exists, so
 *   "completed destinations move into the visited archive" is not a feature to
 *   build; it is what flipping that one field already does.
 */

/* ── Vocabulary ──────────────────────────────────────────────────────────── */

/** The eight kinds, shared by a trip, a place and a wishlist row. */
export type TravelCategory =
  | "beach"
  | "mountains"
  | "historical"
  | "food"
  | "adventure"
  | "nature"
  | "city"
  | "spiritual";

export type TravelDifficulty = "easy" | "moderate" | "hard" | "extreme";

export type PlanningStatus = "planned" | "researching" | "ready";

export type PlacePriority = "low" | "medium" | "high" | "dream";

/* ── Shapes ──────────────────────────────────────────────────────────────── */

export interface ExploredPlace {
  id: string;
  name: string;
  slug: string;
  /** The town or region. `district` in a national archive, `city` here. */
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  description?: string;
  notes?: string;
  mapsUrl?: string;
  visitedAt?: string;
  status: "VISITED" | "WISHLIST";
  category?: TravelCategory;
  rating?: number;
  tags: string[];
  coverImage?: string;
  gallery: string[];
  isFavorite: boolean;
  companions: string[];
  /** The expedition that reached it, when one is linked. */
  tripId?: string;
  tripTitle?: string;
  tripSlug?: string;
  /* Planning fields — meaningful on a WISHLIST place. */
  why?: string;
  bestSeason?: string;
  difficulty?: TravelDifficulty;
  priority?: PlacePriority;
  planningStatus?: PlanningStatus;
  estimatedBudget?: number;
  plannedYear?: number;
  currency?: string;
}

export interface ExpeditionPhoto {
  src: string;
  title?: string;
  location?: string;
  date?: string;
  category?: string;
}

/** A leg of the journey, from the trip's own day-by-day plan. */
export interface RouteStop {
  name: string;
  at?: string;
  note?: string;
}

export interface Expedition {
  id: string;
  /** `007` — position in the chronology, not a stored field. See `expeditionNumber`. */
  number: string;
  title: string;
  slug: string;
  destination: string;
  country?: string;
  description?: string;
  story?: string;
  highlights: string[];
  lessons: string[];
  tips: string[];
  fieldNotes: string[];
  startDate?: string;
  endDate?: string;
  /** Whole days, inclusive, when both ends are recorded. */
  days?: number;
  coverImage?: string;
  gallery: string[];
  category?: TravelCategory;
  distanceKm?: number;
  elevationM?: number;
  transportation?: string;
  companions: string[];
  difficulty?: TravelDifficulty;
  routeStops: RouteStop[];
  /** Places linked to this trip, in visiting order. */
  places: ExploredPlace[];
  featured: boolean;
  status: string;
  budget?: number;
  currency?: string;
  spent?: number;
  /** `/travel/explore/stories/<slug>` when a journal holds the written story. */
  storyHref?: string;
}

/* ── Slugs ───────────────────────────────────────────────────────────────── */

/**
 * A readable, stable URL for a record that has no slug column.
 *
 * The title alone is not enough — two trips called "Weekend away" would collide
 * — so the row's own id rides on the end. Six characters of a UUID is a
 * collision the archive will not see, and the slug survives a rename of the
 * title in the sense that matters: the *old* link still resolves, because
 * lookup matches on the id suffix rather than on the whole string.
 */
export function makeSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = id.replace(/-/g, "").slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}

/** The id fragment a slug carries, so a renamed record keeps its old links. */
export function slugKey(slug: string): string {
  return slug.slice(slug.lastIndexOf("-") + 1);
}

export function matchesSlug(record: { id: string; slug: string }, slug: string): boolean {
  return record.slug === slug || slugKey(record.slug) === slugKey(slug);
}

/* ── Dates ───────────────────────────────────────────────────────────────── */

/** A stored timestamp as a plain ISO string, or undefined when there is none. */
export function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/**
 * Inclusive whole days between two dates, or `undefined` when either end is
 * missing. A one-day trip is 1, not 0 — a reader counting days counts the day
 * they left.
 */
export function spanInDays(start?: string, end?: string): number | undefined {
  if (!start) return undefined;
  const from = Date.parse(start);
  const to = Date.parse(end || start);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return undefined;
  return Math.round((to - from) / 86_400_000) + 1;
}

/** `001`, `014` — position in the chronology, oldest first. */
export function expeditionNumber(index: number): string {
  return String(index + 1).padStart(3, "0");
}

/* ── The route a map should draw ─────────────────────────────────────────── */

/**
 * Prefers the places a trip actually reached, in visiting order, because only
 * those carry a fix. The day-by-day plan is richer as *prose* — it names the
 * tea stop on the pass — but its entries have no coordinates, so it drives the
 * journey timeline and not the line on the map.
 */
export function routeLine(
  expedition: Expedition,
): { name: string; latitude: number; longitude: number }[] {
  return expedition.places
    .filter(
      (p): p is ExploredPlace & { latitude: number; longitude: number } =>
        typeof p.latitude === "number" && typeof p.longitude === "number",
    )
    .map((p) => ({ name: p.name, latitude: p.latitude, longitude: p.longitude }));
}

/* ── Ordering ────────────────────────────────────────────────────────────── */

export function expeditionDate(e: Expedition): string {
  return e.startDate || e.endDate || "";
}

/** Newest first — the order an archive is browsed in. */
export function byNewestExpedition(a: Expedition, b: Expedition): number {
  return expeditionDate(b).localeCompare(expeditionDate(a));
}

export function placeDate(p: ExploredPlace): string {
  return p.visitedAt || "";
}

export function byNewestPlace(a: ExploredPlace, b: ExploredPlace): number {
  return placeDate(b).localeCompare(placeDate(a));
}

export function yearOf(value: string): string {
  return value.slice(0, 4);
}

/* ── Countries ───────────────────────────────────────────────────────────── */

/**
 * `country` is typed by hand, so treating distinct strings as distinct
 * countries counts casing and stray whitespace as separate nations: an archive
 * holding "nepal", "Nepal " and "NEPAL" reports three countries visited and
 * offers three filter chips.
 *
 * There is no country list in this codebase to validate against, so this
 * normalises rather than validates — trim, collapse the spaces, title-case the
 * words. That collapses the three ways the same country gets typed without
 * pretending to know which strings are real countries.
 */
export function canonicalCountry(value: string | undefined | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;
  return cleaned
    .split(" ")
    .map((word) =>
      word.length <= 3 && word === word.toUpperCase()
        ? word // UK, USA, UAE — already how they are written.
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

/** The countries actually present in a set, canonical and alphabetical. */
export function countriesOf(places: ExploredPlace[]): string[] {
  const present = new Set(
    places.map((p) => canonicalCountry(p.country)).filter((c): c is string => c !== null),
  );
  return [...present].sort((a, b) => a.localeCompare(b));
}

/* ── Statistics ──────────────────────────────────────────────────────────── */

/**
 * Every figure the archive prints, and `null` for every figure it cannot
 * support.
 *
 * The rule: a number that cannot be counted out of the record is *absent*, not
 * estimated. Distance is null until at least one trip records a distance;
 * travel days is null until at least one trip records both of its dates. The
 * interface omits a null stat rather than printing a zero, because "0 km" and
 * "we do not know yet" are different claims.
 */
export interface ExploreStats {
  countries: number;
  cities: number;
  places: number;
  expeditions: number;
  favourites: number;
  planned: number;
  photos: number;
  stories: number;
  distanceKm: number | null;
  travelDays: number | null;
  highestElevationM: number | null;
}

export function computeStats(
  expeditions: Expedition[],
  places: ExploredPlace[],
  photoCount: number,
  storyCount: number,
): ExploreStats {
  const visited = places.filter((p) => p.status === "VISITED");

  const countries = new Set(
    visited.map((p) => canonicalCountry(p.country)).filter((c): c is string => c !== null),
  );
  const cities = new Set(visited.map((p) => p.city.trim()).filter(Boolean));

  const distances = expeditions
    .map((e) => e.distanceKm)
    .filter((d): d is number => typeof d === "number" && d > 0);

  const days = expeditions.map((e) => e.days).filter((d): d is number => typeof d === "number");

  const elevations = [
    ...visited.map((p) => p.elevation),
    ...expeditions.map((e) => e.elevationM),
  ].filter((v): v is number => typeof v === "number" && v > 0);

  return {
    countries: countries.size,
    cities: cities.size,
    places: visited.length,
    expeditions: expeditions.length,
    favourites: visited.filter((p) => p.isFavorite).length,
    planned: places.filter((p) => p.status === "WISHLIST").length,
    photos: photoCount,
    stories: storyCount,
    distanceKm: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) : null,
    travelDays: days.length > 0 ? days.reduce((a, b) => a + b, 0) : null,
    highestElevationM: elevations.length > 0 ? Math.max(...elevations) : null,
  };
}

/* ── Filtering ───────────────────────────────────────────────────────────── */

export interface ExploreFilters {
  country?: string;
  city?: string;
  year?: string;
  category?: TravelCategory | "all";
  difficulty?: TravelDifficulty;
  status?: "VISITED" | "WISHLIST" | "all";
}

export function filterPlaces(places: ExploredPlace[], f: ExploreFilters): ExploredPlace[] {
  return places.filter((p) => {
    if (f.status && f.status !== "all" && p.status !== f.status) return false;
    if (f.country && canonicalCountry(p.country) !== f.country) return false;
    if (f.city && p.city !== f.city) return false;
    if (f.category && f.category !== "all" && p.category !== f.category) return false;
    if (f.difficulty && p.difficulty !== f.difficulty) return false;
    if (f.year && yearOf(placeDate(p)) !== f.year) return false;
    return true;
  });
}

export function filterExpeditions(list: Expedition[], f: ExploreFilters): Expedition[] {
  return list.filter((e) => {
    if (f.category && f.category !== "all" && e.category !== f.category) return false;
    if (f.difficulty && e.difficulty !== f.difficulty) return false;
    if (f.year && yearOf(expeditionDate(e)) !== f.year) return false;
    if (f.country) {
      const own = canonicalCountry(e.country);
      const reached = e.places.some((p) => canonicalCountry(p.country) === f.country);
      if (own !== f.country && !reached) return false;
    }
    return true;
  });
}

export function yearsOf(values: string[]): string[] {
  const years = new Set(values.map(yearOf).filter(Boolean));
  return [...years].sort((a, b) => b.localeCompare(a));
}

/* ── Search ──────────────────────────────────────────────────────────────── */

export type ArchiveHitKind = "place" | "expedition" | "story";

/**
 * The shape search runs against — deliberately not `Expedition[]`.
 *
 * Search happens in the browser, so whatever it searches has to be *sent* to
 * the browser. Shipping the archive as full records would put every
 * expedition's narrative, every field note and every gallery URL into the
 * payload of every Explore page, to power a box most readers never open. The
 * index carries only the fields the matcher actually reads.
 */
export interface ArchiveIndexPlace {
  name: string;
  slug: string;
  city: string;
  country: string;
  description?: string;
  tags: string[];
}

export interface ArchiveIndexExpedition {
  title: string;
  slug: string;
  number: string;
  description?: string;
  places: string[];
}

export interface ArchiveIndexStory {
  title: string;
  description: string;
  href: string;
}

export interface ArchiveIndex {
  places: ArchiveIndexPlace[];
  expeditions: ArchiveIndexExpedition[];
  stories: ArchiveIndexStory[];
}

export function buildArchiveIndex(
  expeditions: Expedition[],
  places: ExploredPlace[],
  stories: ArchiveIndexStory[],
): ArchiveIndex {
  return {
    places: places.map((p) => ({
      name: p.name,
      slug: p.slug,
      city: p.city,
      country: p.country,
      description: p.description,
      tags: p.tags,
    })),
    expeditions: expeditions.map((e) => ({
      title: e.title,
      slug: e.slug,
      number: e.number,
      description: e.description,
      places: e.places.map((p) => p.name),
    })),
    stories,
  };
}

export interface ArchiveHit {
  kind: ArchiveHitKind;
  title: string;
  subtitle: string;
  href: string;
  score: number;
}

/**
 * One search across the three things the archive holds.
 *
 * Deliberately a plain scored substring match over an index already in memory —
 * the archive is a personal logbook, not a corpus, and the honest cost of a
 * ranking engine here is larger than the honest benefit. Results always name
 * their kind, because one name is legitimately a place, an expedition and a
 * story at once, and a result list that does not say which is which is three
 * identical rows.
 */
export function searchArchive(query: string, index: ArchiveIndex, limit = 12): ArchiveHit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const hits: ArchiveHit[] = [];

  const score = (title: string, rest: string) => {
    const t = title.toLowerCase();
    if (t.startsWith(needle)) return 12;
    if (t.includes(needle)) return 8;
    if (rest.toLowerCase().includes(needle)) return 3;
    return 0;
  };

  for (const p of index.places) {
    const s = score(p.name, `${p.city} ${p.country} ${p.description ?? ""} ${p.tags.join(" ")}`);
    if (s > 0) {
      hits.push({
        kind: "place",
        title: p.name,
        subtitle: [p.city, p.country].filter(Boolean).join(", "),
        href: `/travel/explore/places/${p.slug}`,
        score: s,
      });
    }
  }

  for (const e of index.expeditions) {
    const s = score(e.title, `${e.description ?? ""} ${e.places.join(" ")}`);
    if (s > 0) {
      hits.push({
        kind: "expedition",
        title: e.title,
        subtitle: `Expedition ${e.number}`,
        href: `/travel/explore/trips/${e.slug}`,
        score: s,
      });
    }
  }

  for (const story of index.stories) {
    const s = score(story.title, story.description);
    if (s > 0) {
      hits.push({
        kind: "story",
        title: story.title,
        subtitle: "Travel story",
        href: story.href,
        score: s,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

/* ── Photos ──────────────────────────────────────────────────────────────── */

/**
 * Whether a stored value can be shown as a photograph.
 *
 * Image fields are typed by hand, and a value that is not a reference at all —
 * a stray note, a pasted caption — is not merely useless: the browser resolves
 * it as a *relative path*, asks this app for it, gets a page back, and paints a
 * broken frame. Worse, that failure happens while the server HTML is being
 * parsed, so it never reaches React and no `onError` can clean it up.
 *
 * Absolute URLs, site-rooted paths and data URIs pass; everything else is not
 * an image and the archive shows nothing rather than a broken one.
 */
export function isImageSrc(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^(https?:\/\/|\/|data:image\/)/.test(value.trim());
}

/**
 * One expedition's photographs, in the order a reader should meet them: its
 * cover, its own gallery, then the frames filed against the places it reached.
 *
 * Deliberately shared rather than rebuilt at each call site — the dossier card
 * shows the first of these and counts the rest, and the expedition page renders
 * the same list under Memories. Built separately they drift, and a card
 * promising twelve frames that opens onto eleven is the archive lying about its
 * own holdings.
 */
export function expeditionPhotos(e: Expedition): ExpeditionPhoto[] {
  const seen = new Set<string>();
  const out: ExpeditionPhoto[] = [];
  const date = expeditionDate(e);

  const push = (photo: ExpeditionPhoto) => {
    if (!isImageSrc(photo.src) || seen.has(photo.src)) return;
    seen.add(photo.src);
    out.push(photo);
  };

  if (e.coverImage) push({ src: e.coverImage, title: e.title, date });
  for (const src of e.gallery) push({ src, title: e.title, date });

  for (const place of e.places) {
    if (place.coverImage) {
      push({
        src: place.coverImage,
        title: place.name,
        location: place.city,
        date: place.visitedAt,
      });
    }
    for (const src of place.gallery) {
      push({ src, title: place.name, location: place.city, date: place.visitedAt });
    }
  }

  return out;
}

/**
 * The gallery, drawn from three places at once: the photo album, each
 * expedition's own gallery, and each place's. A photograph attached to a trip
 * is a photograph of that trip whether or not anybody also filed it in the
 * album, and the archive should not make the owner do both.
 */
export function collectPhotos(
  expeditions: Expedition[],
  places: ExploredPlace[],
  album: ExpeditionPhoto[],
): ExpeditionPhoto[] {
  const seen = new Set<string>();
  const out: ExpeditionPhoto[] = [];

  const push = (photo: ExpeditionPhoto) => {
    if (!isImageSrc(photo.src) || seen.has(photo.src)) return;
    seen.add(photo.src);
    out.push(photo);
  };

  for (const photo of album) push(photo);

  for (const e of expeditions) {
    if (e.coverImage) push({ src: e.coverImage, title: e.title, date: e.startDate });
    for (const src of e.gallery) push({ src, title: e.title, date: e.startDate });
  }

  for (const p of places) {
    if (p.coverImage) {
      push({ src: p.coverImage, title: p.name, location: p.city, date: p.visitedAt });
    }
    for (const src of p.gallery) {
      push({ src, title: p.name, location: p.city, date: p.visitedAt });
    }
  }

  return out;
}

/* ── Distance ────────────────────────────────────────────────────────────── */

/**
 * Places near a given one, by great-circle distance.
 *
 * Straight-line kilometres, and the interface says so where it prints them —
 * the road between two points thirty kilometres apart is routinely a hundred.
 * Places without a fix are excluded rather than guessed at.
 */
export function nearbyPlaces(
  origin: ExploredPlace,
  all: ExploredPlace[],
  limit = 4,
): { place: ExploredPlace; km: number }[] {
  if (typeof origin.latitude !== "number" || typeof origin.longitude !== "number") return [];
  const lat = origin.latitude;
  const lng = origin.longitude;

  return all
    .filter(
      (p): p is ExploredPlace & { latitude: number; longitude: number } =>
        p.id !== origin.id &&
        typeof p.latitude === "number" &&
        typeof p.longitude === "number",
    )
    .map((place) => ({
      place,
      km: haversineKm(lat, lng, place.latitude, place.longitude),
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
