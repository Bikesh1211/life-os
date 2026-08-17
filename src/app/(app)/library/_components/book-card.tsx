"use client";

import Link from "next/link";
import { IconArrowRight, IconClock } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { useReader } from "./reader";
import { entryDate, type LibraryEntry } from "@/modules/library";
import { entryHref, shelfFor } from "@/modules/library";
import { BookmarkButton } from "./bookmark-button";
import styles from "./library.module.css";

/**
 * A volume on the shelf.
 *
 * It is a card with a spine, not a 3D book: the brief asks for elegant books
 * that stay fast, and a grid of twenty elements with `perspective` and
 * `rotateY` is the fastest way to lose that. The bookishness is carried by the
 * gilt spine down the left edge, the ribbon on anything the reader has started,
 * and a 3px lift on hover.
 *
 * The whole card is one link — the title carries it via a stretched overlay, so
 * there is a single tab stop and a single accessible name — with the bookmark
 * control lifted above it so it stays independently clickable.
 */
export function BookCard({
  entry,
  className,
  compact = false,
}: {
  entry: LibraryEntry;
  className?: string;
  /** Short-books and rails use the tighter card. */
  compact?: boolean;
}) {
  const { positionOf, ready } = useReader();
  const shelf = shelfFor(entry.kind);
  const position = ready ? positionOf(entry) : undefined;
  const started = position && position.percent > 0;

  const date = entryDate(entry);
  const Icon = shelf.icon;

  return (
    <article
      className={cn(
        styles.lift,
        styles.spine,
        "group relative flex flex-col rounded-md border border-[var(--lb-border)] bg-[var(--lb-card)]/70 pl-5",
        compact ? "p-4 pl-6" : "p-5 pl-7",
        className,
      )}
    >
      {started && <span className={styles.ribbon} aria-hidden="true" />}

      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-[var(--lb-primary)]" />
        <span className="lb-caption text-[var(--lb-muted)]">{shelf.title}</span>
      </div>

      <h3
        className={cn("font-semibold text-balance", compact ? "text-base" : "text-lg sm:text-xl")}
      >
        <Link href={entryHref(entry)} className="after:absolute after:inset-0">
          {entry.title}
        </Link>
      </h3>

      {entry.description && (
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-[var(--lb-muted)]",
            compact ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {entry.description}
        </p>
      )}

      {/* Author line. Named on every card because a library of one author still
          has to say whose library it is. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--lb-muted)]">
        {date && (
          <time dateTime={date}>
            {new Date(date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        )}
        <span className="flex items-center gap-1">
          <IconClock size={12} className="" />
          {entry.readingMinutes} min
        </span>
        {entry.chapters.length > 0 && (
          <span>
            {entry.chapters.length} {entry.chapters.length === 1 ? "chapter" : "chapters"}
          </span>
        )}
        {entry.meta.writingProgress && entry.meta.writingProgress !== "published" && (
          <span className="rounded-sm bg-[var(--lb-card)] px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
            {entry.meta.writingProgress}
          </span>
        )}
      </div>

      {/* Reading position, once there is one. */}
      {started && (
        <div className="mt-3 flex items-center gap-2">
          <div className="bg-border h-0.5 flex-1 overflow-hidden rounded-full">
            <div
              className="h-full origin-left rounded-full bg-[var(--lb-primary)]"
              style={{ transform: `scaleX(${position!.percent / 100})`, width: "100%" }}
            />
          </div>
          <span className="text-[10px] text-[var(--lb-muted)] tabular-nums">
            {position!.completed ? "Finished" : `${position!.percent}%`}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--lb-border)]/60 pt-3">
        <span
          className={cn(
            styles.reveal,
            "lb-caption flex items-center gap-1.5 text-[var(--lb-primary)]",
          )}
        >
          {started && !position!.completed ? "Continue" : "Open book"}
          <IconArrowRight size={12} className="" />
        </span>

        {/* Above the stretched link so it stays its own control. */}
        <span className="relative z-10">
          <BookmarkButton entry={entry} title={entry.title} variant="icon" />
        </span>
      </div>
    </article>
  );
}
