"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconMapPin, IconScript, IconSearch, IconTent, IconX } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { searchArchive } from "@/modules/travel/explore";
import type { ArchiveHitKind, ArchiveIndex } from "@/modules/travel/explore";
import styles from "./explore.module.css";

const KIND_ICON: Record<ArchiveHitKind, TablerIcon> = {
  place: IconMapPin,
  expedition: IconTent,
  story: IconScript,
};

const KIND_LABEL: Record<ArchiveHitKind, string> = {
  place: "Place",
  expedition: "Expedition",
  story: "Story",
};

/**
 * SEARCH THE EXPEDITION ARCHIVE.
 *
 * One field across the three things the archive holds. Every result names its
 * kind, because a single name is legitimately a place, an expedition *and* a
 * story — a result list that does not say which is which is three identical
 * rows.
 *
 * A plain positioned dialog rather than a `<dialog>` or a modal library, so it
 * stays light: focus moves into the field on open and returns on close, and
 * Escape or an outside click dismisses it.
 */
export function ArchiveSearch({
  index,
  open,
  onOpenChange,
}: {
  index: ArchiveIndex;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const hits = useMemo(() => searchArchive(query, index), [query, index]);
  const searching = query.trim().length >= 2;

  /* Opening only touches the DOM. Clearing the query belongs to `close()`, in
     the handlers that actually dismiss the panel: state set synchronously from
     an effect body is a cascading render, and every path out of here is an
     event anyway. */
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
        className="absolute inset-0 bg-[var(--xp-void)]/70 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the expedition archive"
        className={cn(styles.panel, "relative w-full max-w-2xl overflow-hidden rounded-md shadow-2xl")}
      >
        <div className="flex items-center gap-3 border-b border-[var(--xp-border)] px-4">
          <IconSearch size={16} className="shrink-0 text-[var(--xp-primary)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the expedition archive…"
            aria-label="Search the expedition archive"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--xp-muted)]"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-sm p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]"
          >
            <IconX size={16} />
            <span className="sr-only">Close search</span>
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {!searching && (
            <p className="px-4 py-8 text-center text-sm text-[var(--xp-muted)] italic">
              Places, expeditions and the stories brought back from them.
            </p>
          )}

          {searching && hits.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--xp-muted)]">
              Nothing in the archive matches &ldquo;{query.trim()}&rdquo;.
            </p>
          )}

          {searching && hits.length > 0 && (
            <>
              <p className="xp-label px-4 pt-4 pb-2 text-[var(--xp-muted)]" aria-live="polite">
                {hits.length} {hits.length === 1 ? "result" : "results"}
              </p>
              <ul className="pb-2">
                {hits.map((hit) => {
                  const Icon = KIND_ICON[hit.kind];
                  return (
                    <li key={`${hit.kind}-${hit.href}`}>
                      <Link
                        href={hit.href}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--xp-primary)_8%,transparent)]"
                      >
                        <Icon size={16} className="shrink-0 text-[var(--xp-primary)]" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="xp-label block text-[var(--xp-muted)]">
                            {KIND_LABEL[hit.kind]}
                          </span>
                          <span className="mt-0.5 block font-medium">{hit.title}</span>
                        </span>
                        <span className="shrink-0 text-xs text-[var(--xp-muted)]">{hit.subtitle}</span>
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
