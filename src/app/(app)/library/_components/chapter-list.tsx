"use client";

import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { countWords, readingMinutes, type LibraryEntry } from "@/modules/library";
import { readHref } from "@/modules/library";
import { useReader } from "./reader";
import styles from "./library.module.css";

/**
 * The contents page of a chaptered entry.
 *
 * Each chapter is its own destination in reading mode (`?chapter=`), so a
 * reader can be linked straight to chapter nine — and the chapter they stopped
 * in is marked, which is the whole reason the reading position stores a chapter
 * slug rather than only a percentage.
 */
export function ChapterList({ entry }: { entry: LibraryEntry }) {
  const { positionOf, ready } = useReader();
  const position = ready ? positionOf(entry) : undefined;

  if (entry.chapters.length === 0) return null;

  const totalWords = entry.chapters.reduce((sum, chapter) => sum + countWords(chapter.content), 0);
  const completion = entry.meta.completion;

  return (
    <section aria-labelledby="chapters">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 id="chapters" className="lb-caption text-[var(--lb-muted)]">
          Contents
        </h2>
        <p className="text-xs text-[var(--lb-muted)]">
          {entry.chapters.length} {entry.chapters.length === 1 ? "chapter" : "chapters"} ·{" "}
          {readingMinutes(totalWords)} min
        </p>
      </div>

      {/* Writing progress, when the entry is unfinished and says so. */}
      {typeof completion === "number" && completion < 100 && (
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-border h-1 flex-1 overflow-hidden rounded-full">
            <div
              className="h-full origin-left rounded-full bg-[var(--lb-primary)]/70"
              style={{ transform: `scaleX(${completion / 100})`, width: "100%" }}
            />
          </div>
          <span className="lb-caption text-[var(--lb-muted)]">{completion}% written</span>
        </div>
      )}

      <ol className="divide-border/70 divide-y border-y border-[var(--lb-border)]/70">
        {entry.chapters.map((chapter, index) => {
          const here = position?.chapter === chapter.slug;
          const minutes = readingMinutes(countWords(chapter.content));

          return (
            <li key={chapter.slug}>
              <Link
                href={`${readHref(entry)}?chapter=${chapter.slug}`}
                className={cn(
                  styles.lift,
                  "group flex items-center gap-4 px-1 py-4 transition-colors hover:bg-[var(--lb-card)]/40",
                )}
              >
                <span className="font-mono text-xs text-[var(--lb-muted)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{chapter.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--lb-muted)]">
                    {minutes} min
                    {here && " · you stopped here"}
                  </span>
                </span>

                {here ? (
                  <IconCheck
                    size={16}
                    className="shrink-0 text-[var(--lb-primary)]"
                    aria-hidden="true"
                  />
                ) : (
                  <IconArrowRight
                    size={16}
                    className="shrink-0 text-[var(--lb-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--lb-primary)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
