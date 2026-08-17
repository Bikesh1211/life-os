import "server-only";

import { cache } from "react";
import {
  byNewest,
  countWords,
  entryProse,
  readingMinutes,
  slugify,
  type LibraryEntry,
  type LibraryKind,
} from "./entry";
import { proseMirrorToMarkdown } from "./prosemirror";
import { readLibraryRows } from "./repository";
import type {
  BookRow,
  ChapterRow,
  JournalRow,
  KnowledgeRow,
  LibraryRows,
  NoteRow,
  TravelJournalRow,
} from "./repository";

/**
 * The library, read on the server.
 *
 * Five tables, eight shelves, one shape. Nothing here copies a record: a
 * journal entry on the journal shelf *is* the row in `journal_entries`, and the
 * only thing this file does is agree on how to read it. That is the whole
 * design — publishing a journal entry puts it on a shelf, and there is nothing
 * to keep in step.
 *
 * Wrapped in React's `cache` because a page needs the library in its layout,
 * again in `generateMetadata` and again in the body, and would otherwise pay
 * for five queries three times inside one request.
 *
 * There is no sample shelf. The portfolio ships one because a public library
 * with nothing on it is a broken demonstration; this library is one person's
 * own writing, and inventing entries for it would be inventing a past. An empty
 * shelf says it is empty and points at where to write the first thing.
 */

export const loadLibrary = cache(async (userId: string): Promise<LibraryEntry[]> => {
  let rows: LibraryRows;

  try {
    rows = await readLibraryRows(userId);
  } catch (error) {
    console.error(
      "[library] unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }

  const chaptersByBook = new Map<string, ChapterRow[]>();
  for (const chapter of rows.chapters) {
    const list = chaptersByBook.get(chapter.bookId);
    if (list) list.push(chapter);
    else chaptersByBook.set(chapter.bookId, [chapter]);
  }

  const entries: LibraryEntry[] = [
    ...rows.journal.map(fromJournal),
    ...rows.books.map((book) => fromBook(book, chaptersByBook.get(book.id) ?? [])),
    ...rows.travel.map(fromTravelJournal),
    ...rows.knowledge.map(fromKnowledge),
    ...rows.notes.map(fromNote),
  ];

  /* Slugs only have to be unique within a shelf, and two entries on the same
     shelf can genuinely share a title — "Monday", twice. The first keeps the
     clean slug; the rest take a short id suffix, so every entry has a URL and
     none of them shadows another. */
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      continue;
    }
    entry.slug = `${entry.slug}-${entry.id.replace(/-/g, "").slice(0, 6)}`;
    seen.add(`${entry.kind}:${entry.slug}`);
  }

  return entries.sort(byNewest);
});

/** Everything on one shelf, newest first. */
export async function loadShelf(userId: string, kind: LibraryKind): Promise<LibraryEntry[]> {
  const library = await loadLibrary(userId);
  return library.filter((entry) => entry.kind === kind);
}

export async function loadEntry(
  userId: string,
  kind: LibraryKind,
  slug: string,
): Promise<LibraryEntry | undefined> {
  const library = await loadLibrary(userId);
  return library.find((entry) => entry.kind === kind && entry.slug === slug);
}

/* ── Adapters ────────────────────────────────────────────────────────────── */

/**
 * Derives the two counted fields rather than trusting a stored copy.
 *
 * `books.word_count` exists, but it is maintained by the editor and an entry
 * saved by any path that forgot to recompute would advertise the old number
 * forever. Word count and reading time are functions of the prose, so they are
 * computed from the prose.
 */
function measured(entry: Omit<LibraryEntry, "wordCount" | "readingMinutes">): LibraryEntry {
  const wordCount = countWords(entryProse(entry));
  return { ...entry, wordCount, readingMinutes: readingMinutes(wordCount) };
}

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function fromJournal(row: JournalRow): LibraryEntry {
  return measured({
    id: row.id,
    kind: "journal",
    title: row.title,
    slug: slugify(row.title) || row.id.slice(0, 8),
    /* A journal entry has no separate summary field, so its opening line
       stands in — which is what a description is for, and better than an
       empty one. */
    description: firstLine(row.content ?? ""),
    content: row.content ?? "",
    chapters: [],
    tags: row.tags ?? [],
    status: "PUBLISHED",
    publishedAt: iso(row.eventDate) ?? iso(row.createdAt),
    updatedAt: iso(row.updatedAt) ?? "",
    featured: row.isPinned,
    source: "journal",
    meta: {
      mood: row.mood ?? undefined,
    },
  });
}

