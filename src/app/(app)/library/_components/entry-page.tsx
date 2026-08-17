import Link from "next/link";
import {
  IconArrowLeft,
  IconBookmarks,
  IconCalendar,
  IconClock,
  IconCompass,
  IconMapPin,
  IconMoon,
  IconTag,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { entryDate, relatedEntries, type LibraryEntry } from "@/modules/library";
import { parseMarkdown, tableOfContents } from "@/modules/library";
import { readHref, shelfFor, shelfHref } from "@/modules/library";
import { Prose } from "./prose";
import { TableOfContents } from "./table-of-contents";
import { ReadingProgress } from "./reading-progress";
import { BookmarkButton } from "./bookmark-button";
import { RelatedReading } from "./related-reading";
import { ChapterList } from "./chapter-list";
import styles from "./library.module.css";

const ARTICLE_ID = "library-article";

/** Shelves whose first paragraph opens with an illuminated capital. */
const NARRATIVE = new Set(["journal", "story", "travel", "short-book", "book"]);

/**
 * The reading page.
 *
 * One component for eight shelves, branching in exactly two places: chaptered
 * entries show a contents page and hand off to reading mode rather than
 * printing a whole book on one screen, and travel chapters get a route chart.
 * Everything else — the header, the facts, the measure, the progress, the
 * related reading — is identical by design, because the reason a reader came
 * here is the same on every shelf.
 */
export function EntryPage({ entry, library }: { entry: LibraryEntry; library: LibraryEntry[] }) {
  const shelf = shelfFor(entry.kind);
  const blocks = parseMarkdown(entry.content);
  const toc = tableOfContents(blocks);
  const related = relatedEntries(entry, library);
  const chaptered = entry.chapters.length > 0;
  const date = entryDate(entry);

  return (
    <div className="pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="lb-narrow pt-10 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href={shelfHref(shelf)}
            className="lb-caption inline-flex items-center gap-1.5 text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-primary)]"
          >
            <IconArrowLeft size={12} className="" />
            {shelf.title}
          </Link>
        </nav>

        <p className="lb-caption mb-4 text-[var(--lb-primary)]">{shelf.title}</p>

        <h1 className="lb-h2 text-balance">{entry.title}</h1>

        {entry.description && (
          <p className="lb-body-lg mt-6 max-w-2xl text-balance">{entry.description}</p>
        )}

        <EntryFacts entry={entry} />

        <div className={cn(styles.rule, "mt-8")} role="separator" />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {chaptered ? (
            <Link
              href={readHref(entry)}
              className={cn(
                styles.glow,
                "inline-flex items-center gap-2 rounded-md bg-[var(--lb-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90",
              )}
            >
              <IconBookmarks size={16} className="" />
              Begin reading
            </Link>
          ) : (
            <a
              href={`#${ARTICLE_ID}`}
              className={cn(
                styles.glow,
                "inline-flex items-center gap-2 rounded-md bg-[var(--lb-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90",
              )}
            >
              <IconBookmarks size={16} className="" />
              Begin reading
            </a>
          )}

          <BookmarkButton entry={entry} title={entry.title} className="py-2.5" />
        </div>
      </header>

      {entry.coverImage && (
        <div className="lb-narrow mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
              URL of unknown origin; `next/image` needs each host declared in
              `remotePatterns` before the page will render at all. */}
          <img
            src={entry.coverImage}
            alt=""
            className="aspect-[2/1] w-full rounded-md border border-[var(--lb-border)] object-cover"
          />
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {chaptered ? (
        <div className="lb-narrow mt-12">
          {entry.meta.synopsis && (
            <section className="mb-10">
              <h2 className="lb-caption mb-3 text-[var(--lb-muted)]">Synopsis</h2>
              <p className="lb-body text-balance">{entry.meta.synopsis}</p>
            </section>
          )}

          <ChapterList entry={entry} />

          {/* A chaptered entry may still carry front matter — a preface, a note
              on the text — and it belongs here, before the contents are opened. */}
          {entry.content.trim() && (
            <div id={ARTICLE_ID} className="mt-14">
              <Prose markdown={entry.content} dropCap={NARRATIVE.has(entry.kind)} />
            </div>
          )}
        </div>
      ) : (
        <div className="lb-container mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
          <div className="mx-auto w-full max-w-2xl lg:mx-0">
            {/* The reading bar. Sticks under the header and the library rail. */}
            <div className="sticky top-[6.5rem] z-30 -mx-4 mb-8 border-y border-[var(--lb-border)]/60 bg-[var(--lb-bg)]/85 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:rounded-md sm:border sm:px-4">
              <ReadingProgress
                entry={entry}
                articleId={ARTICLE_ID}
                readingMinutes={entry.readingMinutes}
              />
            </div>

            <article id={ARTICLE_ID}>
              <Prose markdown={entry.content} dropCap={NARRATIVE.has(entry.kind)} />
            </article>

            {entry.meta.highlights &&
              entry.meta.highlights.length > 0 &&
              entry.kind !== "travel" && (
                <section className="mt-12">
                  <h2 className="lb-caption mb-4 text-[var(--lb-muted)]">Highlights</h2>
                  <ul className="space-y-2">
                    {entry.meta.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-sm">
                        <IconCompass
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--lb-primary)]"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            <EntryFooter entry={entry} date={date} />
          </div>

          {/* Contents. Sticky on desktop only — on a phone it would be a wall
              between the reader and the first paragraph. */}
          <aside className="hidden lg:block">
            <div className="sticky top-[7.5rem]">
              <TableOfContents items={toc} />
            </div>
          </aside>
        </div>
      )}

      <div className="lb-narrow">
        <RelatedReading entries={related} />
      </div>
    </div>
  );
}

/* ── Facts ───────────────────────────────────────────────────────────────── */

/**
 * The metadata band. Every shelf shows date, reading time and length; the rest
 * appears only when the entry actually carries it, which is what keeps a
 * journal entry from advertising an empty "Genre".
 */
function EntryFacts({ entry }: { entry: LibraryEntry }) {
  const date = entryDate(entry);
  const { meta } = entry;

  return (
    <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--lb-muted)]">
      {date && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Published</dt>
          <IconCalendar size={14} className="" aria-hidden="true" />
          <dd>
            <time dateTime={date}>
              {new Date(date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </dd>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <dt className="sr-only">Reading time</dt>
        <IconClock size={14} className="" aria-hidden="true" />
        <dd>{entry.readingMinutes} min read (estimated)</dd>
      </div>

      <div className="flex items-center gap-1.5">
        <dt className="sr-only">Length</dt>
        <dd className="tabular-nums">{entry.wordCount.toLocaleString("en-GB")} words</dd>
      </div>

      {entry.category && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Category</dt>
          <dd className="rounded-sm bg-[var(--lb-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--lb-primary)]">
            {entry.category}
          </dd>
        </div>
      )}

      {meta.mood && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Mood</dt>
          <IconMoon size={14} className="" aria-hidden="true" />
          <dd className="italic">{meta.mood}</dd>
        </div>
      )}

      {meta.location && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Location</dt>
          <IconMapPin size={14} className="" aria-hidden="true" />
          <dd>{meta.location}</dd>
        </div>
      )}

      {meta.genre && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Genre</dt>
          <dd className="italic">{meta.genre}</dd>
        </div>
      )}

      {typeof meta.distanceKm === "number" && (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Distance</dt>
          <dd className="tabular-nums">{meta.distanceKm} km</dd>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex w-full items-center gap-2">
          <dt className="sr-only">Tags</dt>
          <dd className="flex flex-wrap items-center gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-sm bg-[var(--lb-card)] px-2 py-0.5 text-xs"
              >
                <IconTag size={10} className="" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}

/** The colophon at the end of a piece. */
function EntryFooter({ entry, date }: { entry: LibraryEntry; date: string }) {
  return (
    <footer className="mt-16 border-t border-[var(--lb-border)] pt-6">
      <div className={cn(styles.rule, "mb-6")} role="separator" />
      <p className="text-sm text-[var(--lb-muted)]">
        <span className="italic">{entry.title}</span>
        {date && (
          <>, {new Date(date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</>
        )}
        .
      </p>
      <div className="mt-4">
        <BookmarkButton entry={entry} title={entry.title} />
      </div>
    </footer>
  );
}
