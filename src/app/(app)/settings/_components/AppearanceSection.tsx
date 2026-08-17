"use client";

import { Paper, SegmentedControl, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { MOVIE_THEMES, type ThemeDepth, type ThemeId } from "@/core/themes";
import { useMovieTheme } from "@/core/themes/use-movie-theme";
import { ThemeSample } from "./ThemeSample";

/**
 * Settings → Appearance → Movie Themes.
 *
 * A list, not a gallery. Eleven bordered cards each carrying a mock interface
 * and a sentence of description turned one settings section into most of the
 * page — so this is a row per theme: the sample, the name, a tick. Everything a
 * reader needs in order to choose, and nothing they have to read past.
 *
 * A radiogroup rather than a row of buttons, because that is what this is: one
 * choice among eleven, exactly one active. Arrow keys move between rows, Space
 * and Enter select, and the tab order contains one stop for the whole group.
 */

interface Choice {
  id: ThemeId;
  name: string;
  subtitle: string;
  mood: string;
}

/* "No theme" leads, because a reader looking at this list for the first time is
   currently on it — and because a preference you cannot leave is a trap. */
const CHOICES: Choice[] = [
  { id: "default", name: "Life OS", subtitle: "Default", mood: "The application's own colours" },
  ...MOVIE_THEMES.map((theme) => ({
    id: theme.id,
    name: theme.name,
    subtitle: theme.subtitle,
    mood: theme.mood,
  })),
];

export function AppearanceSection() {
  const { themeId, depth, setTheme, setDepth } = useMovieTheme();
  const themed = themeId !== "default";

  /* Roving focus: arrow keys move the selection, which for a radiogroup is the
     documented behaviour — moving focus without selecting would leave the
     highlighted row and the applied theme disagreeing. */
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;

    if (step === 0) return;
    event.preventDefault();

    const next = CHOICES[(index + step + CHOICES.length) % CHOICES.length];
    setTheme(next.id);
    document.getElementById(`theme-${next.id}`)?.focus();
  }

  return (
    <Paper withBorder p="lg" radius="md">
      <Text fw={500} mb="sm">
        Movie Themes
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Give your workspace a cinematic atmosphere without distracting from your work. Layout,
        spacing and typography never change — only the palette, the surfaces and the light.
      </Text>

      {/* Two columns from `sm` up: eleven rows in a single column is a long
          scroll for a section that is not the point of this page. */}
      <div
        role="radiogroup"
        aria-label="Movie theme"
        className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-x-4"
      >
        {CHOICES.map((choice, index) => {
          const selected = themeId === choice.id;

          return (
            <button
              key={choice.id}
              id={`theme-${choice.id}`}
              type="button"
              role="radio"
              aria-checked={selected}
              // One tab stop for the group; arrows move within it.
              tabIndex={selected ? 0 : -1}
              onClick={() => setTheme(choice.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-[var(--mantine-primary-color-filled)] focus-visible:outline-none",
                selected
                  ? "bg-[var(--mantine-primary-color-light)]"
                  : "hover:bg-[var(--surface-muted)]",
              )}
            >
              <ThemeSample themeId={choice.id} />

              <span className="min-w-0 flex-1 truncate">
                <Text size="sm" fw={selected ? 600 : 400} span>
                  {choice.name}
                </Text>
                <Text size="xs" c="dimmed" span ml={6}>
                  {choice.subtitle}
                </Text>
              </span>

              {/* The selected state is a tick, not a colour — so it survives
                  being looked at by someone who cannot tell this row's tint
                  from its neighbour's. */}
              <IconCheck
                size={15}
                stroke={2.5}
                className={cn(
                  "shrink-0 transition-opacity",
                  selected ? "text-[var(--mantine-primary-color-filled)]" : "opacity-0",
                )}
              />

              <span className="sr-only">
                {choice.name}, {choice.subtitle}. {choice.mood}.{" "}
                {selected ? "Selected." : "Not selected."}
              </span>
            </button>
          );
        })}
      </div>

      {/*
        The second control, and it only appears once there is a theme for it to
        act on. Offering "Full atmosphere" while Life OS's own palette is
        selected would be a switch with nothing on the other side of it.
      */}
      {themed && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <div className="min-w-0">
            <Text size="sm" fw={500}>
              Atmosphere
            </Text>
            <Text size="xs" c="dimmed" lh={1.45}>
              {depth === "full"
                ? "Paper grain, a light source, and gilt edges on cards — the Library's own treatment, across the application."
                : "Colour only. No texture, no washes, no card treatment."}
            </Text>
          </div>

          <SegmentedControl
            size="xs"
            value={depth}
            onChange={(value) => setDepth(value as ThemeDepth)}
            aria-label="Theme atmosphere"
            data={[
              { value: "palette", label: "Colour only" },
              { value: "full", label: "Full" },
            ]}
          />
        </div>
      )}
    </Paper>
  );
}
