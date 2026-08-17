/**
 * The library's content model.
 *
 * Eight shelves, one shape. A book, a journal entry and a travel tale are not
 * eight kinds of record with eight code paths behind them — they are one
 * `LibraryEntry` with a `kind`, plus a small `meta` bag for the handful of
 * fields that genuinely belong to one shelf and nowhere else (a journal's mood,
 * a trip's route, a book's genre). Everything the interface does — listing,
 * filtering, searching, bookmarking, reading, relating — is written once
 * against this type.
 *
 * Entries arrive from five of Life OS's own tables and normalise here:
 *
 *   journal_entries   the journal shelf
 *   books + chapters  books, short books and stories, read chapter by chapter
 *   travel_journals   travel tales — the same records Explore Mode reads
 *   knowledge_entries the articles shelf: written-up learning
 *   notes             ideas, and blogs when a note is filed as one
 *
 * Nothing is copied. The library is a *reading* of writing that already lives
 * somewhere in the application, which is why publishing a journal entry puts it
 * on a shelf without anyone having to file it twice.
 *
 * `source` survives normalisation because it is load-bearing: an entry has to
 * be able to say which part of the application it came from, so the reader can
 * be sent back there to edit it.
 */

/* ── Kinds ───────────────────────────────────────────────────────────────── */

export const LIBRARY_KINDS = [
  "journal",
  "story",
  "travel",
  "article",
  "blog",
  "book",
  "short-book",
  "idea",
] as const;

export type LibraryKind = (typeof LIBRARY_KINDS)[number];

export function isLibraryKind(value: unknown): value is LibraryKind {
  return typeof value === "string" && (LIBRARY_KINDS as readonly string[]).includes(value);
}

/* ── Status ──────────────────────────────────────────────────────────────── */

/**
 * The editorial workflow. Only `PUBLISHED` is ever public: `REVIEW` is a draft
 * the owner has finished but not released, and `ARCHIVED` is a published entry
 * withdrawn without deleting it.
 */
export const LIBRARY_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;

export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

/**
 * The *writing* status a story or book advertises to a reader, which is not
 * the same thing as its editorial status — a book can be `PUBLISHED` on this
 * site and still be `writing` in the sense the brief means.
 */
export type WritingProgress = "draft" | "writing" | "completed" | "published";

/* ── Shapes ──────────────────────────────────────────────────────────────── */

export interface LibraryChapter {
  title: string;
  slug: string;
  content: string;
  order: number;
}

/** A mappable stop on a travel chapter. */
export interface LibraryPlace {
  name: string;
  latitude?: number;
  longitude?: number;
  note?: string;
}

/**
 * Shelf-specific fields. Everything here is optional by construction: the
 * interface asks for what it needs and renders nothing when it is absent, so
 * adding a field to one shelf never touches the other seven.
 */
export interface LibraryMeta {
  /* journal */
  mood?: string;
  location?: string;
  /* travel */
  places?: LibraryPlace[];
  startDate?: string;
  endDate?: string;
  distanceKm?: number;
  companions?: string[];
  highlights?: string[];
  /* story, book, short book */
  genre?: string;
  synopsis?: string;
  /** How far along the writing is, 0–100. Only meaningful with `progress`. */
  completion?: number;
  writingProgress?: WritingProgress;
  /* article */
  series?: string;
}

export interface LibrarySeo {
  title?: string;
  description?: string;
  image?: string;
}

export interface LibraryEntry {
  id: string;
  kind: LibraryKind;
  title: string;
  slug: string;
  description: string;
  /** Markdown. Empty on a chaptered entry, which carries its prose per chapter. */
  content: string;
  chapters: LibraryChapter[];
  coverImage?: string;
  category?: string;
  tags: string[];
  status: LibraryStatus;
  publishedAt?: string;
  updatedAt: string;
  readingMinutes: number;
  wordCount: number;
  featured: boolean;
  source: LibrarySource;
  meta: LibraryMeta;
  seo?: LibrarySeo;
}

/**
 * Where an entry came from, and therefore where it is edited.
 *
 * The library never writes: every shelf is a view of a record owned by another
 * module, and an entry that could not name its owner would be a page with no
 * way back to the thing it is showing.
 */
