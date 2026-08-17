import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import type { LibraryEntry } from "@/modules/library";
import { entryHref, shelfFor } from "@/modules/library";
import styles from "./library.module.css";

/**
 * "You may also like", at the foot of every piece.
 *
 * Renders nothing when nothing scores — an archive this size will sometimes
 * have no honest neighbour for a piece, and three unrelated suggestions are
 * worse than none. See `relatedEntries` for how the score is worked out.
 */
export function RelatedReading({ entries }: { entries: LibraryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="related" className="mt-20">
      <div className={cn(styles.rule, "mb-8")} role="separator" />

      <h2 id="related" className="mb-6 text-xl font-semibold tracking-[0.12em] uppercase">
        You may also like
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const shelf = shelfFor(entry.kind);
          const Icon = shelf.icon;

          return (
            <li key={`${entry.kind}:${entry.slug}`}>
              <Link
                href={entryHref(entry)}
                className={cn(
                  styles.lift,
                  "group flex h-full flex-col rounded-md border border-[var(--lb-border)] bg-[var(--lb-card)]/60 p-4",
                )}
              >
                <span className="mb-2 flex items-center gap-2">
                  <Icon className="size-3.5 text-[var(--lb-primary)]" aria-hidden="true" />
                  <span className="lb-caption text-[var(--lb-muted)]">{shelf.title}</span>
                </span>

                <span className="font-medium text-balance">{entry.title}</span>

                {entry.description && (
                  <span className="mt-2 line-clamp-2 text-sm text-[var(--lb-muted)]">
                    {entry.description}
                  </span>
                )}

                <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[var(--lb-primary)]">
                  {entry.readingMinutes} min
                  <IconArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
