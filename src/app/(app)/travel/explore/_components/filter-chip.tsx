"use client";

import { cn } from "@/core/utils";

/**
 * The archive's filter chrome — one labelled row of chips.
 *
 * Shared by the browsing surface, the timeline and the gallery rather than
 * written three times: all of them narrow the same archive, and a chip that
 * looks different on one page than the other reads as a different control.
 *
 * The rule that governs *when* to render one lives with the caller: a row only
 * appears when it would offer more than one choice, because a control with a
 * single option is furniture pretending to be a control.
 */
export function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <span className="xp-label w-16 shrink-0 xp-dim">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-[var(--xp-primary)] bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] font-medium text-[var(--xp-primary)]"
          : "border-[var(--xp-border)] text-[var(--xp-muted)] hover:border-[color-mix(in_oklab,var(--xp-primary)_40%,transparent)] hover:text-[var(--xp-fg)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
