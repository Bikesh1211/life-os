"use client";

import Link from "next/link";
import { IconArrowRight, IconBookmarks } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { entryKey, type LibraryIndexEntry } from "@/modules/library";
import { entryHref, readHref, shelfFor } from "@/modules/library";
import { useReader } from "./reader";
import styles from "./library.module.css";

/**
 * "Continue reading" — the shelf's memory of the reader.
 *
 * Renders nothing at all until the stored state has landed and something is
 * genuinely unfinished, so it never flashes an empty panel on a first visit.
 * The link goes back to the chapter the reader stopped in when there is one,
 * which is the payoff for storing a chapter slug rather than a bare
 * percentage.
 */
export function ContinueReading({
  index,
  limit = 3,
  className,
}: {
  index: LibraryIndexEntry[];
  limit?: number;
  className?: string;
}) {
  const { progress, ready } = useReader();

  if (!ready) return null;

  const byKey = new Map(index.map((entry) => [entryKey(entry), entry]));

  const unfinished = Object.entries(progress)
    .filter(([, position]) => !position.completed && position.percent > 0)
    .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
    // An entry can vanish from under a stored position — unpublished, renamed,
    // or read on a device that has since seen the archive change. `flatMap`
    // drops those without needing a type predicate to prove it.
    .flatMap(([key, position]) => {
      const entry = byKey.get(key);
      return entry ? [{ entry, position }] : [];
    })
    .slice(0, limit);

  if (unfinished.length === 0) return null;

  return (
    <section aria-labelledby="continue" id="continue" className={cn("scroll-mt-28", className)}>
      <h2 id="continue" className="lb-caption mb-4 flex items-center gap-2 text-[var(--lb-muted)]">
        <IconBookmarks size={14} className="text-[var(--lb-primary)]" aria-hidden="true" />
        Continue reading
      </h2>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {unfinished.map(({ entry, position }) => {
          const shelf = shelfFor(entry.kind);
          const href =
            position.chapter && shelf.chaptered
              ? `${readHref(entry)}?chapter=${position.chapter}`
              : entryHref(entry);

          return (
            <li key={entryKey(entry)}>
              <Link
                href={href}
                className={cn(
                  styles.lift,
                  styles.spine,
                  "group flex h-full flex-col rounded-md border border-[var(--lb-border)] bg-[var(--lb-card)]/70 p-4 pl-6",
                )}
              >
                <span className="lb-caption mb-1.5 text-[var(--lb-muted)]">{shelf.title}</span>
                <span className="font-medium text-balance">{entry.title}</span>

                <span className="mt-auto pt-4">
                  <span className="flex items-center gap-2">
                    <span className="bg-border h-0.5 flex-1 overflow-hidden rounded-full">
                      <span
                        className="block h-full origin-left rounded-full bg-[var(--lb-primary)]"
                        style={{ transform: `scaleX(${position.percent / 100})` }}
                      />
                    </span>
                    <span className="text-[10px] text-[var(--lb-muted)] tabular-nums">
                      {position.percent}%
                    </span>
                  </span>

                  <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--lb-primary)]">
                    Pick up where you left off
                    <IconArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