/**
 * A book, its chapters, and which of the three long-form shelves it stands on.
 *
 * `book_type` decides when it is set. When it is not — which is the common case
 * for a book started in the Creator Studio — the entry goes to Books. Guessing
 * from word count was the alternative and it is worse: a book on its first
 * chapter is a book someone is *writing*, not a short book, and filing it as
 * one would move it off its shelf again the week it got long.
 */
function fromBook(row: BookRow, chapters: ChapterRow[]): LibraryEntry {
  const kind = bookKind(row.bookType);

  return measured({
    id: row.id,
    kind,
    title: row.title,
    slug: slugify(row.title) || row.id.slice(0, 8),
    description: row.description ?? row.subtitle ?? "",
    content: "",
    chapters: chapters
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((chapter, index) => ({
        title: chapter.title,
        slug: slugify(chapter.title) || `chapter-${index + 1}`,
        content: proseMirrorToMarkdown(chapter.content),
        order: chapter.order ?? index,
      })),
    coverImage: image(row.coverUrl) ?? image(row.bannerUrl),
    category: row.genre ?? undefined,
    tags: [...(row.tags ?? []), ...(row.keywords ?? [])],
    status: row.status === "published" ? "PUBLISHED" : row.status === "archived" ? "ARCHIVED" : "DRAFT",
    publishedAt: iso(row.publishAt) ?? iso(row.createdAt),
    updatedAt: iso(row.updatedAt) ?? "",
    featured: false,
    source: "book",
    meta: {
      genre: row.genre ?? undefined,
      synopsis: row.description ?? undefined,
      writingProgress: row.status === "published" ? "published" : "writing",
      /* Only meaningful against a target the author actually set. A completion
         bar with an invented denominator is a bar that means nothing. */
      completion: completionOf(row),
    },
  });
}

function bookKind(bookType: string | null): LibraryKind {
  switch ((bookType ?? "").toLowerCase().replace(/[\s_]/g, "-")) {
    case "story":
    case "short-story":
      return "story";
    case "short-book":
    case "novella":
      return "short-book";
    default:
      return "book";
  }
}

function completionOf(row: BookRow): number | undefined {
  if (row.targetWordCount && row.targetWordCount > 0) {
    return Math.min(100, Math.round((row.wordCount / row.targetWordCount) * 100));
  }
  if (row.targetChapterCount && row.targetChapterCount > 0) {
    return Math.min(100, Math.round((row.chapterCount / row.targetChapterCount) * 100));
  }
  return undefined;
}

/**
 * A travel journal is a travel tale that has not been typeset yet.
 *
 * Its content is the body; the favourite moment, what it taught, what to do
 * again, the food and the people are five things the journal already carries,
 * and they become sections rather than being dropped or flattened into the
 * prose. This is the same record Explore Mode reads as an expedition's story —
 * one piece of writing, two doors.
 */
