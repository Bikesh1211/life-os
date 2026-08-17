import type { TablerIcon } from "@tabler/icons-react";
import {
  IconArticle,
  IconBook,
  IconBook2,
  IconBulb,
  IconFeather,
  IconMap2,
  IconNews,
  IconScript,
} from "@tabler/icons-react";
import type { LibraryKind } from "./entry";

/**
 * The eight shelves, in the order the reader meets them on the landing page.
 *
 * This is the single place a shelf is described. The URL segment, the numeral
 * on the shelf card, the plural and singular nouns, the empty state and the
 * blurb all come from here, which is why adding a ninth shelf is a data change
 * and a route file rather than an edit across twenty components.
 *
 * The order is deliberate: the most personal writing first (journal, stories,
 * travel), the most public last (books, ideas). It is the order a room is
 * arranged in, not an alphabet.
 */

export interface Shelf {
  kind: LibraryKind;
  /** The URL segment under `/library/`. Plural except `journal` and `travel`. */
  segment: string;
  numeral: string;
  /** Shelf heading — set in spaced caps by the interface, so stored unspaced. */
  title: string;
  /** What one entry on this shelf is called, for buttons and empty states. */
  noun: string;
  nounPlural: string;
  blurb: string;
  icon: TablerIcon;
  /** Shown on the card when the shelf has nothing on it yet. */
  empty: string;
  /** Entries here are read chapter by chapter and get the reading-mode route. */
  chaptered: boolean;
  /** Where a reader goes to write one. Every shelf is a view of another module. */
  writeHref: string;
}

export const SHELVES: Shelf[] = [
  {
    kind: "journal",
    segment: "journal",
    numeral: "01",
    title: "Journal",
    noun: "entry",
    nounPlural: "entries",
    blurb: "Personal thoughts, daily reflections, experiences, lessons, and memories.",
    icon: IconScript,
    empty: "The journal is closed for now.",
    chaptered: false,
    writeHref: "/journal/new",
  },
  {
    kind: "story",
    segment: "stories",
    numeral: "02",
    title: "Stories",
    noun: "story",
    nounPlural: "stories",
    blurb: "Short stories, fictional writing, creative experiments, and narratives.",
    icon: IconFeather,
    empty: "No stories have been set down yet.",
    chaptered: true,
    writeHref: "/creator-studio/books",
  },
  {
    kind: "travel",
    segment: "travel",
    numeral: "03",
    title: "Travel Tales",
    noun: "tale",
    nounPlural: "tales",
    blurb: "Travel written as stories rather than guides — routes, weather, people, arrival.",
    icon: IconMap2,
    empty: "No journeys have been written up yet.",
    chaptered: false,
    writeHref: "/travel/explore/manage",
  },
  {
    kind: "article",
    segment: "articles",
    numeral: "04",
    title: "Articles",
    noun: "article",
    nounPlural: "articles",
    blurb:
      "Technical and non-technical writing — tutorials, guides, research, engineering notes.",
    icon: IconNews,
    empty: "No articles have been filed yet.",
    chaptered: false,
    writeHref: "/knowledge/new",
  },
  {
    kind: "blog",
    segment: "blogs",
    numeral: "05",
    title: "Blogs",
    noun: "post",
    nounPlural: "posts",
    blurb: "Long-form thoughts, opinions, experiences, and ideas.",
    icon: IconArticle,
    empty: "Nothing posted here yet.",
    chaptered: false,
    writeHref: "/notes",
  },
  {
    kind: "book",
    segment: "books",
    numeral: "06",
    title: "Books",
    noun: "book",
    nounPlural: "books",
    blurb: "Long-form writing projects, published and in progress.",
    icon: IconBook,
    empty: "The main shelf is still being filled.",
    chaptered: true,
    writeHref: "/creator-studio/books",
  },
  {
    kind: "short-book",
    segment: "short-books",
    numeral: "07",
    title: "Short Books",
    noun: "short book",
    nounPlural: "short books",
    blurb: "Novellas, mini guides, collections, and experiments.",
    icon: IconBook2,
    empty: "No short books on this shelf yet.",
    chaptered: true,
    writeHref: "/creator-studio/books",
  },
  {
    kind: "idea",
    segment: "ideas",
    numeral: "08",
    title: "Ideas",
    noun: "idea",
    nounPlural: "ideas",
    blurb: "Unfinished ideas, concepts, drafts, and things still being explored.",
    icon: IconBulb,
    empty: "Nothing pinned to this board yet.",
    chaptered: false,
    writeHref: "/notes",
  },
];

const BY_KIND = new Map(SHELVES.map((shelf) => [shelf.kind, shelf]));
const BY_SEGMENT = new Map(SHELVES.map((shelf) => [shelf.segment, shelf]));

export function shelfFor(kind: LibraryKind): Shelf {
  const shelf = BY_KIND.get(kind);
  // Every kind in `LIBRARY_KINDS` has a shelf, and the type system says so —
  // this only fires if the two lists are edited apart.
  if (!shelf) throw new Error(`No shelf configured for kind "${kind}"`);
  return shelf;
}

export function shelfForSegment(segment: string): Shelf | undefined {
  return BY_SEGMENT.get(segment);
}

/** `/library/travel/sailung` — the canonical path for an entry. */
export function entryHref(entry: { kind: LibraryKind; slug: string }): string {
  return `/library/${shelfFor(entry.kind).segment}/${entry.slug}`;
}

export function shelfHref(shelf: Pick<Shelf, "segment">): string {
  return `/library/${shelf.segment}`;
}

/** The distraction-free route. Only chaptered shelves have one. */
export function readHref(entry: { kind: LibraryKind; slug: string }): string {
  return `${entryHref(entry)}/read`;
}

/**
 * The navigation order, which is *not* the shelf order.
 *
 * The landing page arranges the room; the rail is a list someone scans on their
 * way somewhere, so it leads with the long-form shelves.
 */
export const NAV_ORDER: LibraryKind[] = [
  "book",
  "short-book",
  "story",
  "journal",
  "article",
  "blog",
  "travel",
  "idea",
];

export const NAV_SHELVES: Shelf[] = NAV_ORDER.map(shelfFor);
