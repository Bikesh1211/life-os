import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import type { LibraryEntry } from "@/modules/library";
import { shelfHref, type Shelf } from "@/modules/library";
import { BookCard } from "./book-card";
import styles from "./library.module.css";

/**
 * One shelf on the landing page: a numbered heading, a board, and the volumes
 * standing on it.
 *
 * On phones the row becomes a scroll-snapping rail rather than a stack — the
 * brief asks for swipeable books, and a horizontal rail is the one gesture that
 * makes a bookshelf legible on a narrow screen. From `sm` up it is a plain
 * grid, because a horizontal scroller on a wide screen hides content behind an
 * interaction nobody asked for.
 *
 * An empty shelf still renders. A room with an empty shelf in it is a room that
 * tells you what is coming; a room that hides its empty shelves is one where
 * you cannot tell what is missing.
 */
export function ShelfRail({
  shelf,
  entries,
  limit = 4,
}: {
  shelf: Shelf;
  entries: LibraryEntry[];
  limit?: number;
}) {
  const shown = entries.slice(0, limit);
  const Icon = shelf.icon;

  return (
    <section
      aria-labelledby={`shelf-${shelf.segment}`}
      className="scroll-mt-28"
      id={`shelf-${shelf.segment}`}
    >
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-[var(--lb-primary)]/70">{shelf.numeral}</span>
          <div>
            <h2
              id={`shelf-${shelf.segment}`}
              className="flex items-center gap-2 text-xl font-semibold tracking-[0.14em] uppercase sm:text-2xl"
            >
              <Icon className="size-4 text-[var(--lb-primary)]" aria-hidden="true" />
              {shelf.title}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--lb-muted)]">{shelf.blurb}</p>
          </div>
        </div>

        <Link
          href={shelfHref(shelf)}
          className="lb-caption flex shrink-0 items-center gap-1.5 text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-primary)]"
        >
          {entries.length > 0
            ? `All ${entries.length} ${entries.length === 1 ? shelf.noun : shelf.nounPlural}`
            : "Open shelf"}
          <IconArrowRight size={12} className="" />
        </Link>
      </header>

      {shown.length > 0 ? (
        <>
          <ul
            className={cn(
              "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
              "sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4",
            )}
          >
            {shown.map((entry) => (
              <li
                key={`${entry.kind}:${entry.slug}`}
                className="w-[78vw] max-w-xs shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                <BookCard entry={entry} className="h-full" compact />
              </li>
            ))}
          </ul>
          <div className={cn(styles.board, "mt-1")} aria-hidden="true" />
        </>
      ) : (
        <div
          className={cn(
            styles.paper,
            "rounded-md border border-dashed border-[var(--lb-border)] px-5 py-8 text-center",
          )}
        >
          <p className="text-sm text-[var(--lb-muted)] italic">{shelf.empty}</p>
        </div>
      )}
    </section>
  );
}
