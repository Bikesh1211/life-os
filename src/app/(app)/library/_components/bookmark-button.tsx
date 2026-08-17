"use client";

import { IconBookmark } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { useReader } from "./reader";
import type { LibraryKind } from "@/modules/library";

/**
 * Save an entry to Favourites.
 *
 * Rendered inert until the stored state has landed: the server has no idea what
 * this reader has saved, so drawing an empty bookmark and then filling it in is
 * both a hydration mismatch and a small lie. The button is still in the HTML
 * and still focusable — only its *state* waits.
 */
export function BookmarkButton({
  entry,
  title,
  variant = "button",
  className,
}: {
  entry: { kind: LibraryKind; slug: string };
  /** Named in the accessible label, so a list of these is not "Save, Save, Save". */
  title: string;
  variant?: "button" | "icon";
  className?: string;
}) {
  const { isBookmarked, toggleBookmark, ready } = useReader();
  const saved = ready && isBookmarked(entry);

  const label = saved ? `Remove “${title}” from favourites` : `Save “${title}” to favourites`;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => toggleBookmark(entry)}
        aria-pressed={ready ? saved : undefined}
        title={label}
        className={cn(
          "rounded-sm p-1.5 transition-colors",
          saved ? "text-[var(--lb-primary)]" : "text-[var(--lb-muted)] hover:text-[var(--lb-fg)]",
          className,
        )}
      >
        <IconBookmark size={16} className={cn(saved && "fill-current")} />
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(entry)}
      aria-pressed={ready ? saved : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        saved
          ? "border-[var(--lb-primary)]/60 bg-[var(--lb-primary)]/10 text-[var(--lb-primary)]"
          : "border-[var(--lb-border)] text-[var(--lb-muted)] hover:border-[var(--lb-primary)]/40 hover:text-[var(--lb-fg)]",
        className,
      )}
    >
      <IconBookmark size={14} className={cn(saved && "fill-current")} />
      {saved ? "Saved" : "Save"}
      <span className="sr-only">{label}</span>
    </button>
  );
}
