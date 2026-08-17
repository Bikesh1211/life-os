"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { searchLibrary, type LibraryIndexEntry } from "@/modules/library";
import { entryHref, shelfFor } from "@/modules/library";
import styles from "./library.module.css";

/**
 * Consulting the archives.
 *
 * The index is the entries already in memory — see `searchLibrary` for why this
 * is a substring search and not a ranking engine. What matters here is the
 * *presentation*: every result says which shelf it came from, because "The
 * Result" in a mixed archive is meaningless without knowing whether it is a
 * book or a journal entry.
 *
 * Built as a plain positioned dialog rather than a `<dialog>` or a Radix modal
 * so it can stay light; focus is moved into the field on open, returned on
 * close, and Escape and an outside click both dismiss it.
 */
export function SearchPanel({
  library,
  open,
  onOpenChange,
}: {
  library: LibraryIndexEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const hits = useMemo(() => searchLibrary(query, library), [query, library]);
  const searching = query.trim().length >= 2;

  /* Opening only touches the DOM — remembering what had focus and moving it
     into the field. Clearing the query belongs to `close()` below, in the
     handlers that actually dismiss the panel, rather than to an effect: state
     set synchronously from an effect body is a cascading render, and every
     path out of here is an event anyway. */
  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setQuery("");
    onOpenChange(false);
    returnFocusTo.current?.focus();
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-[#04060E]/70 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="IconSearch the library"
        className={cn(
          styles.panel,
          styles.gilt,
          "relative w-full max-w-2xl overflow-hidden rounded-lg shadow-2xl",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--lb-border)] px-4">
          <IconSearch size={16} className="shrink-0 text-[var(--lb-primary)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="IconSearch the library…"
            aria-label="IconSearch the library"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--lb-muted)]"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-sm p-1.5 text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-fg)]"
          >
            <IconX size={16} className="" />
            <span className="sr-only">Close search</span>
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {!searching && (
            <p className="px-4 py-8 text-center text-sm text-[var(--lb-muted)] italic">
              Books, stories, articles, blogs, journal entries, travel tales and ideas — all of it
              at once.
            </p>
          )}

          {searching && hits.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--lb-muted)]">
              <span className="block italic">Consulting the archives…</span>
              <span className="mt-2 block">Nothing here matches &ldquo;{query.trim()}&rdquo;.</span>
            </p>
          )}

          {searching && hits.length > 0 && (
            <>
              <p className="lb-caption px-4 pt-4 pb-2 text-[var(--lb-muted)]" aria-live="polite">
                {hits.length} {hits.length === 1 ? "result" : "results"}
              </p>
              <ul className="pb-2">
                {hits.map(({ entry, excerpt }) => {
                  const shelf = shelfFor(entry.kind);
                  const Icon = shelf.icon;

                  return (
                    <li key={`${entry.kind}:${entry.slug}`}>
                      <Link
                        href={entryHref(entry)}
                        onClick={close}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--lb-card)]/60"
                      >
                        <Icon
                          className="mt-0.5 size-4 shrink-0 text-[var(--lb-primary)]"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="lb-caption block text-[var(--lb-muted)]">
                            {shelf.title}
                          </span>
                          <span className="mt-0.5 block font-medium">{entry.title}</span>
                          <span className="mt-1 line-clamp-2 block text-sm text-[var(--lb-muted)]">
                            {excerpt ?? entry.description}
                          </span>
                        </span>
                        <span className="shrink-0 self-center text-xs text-[var(--lb-muted)]">
                          {entry.readingMinutes} min
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
