"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import type { ExpeditionPhoto } from "@/modules/travel/explore";
import { FilterChip } from "./filter-chip";
import styles from "./explore.module.css";

/**
 * MEMORIES — the archive's photography.
 *
 * A CSS-columns masonry rather than a JS-measured one: the browser already
 * balances columns, and a layout that needs JavaScript to have a shape is a
 * layout that has no shape until hydration. The trade is that reading order
 * runs down each column instead of across, which for a gallery of undated
 * frames is not a meaningful loss.
 *
 * The viewer is a plain fixed overlay with real keyboard handling — arrows to
 * move, Escape to leave — and it restores focus to the thumbnail that opened
 * it, so a keyboard reader is not dropped at the top of the page.
 */
export function Gallery({ photos }: { photos: ExpeditionPhoto[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(photos.map((p) => p.category).filter((c): c is string => Boolean(c)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [photos]);

  const shown = useMemo(
    () => (filter === "all" ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter],
  );

  const close = useCallback(() => setOpenAt(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenAt((at) => (at === null ? null : (at + delta + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (openAt === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openAt, close, step]);

  useEffect(() => {
    if (openAt === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [openAt]);

  if (photos.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
        No photographs in the archive yet.
      </p>
    );
  }

  const active = openAt === null ? null : shown[openAt];

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={filter === category}
              onClick={() => setFilter(category)}
              className="capitalize"
            >
              {category}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {shown.map((photo, index) => (
          <button
            key={`${photo.src}-${index}`}
            type="button"
            onClick={() => setOpenAt(index)}
            className={cn(
              styles.frame,
              "block w-full overflow-hidden rounded-md border border-[var(--xp-border)] focus-visible:ring-2 focus-visible:ring-[var(--xp-primary)] focus-visible:outline-none",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
                URLs of unknown origin; `next/image` needs every host declared in
                `remotePatterns` before the page would render at all. */}
            <img
              src={photo.src}
              alt={photo.title ?? "Photograph from the archive"}
              loading="lazy"
              decoding="async"
              className="w-full object-cover"
            />
            <span className="sr-only">Open {photo.title ?? "photograph"}</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title ?? "Photograph"}
          className="fixed inset-0 z-[1200] flex flex-col bg-[var(--xp-void)]/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="xp-label text-white/60 tabular-nums">
              {openAt! + 1} / {shown.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-sm p-2 text-white/70 transition-colors hover:text-white"
            >
              <IconX size={20} />
              <span className="sr-only">Close viewer</span>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-12">
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 rounded-full p-2 text-white/60 transition-colors hover:text-white sm:left-4"
            >
              <IconChevronLeft size={24} />
              <span className="sr-only">Previous photograph</span>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
            <img
              key={active.src}
              src={active.src}
              alt={active.title ?? "Photograph from the archive"}
              className={cn(styles.shutter, "max-h-full max-w-full object-contain")}
            />

            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 rounded-full p-2 text-white/60 transition-colors hover:text-white sm:right-4"
            >
              <IconChevronRight size={24} />
              <span className="sr-only">Next photograph</span>
            </button>
          </div>

          {/* Metadata, when the record carries any. */}
          <div className="px-4 py-5 text-center sm:px-6">
            {active.title && <p className="text-lg text-white">{active.title}</p>}
            <p className="xp-label mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white/50">
              {active.location && <span>{active.location}</span>}
              {active.date && (
                <span>
                  {new Date(active.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {active.category && <span>{active.category}</span>}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