export type LibrarySource = "journal" | "book" | "travel" | "knowledge" | "note";

/* ── Identity ────────────────────────────────────────────────────────────── */

/**
 * The key an entry is bookmarked and progress-tracked under.
 *
 * Kind-qualified, because slugs only have to be unique within a shelf — a
 * journal entry and an article may both be called `first-light`, and a bare
 * slug would silently merge their reading positions.
 */
export function entryKey(entry: Pick<LibraryEntry, "kind" | "slug">): string {
  return `${entry.kind}:${entry.slug}`;
}

/* ── Measurement ─────────────────────────────────────────────────────────── */

/** The conventional silent-reading rate. Used for every estimate on the site. */
export const WORDS_PER_MINUTE = 220;

export function countWords(text: string): number {
  const stripped = text
    // Fenced code is read, not scanned, but it is not *prose* — counting it at
    // 220 wpm would put twenty minutes on a five-minute tutorial.
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~\-|]/g, " ");
  const words = stripped.trim().match(/\S+/g);
  return words ? words.length : 0;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Total prose across an entry, whether it lives in `content` or in chapters. */
export function entryProse(entry: Pick<LibraryEntry, "content" | "chapters">): string {
  if (entry.chapters.length > 0) {
    return entry.chapters.map((chapter) => chapter.content).join("\n\n");
  }
  return entry.content;
}

/* ── Slugs ───────────────────────────────────────────────────────────────── */

/**
 * A clean, SEO-shaped slug: lowercase, unaccented, hyphen-separated, no
 * trailing punctuation. Shared by the editor, the chapter list and the table of
 * contents so a heading anchor and a chapter URL are generated the same way.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* ── Ordering ────────────────────────────────────────────────────────────── */

/** The two date fields any orderable library record carries. */
export type Dated = Pick<LibraryEntry, "publishedAt" | "updatedAt">;

/** Newest first, on the date that actually means "published". */
export function byNewest(a: Dated, b: Dated): number {
  return entryDate(b).localeCompare(entryDate(a));
}

export function entryDate(entry: Dated): string {
  return entry.publishedAt || entry.updatedAt || "";
}

export function entryYear(entry: Dated): string {
  return entryDate(entry).slice(0, 4);
}

/* ── Relationships ───────────────────────────────────────────────────────── */

/**
 * "You may also like", scored rather than filtered.
 *
 * Same shelf counts for most — a reader finishing a travel chapter wants
 * another travel chapter, which is exactly the example in the brief — then
 * shared tags, then a shared category. Anything scoring zero is dropped rather
 * than padded out with whatever is newest: a bad recommendation is worse than
 * three instead of four.
 */