function fromTravelJournal(row: TravelJournalRow): LibraryEntry {
  const sections: string[] = [];
  if (row.content) sections.push(row.content);
  if (row.story) sections.push(row.story);
  if (row.favoriteMoment) sections.push(`## The moment\n\n${row.favoriteMoment}`);
  if (row.lessonsLearned) sections.push(`## What it taught me\n\n${row.lessonsLearned}`);
  if (row.foodTried) sections.push(`## What I ate\n\n${row.foodTried}`);
  if (row.peopleMet) sections.push(`## Who I met\n\n${row.peopleMet}`);
  if (row.wouldDoAgain) sections.push(`## If you go\n\n${row.wouldDoAgain}`);

  return measured({
    id: row.id,
    kind: "travel",
    title: row.title,
    slug: slugify(row.title) || row.id.slice(0, 8),
    description: firstLine(row.content ?? row.story ?? ""),
    content: sections.join("\n\n"),
    chapters: [],
    coverImage: image(row.coverImage),
    category: "Travel",
    tags: [],
    status: "PUBLISHED",
    publishedAt: iso(row.date) ?? iso(row.createdAt),
    updatedAt: iso(row.updatedAt) ?? "",
    featured: false,
    source: "travel",
    meta: {
      location: row.location ?? undefined,
      mood: row.mood ? row.mood.replace(/_/g, " ") : undefined,
      highlights: row.favoriteMoment ? [row.favoriteMoment] : [],
    },
  });
}

/**
 * A knowledge entry read as an article.
 *
 * Its parts already have the shape of a written-up piece — a summary, notes,
 * takeaways, worked examples, sources — so they become the article's sections
 * in that order. The subject becomes the category, which is what makes the
 * Articles shelf filterable by topic on day one.
 */
function fromKnowledge(row: KnowledgeRow): LibraryEntry {
  const sections: string[] = [];
  if (row.detailedNotes) sections.push(row.detailedNotes);
  if (row.keyTakeaways) sections.push(`## Key takeaways\n\n${row.keyTakeaways}`);
  if (row.examples) sections.push(`## Examples\n\n${row.examples}`);
  if (row.nextActions) sections.push(`## What next\n\n${row.nextActions}`);
  if (row.resources) sections.push(`## Sources\n\n${row.resources}`);

  return measured({
    id: row.id,
    kind: "article",
    title: row.title,
    slug: slugify(row.title) || row.id.slice(0, 8),
    description: row.summary ?? firstLine(row.detailedNotes ?? ""),
    content: sections.join("\n\n"),
    chapters: [],
    category: row.subject,
    tags: [...(row.tags ?? []), ...(row.subcategory ? [row.subcategory] : [])],
    status: "PUBLISHED",
    publishedAt: iso(row.dateLearned) ?? iso(row.createdAt),
    updatedAt: iso(row.updatedAt) ?? "",
    featured: false,
    source: "knowledge",
    meta: {
      series: row.subcategory ?? undefined,
    },
  });
}

/**
 * A note, on the Ideas board — or on Blogs when it says so.
 *
 * `category` is the note's own field and the author is the only one who sets
 * it, so a note filed under "blog" is a blog post and the library takes them at
 * their word rather than second-guessing with a heuristic.
 */
function fromNote(row: NoteRow): LibraryEntry {
  const category = (row.category ?? "").toLowerCase();
  const kind: LibraryKind = category === "blog" || category === "blogs" ? "blog" : "idea";

  return measured({
    id: row.id,
    kind,
    title: row.title,
    slug: slugify(row.title) || row.id.slice(0, 8),
    description: row.excerpt ?? firstLine(row.content ?? ""),
    content: row.content ?? "",
    chapters: [],
    coverImage: image(row.coverImage),
    category: kind === "idea" ? (row.category ?? undefined) : undefined,
    tags: row.tags ?? [],
    status: row.status === "published" ? "PUBLISHED" : "DRAFT",
    publishedAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt) ?? "",
    featured: row.isPinned,
    source: "note",
    meta: {},
  });
}

/* ── Small helpers ───────────────────────────────────────────────────────── */

/**
 * Whether a stored value can be shown as an image.
 *
 * Cover fields are typed by hand, and a value that is not a reference at all
 * resolves as a *relative path*, asks this app for it, gets a page back, and
 * paints a broken frame.
 */
function image(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return /^(https?:\/\/|\/|data:image\/)/.test(value.trim()) ? value : undefined;
}

/** The opening sentence, for a record that carries no summary of its own. */
function firstLine(text: string, limit = 180): string {
  const line = text.split("\n").find((candidate) => candidate.trim());
  if (!line) return "";
  const trimmed = line.trim();
  return trimmed.length > limit ? `${trimmed.slice(0, limit).trimEnd()}…` : trimmed;
}
