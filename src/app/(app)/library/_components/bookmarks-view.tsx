"use client";

import Link from "next/link";
import { IconBookmark, IconCheck, IconTrash } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { entryKey, type LibraryIndexEntry } from "@/modules/library";
import { entryHref, shelfFor } from "@/modules/library";
import { useReader } from "./reader";
import styles from "./library.module.css";

/**
 * Favourites, and everything the library remembers about this reader.
 *
 * The page says out loud that all of it is stored on this device. There are no
 * accounts on this site (see `state/reader.tsx`), so a saved shelf that quietly
 * looked like an account would be making a promise the architecture cannot
 * keep — a reader who saves twelve pieces here and opens the site on their
 * phone should have been told why the shelf is empty.
 */
export function BookmarksView({ index }: { index: LibraryIndexEntry[] }) {
  const { bookmarks, progress, ready, toggleBookmark, clearAll } = useReader();

  const byKey = new Map(index.map((entry) => [entryKey(entry), entry]));

  const saved = bookmarks.flatMap((key) => {
    const entry = byKey.get(key);
    return entry ? [entry] : [];
  });

  const finished = Object.entries(progress)
    .filter(([, position]) => position.completed)
    .flatMap(([key]) => {
      const entry = byKey.get(key);
      return entry ? [entry] : [];
    });

  if (!ready) {
    // The saved shelf is per-device, so the server cannot render it. A skeleton
    // rather than a wrong answer.
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="h-20 animate-pulse rounded-md border border-[var(--lb-border)] bg-[var(--lb-card)]/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <section aria-labelledby="saved">
        <h2 id="saved" className="lb-caption mb-4 flex items-center gap-2 text-[var(--lb-muted)]">
          <IconBookmark size={14} className="text-[var(--lb-primary)]" aria-hidden="true" />
          Saved — {saved.length}
        </h2>

        {saved.length > 0 ? (
          <ul className="divide-border/70 divide-y border-y border-[var(--lb-border)]/70">
            {saved.map((entry) => {
              const shelf = shelfFor(entry.kind);
              const Icon = shelf.icon;

              return (
                <li key={entryKey(entry)} className="flex items-center gap-4 py-4">
                  <Icon className="size-4 shrink-0 text-[var(--lb-primary)]" aria-hidden="true" />

                  <div className="min-w-0 flex-1">
                    <p className="lb-caption text-[var(--lb-muted)]">{shelf.title}</p>
                    <Link
                      href={entryHref(entry)}
                      className="font-medium transition-colors hover:text-[var(--lb-primary)]"
                    >
                      {entry.title}
                    </Link>
                  </div>

                  <span className="hidden shrink-0 text-xs text-[var(--lb-muted)] sm:block">
                    {entry.readingMinutes} min
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(entry)}
                    className="shrink-0 rounded-sm p-1.5 text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-candle)]"
                  >
                    <IconTrash size={16} className="" />
                    <span className="sr-only">Remove “{entry.title}” from favourites</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p
            className={cn(
              styles.paper,
              "rounded-md border border-dashed border-[var(--lb-border)] px-6 py-12 text-center text-sm text-[var(--lb-muted)] italic",
            )}
          >
            Nothing saved yet. The bookmark on any piece puts it here.
          </p>
        )}
      </section>

      {finished.length > 0 && (
        <section aria-labelledby="finished">
          <h2
            id="finished"
            className="lb-caption mb-4 flex items-center gap-2 text-[var(--lb-muted)]"
          >
            <IconCheck size={14} className="text-[var(--lb-primary)]" aria-hidden="true" />
            Finished — {finished.length}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {finished.map((entry) => (
              <li key={entryKey(entry)}>
                <Link
                  href={entryHref(entry)}
                  className="rounded-full border border-[var(--lb-border)] px-3 py-1 text-xs text-[var(--lb-muted)] transition-colors hover:border-[var(--lb-primary)]/40 hover:text-[var(--lb-fg)]"
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-[var(--lb-border)] pt-6">
        <p className="text-sm text-[var(--lb-muted)]">
          Favourites and reading positions are stored in this browser, on this device. There are no
          accounts here, so they do not follow you to another one — and clearing this site&rsquo;s
          data clears them.
        </p>
        {(saved.length > 0 || Object.keys(progress).length > 0) && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-md border border-[var(--lb-border)] px-3 py-2 text-xs text-[var(--lb-muted)] transition-colors hover:border-[var(--lb-candle)]/50 hover:text-[var(--lb-candle)]"
          >
            Forget everything on this device
          </button>
        )}
      </section>
    </div>
  );
}
