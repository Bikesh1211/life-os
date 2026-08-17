"use client";

import { useMemo, useState } from "react";
import { IconFilter, IconX } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import {
  applyFilters,
  categoriesIn,
  tagsIn,
  yearsIn,
  type LibraryEntry,
  type LibraryFilters,
  type LibraryKind,
} from "@/modules/library";
import { SHELVES } from "@/modules/library";
import { BookCard } from "./book-card";

/**
 * The browsing surface: a filter row and a grid.
 *
 * Filters are client state rather than query parameters, deliberately. The
 * brief is explicit that clean routes carry primary navigation and query
 * parameters do not — a shelf is a route, and narrowing that shelf by tag is a
 * *view* of it rather than a place. Nothing here is linkable, and nothing here
 * needs to be: the addressable things are the shelves and the entries, and both
 * have their own URL.
 *
 * Pagination is a "show more" button rather than an infinite scroll. An archive
 * has a footer, and infinite scroll is the pattern that makes a footer
 * unreachable.
 */
const PAGE = 12;

export function ShelfBrowser({
  entries,
  /** Offer the shelf filter — on the "everything" view, not a single shelf. */
  showKinds = false,
  emptyMessage,
}: {
  entries: LibraryEntry[];
  showKinds?: boolean;
  emptyMessage: string;
}) {
  const [filters, setFilters] = useState<LibraryFilters>({ kind: "all" });
  const [shown, setShown] = useState(PAGE);

  const years = useMemo(() => yearsIn(entries), [entries]);
  const tags = useMemo(() => tagsIn(entries, 14), [entries]);
  const categories = useMemo(() => categoriesIn(entries), [entries]);

  const kinds = useMemo(
    () => SHELVES.filter((shelf) => entries.some((entry) => entry.kind === shelf.kind)),
    [entries],
  );

  const filtered = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const visible = filtered.slice(0, shown);

  const active =
    (filters.kind && filters.kind !== "all") || filters.year || filters.tag || filters.category;

  function update(patch: Partial<LibraryFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShown(PAGE);
  }

  return (
    <div>
      <div className="mb-8 space-y-4">
        {showKinds && kinds.length > 1 && (
          <FilterRow label="Shelf">
            <Chip
              active={!filters.kind || filters.kind === "all"}
              onClick={() => update({ kind: "all" })}
            >
              All
            </Chip>
            {kinds.map((shelf) => (
              <Chip
                key={shelf.kind}
                active={filters.kind === shelf.kind}
                onClick={() => update({ kind: shelf.kind as LibraryKind })}
              >
                {shelf.title}
              </Chip>
            ))}
          </FilterRow>
        )}

        {years.length > 1 && (
          <FilterRow label="Year">
            <Chip active={!filters.year} onClick={() => update({ year: undefined })}>
              Any
            </Chip>
            {years.map((year) => (
              <Chip
                key={year}
                active={filters.year === year}
                onClick={() => update({ year: filters.year === year ? undefined : year })}
              >
                {year}
              </Chip>
            ))}
          </FilterRow>
        )}

        {categories.length > 1 && (
          <FilterRow label="Topic">
            <Chip active={!filters.category} onClick={() => update({ category: undefined })}>
              Any
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category}
                active={filters.category === category}
                onClick={() =>
                  update({ category: filters.category === category ? undefined : category })
                }
              >
                {category}
              </Chip>
            ))}
          </FilterRow>
        )}

        {tags.length > 1 && (
          <FilterRow label="Tag">
            <Chip active={!filters.tag} onClick={() => update({ tag: undefined })}>
              Any
            </Chip>
            {tags.map((tag) => (
              <Chip
                key={tag}
                active={filters.tag === tag}
                onClick={() => update({ tag: filters.tag === tag ? undefined : tag })}
              >
                {tag}
              </Chip>
            ))}
          </FilterRow>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--lb-border)]/60 pt-4">
          <p
            className="lb-caption flex items-center gap-2 text-[var(--lb-muted)]"
            aria-live="polite"
          >
            <IconFilter size={12} className="" aria-hidden="true" />
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>

          {active && (
            <button
              type="button"
              onClick={() => {
                setFilters({ kind: "all" });
                setShown(PAGE);
              }}
              className="flex items-center gap-1.5 text-xs text-[var(--lb-primary)] transition-opacity hover:opacity-80"
            >
              <IconX size={12} className="" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {visible.length > 0 ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((entry) => (
              <li key={`${entry.kind}:${entry.slug}`}>
                <BookCard entry={entry} className="h-full" />
              </li>
            ))}
          </ul>

          {filtered.length > visible.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShown((current) => current + PAGE)}
                className="rounded-md border border-[var(--lb-border)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--lb-primary)]/50 hover:text-[var(--lb-primary)]"
              >
                Show more
                <span className="ml-2 text-[var(--lb-muted)] tabular-nums">
                  {filtered.length - visible.length}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-md border border-dashed border-[var(--lb-border)] px-6 py-16 text-center text-sm text-[var(--lb-muted)] italic">
          {active ? "Nothing on this shelf matches those filters." : emptyMessage}
        </p>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <span className="lb-caption w-14 shrink-0 text-[var(--lb-muted)]">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-[var(--lb-primary)] bg-[var(--lb-primary)]/10 font-medium text-[var(--lb-primary)]"
          : "border-[var(--lb-border)] text-[var(--lb-muted)] hover:border-[var(--lb-primary)]/40 hover:text-[var(--lb-fg)]",
      )}
    >
      {children}
    </button>
  );
}
