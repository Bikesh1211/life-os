"use client";

import { cn } from "@/core/utils";

/**
 * A theme, at the size of a favicon.
 *
 * Four bands rather than a miniature interface: the page, the chrome, a card
 * and the accent. At 44×28 a sidebar-and-cards mock is illegible — it becomes
 * noise pretending to be information — so this shows the four colours a reader
 * is actually choosing between and nothing else.
 *
 * It still carries `data-movie-theme` and `data-theme-depth`, so the grain and
 * the gilt edge are the real ones from the generated stylesheet rather than an
 * imitation. A theme cannot be edited without its sample following.
 *
 * `aria-hidden`: the row's text names the theme and its mood is described in
 * words, so there is nothing here for a screen reader to lose.
 */
export function ThemeSample({ themeId, className }: { themeId: string; className?: string }) {
  const isDefault = themeId === "default";

  /* The "no theme" sample has no theme block above it, so it reads the
     application's live variables — which is the honest way to show "off". */
  const v = (token: string, fallback: string) => `var(${isDefault ? fallback : token})`;

  return (
    <span
      {...(isDefault ? {} : { "data-movie-theme": themeId, "data-theme-depth": "full" })}
      data-theme-preview={isDefault ? undefined : "page"}
      aria-hidden="true"
      className={cn(
        "flex h-7 w-11 shrink-0 items-stretch gap-px overflow-hidden rounded-md border",
        className,
      )}
      style={{
        background: v("--lo-background", "--mantine-color-body"),
        borderColor: v("--lo-border", "--border-subtle"),
      }}
    >
      {/* The chrome. */}
      <span
        data-theme-preview={isDefault ? undefined : "chrome"}
        className="w-[30%]"
        style={{ background: v("--lo-surface", "--surface-card") }}
      />

      {/* A card, and the accent on it. */}
      <span className="flex flex-1 flex-col justify-center gap-[3px] px-[3px]">
        <span
          className="h-[4px] w-full rounded-[1px]"
          style={{ background: v("--lo-surface-elevated", "--surface-muted") }}
        />
        <span
          className="h-[4px] w-[62%] rounded-[1px]"
          style={{ background: v("--lo-accent", "--mantine-primary-color-filled") }}
        />
      </span>
    </span>
  );
}