export function relatedEntries(
  entry: LibraryEntry,
  pool: LibraryEntry[],
  limit = 3,
): LibraryEntry[] {
  const tags = new Set(entry.tags.map((tag) => tag.toLowerCase()));

  return pool
    .filter((candidate) => entryKey(candidate) !== entryKey(entry))
    .map((candidate) => {
      let score = 0;
      if (candidate.kind === entry.kind) score += 3;
      for (const tag of candidate.tags) {
        if (tags.has(tag.toLowerCase())) score += 2;
      }
      if (entry.category && candidate.category === entry.category) score += 2;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.candidate, b.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/* ── Search ──────────────────────────────────────────────────────────────── */

/**
 * The shape search runs against — deliberately not `LibraryEntry`.
 *
 * Search happens in the browser, so whatever it searches has to be *sent* to
 * the browser. Shipping the archive as `LibraryEntry[]` would put the full text
 * of every book, chapter by chapter, into the payload of every library page, to
 * power a box most readers never open. The index carries the metadata whole and
 * the prose truncated: enough for an honest body match and an excerpt, at a
 * fraction of the bytes.
 */
export interface LibraryIndexEntry {
  kind: LibraryKind;
  slug: string;
  title: string;
  description: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
  updatedAt: string;
  readingMinutes: number;
  source: LibrarySource;
  /** Opening prose, flattened and truncated — the body-match haystack. */
  prose: string;
}

/**
 * How much of each entry's prose travels to the browser.
 *
 * Twelve hundred characters is roughly the first two hundred words, which is
 * where a piece says what it is about. A reader searching for a phrase buried
 * on page nine of a book will not find it here — and that is the honest
 * trade, stated rather than hidden: the alternative is a megabyte of payload
 * on every page load.
 */
export const INDEX_PROSE_LIMIT = 1200;

export function toIndexEntry(entry: LibraryEntry): LibraryIndexEntry {
  return {
    kind: entry.kind,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    tags: entry.tags,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    readingMinutes: entry.readingMinutes,
    source: entry.source,
    prose: entryProse(entry).slice(0, INDEX_PROSE_LIMIT),
  };
}

export function buildIndex(entries: LibraryEntry[]): LibraryIndexEntry[] {
  return entries.map(toIndexEntry);
}

export interface SearchHit {
  entry: LibraryIndexEntry;
  /** The line the match was found on, for the result excerpt. */
  excerpt?: string;
}

/**
 * A plain, honest substring search over the index already in memory.
 *
 * It is not a ranking engine and it does not pretend to be one — the library is
 * a personal archive, not a corpus, and shipping one for a few hundred entries
 * would cost the reader more bytes than it saves them time. Title and
 * description matches outrank body matches, which is the only piece of ranking
 * that changes what a reader sees first.
 */
export function searchLibrary(query: string, pool: LibraryIndexEntry[], limit = 12): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const hits: { hit: SearchHit; score: number }[] = [];

  for (const entry of pool) {
    const title = entry.title.toLowerCase();
    const description = entry.description.toLowerCase();

    let score = 0;
    if (title.startsWith(needle)) score += 12;
    else if (title.includes(needle)) score += 8;
    if (description.includes(needle)) score += 4;
    if (entry.tags.some((tag) => tag.toLowerCase().includes(needle))) score += 3;
    if (entry.category?.toLowerCase().includes(needle)) score += 2;

    let excerpt: string | undefined;
    if (score === 0) {
      excerpt = findExcerpt(entry.prose, needle);
      if (excerpt) score += 1;
    }

    if (score > 0) hits.push({ hit: { entry, excerpt }, score });
  }

  return hits
    .sort((a, b) => b.score - a.score || byNewest(a.hit.entry, b.hit.entry))
    .slice(0, limit)
    .map(({ hit }) => hit);
}

/** The sentence around the first body match, trimmed to a readable length. */
function findExcerpt(prose: string, needle: string): string | undefined {
  const index = prose.toLowerCase().indexOf(needle);
  if (index === -1) return undefined;

  const start = Math.max(0, index - 60);
  const end = Math.min(prose.length, index + needle.length + 90);
  const slice = prose.slice(start, end).replace(/\s+/g, " ").trim();

  return `${start > 0 ? "…" : ""}${slice}${end < prose.length ? "…" : ""}`;
}

/* ── Filtering ───────────────────────────────────────────────────────────── */

export interface LibraryFilters {
  kind?: LibraryKind | "all";
  year?: string;
  tag?: string;
  category?: string;
}

export function applyFilters(entries: LibraryEntry[], filters: LibraryFilters): LibraryEntry[] {
  return entries.filter((entry) => {
    if (filters.kind && filters.kind !== "all" && entry.kind !== filters.kind) return false;
    if (filters.year && entryYear(entry) !== filters.year) return false;
    if (filters.category && entry.category !== filters.category) return false;
    if (
      filters.tag &&
      !entry.tags.some((tag) => tag.toLowerCase() === filters.tag?.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

/** Every year that has at least one entry, newest first. */
export function yearsIn(entries: LibraryEntry[]): string[] {
  const years = new Set<string>();
  for (const entry of entries) {
    const year = entryYear(entry);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b.localeCompare(a));
}

/** Tags across a set, most-used first, so the filter row leads with the useful ones. */
export function tagsIn(entries: LibraryEntry[], limit = 24): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function categoriesIn(entries: LibraryEntry[]): string[] {
  const categories = new Set<string>();
  for (const entry of entries) {
    if (entry.category) categories.add(entry.category);
  }
  return [...categories].sort((a, b) => a.localeCompare(b));
}
