"use client";

import { useState } from "react";
import { Anchor, Collapse, Paper, SegmentedControl, Text } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { CONTEXTS, type BackgroundIntensity, type ContextMode } from "@/core/themes/contexts";
import { useContextTheme } from "@/core/themes/contexts/use-context-theme";

/**
 * Settings → Cinematic Experience.
 *
 * Two controls and a list. The controls are what a reader will actually touch;
 * the list is there because "every area has its own atmosphere" is a claim, and
 * a claim you cannot check is marketing. Folded away by default so the settings
 * page does not grow by thirty rows.
 */

const MODES: { value: ContextMode; label: string; note: string }[] = [
  {
    value: "feature",
    label: "Feature",
    note: "Each area keeps its own accent and texture — the Library is wizarding, Finance is Wall Street, Timeline is spacetime.",
  },
  {
    value: "global",
    label: "Global",
    note: "One palette everywhere, from your movie theme. Only the background texture changes between areas.",
  },
  {
    value: "auto",
    label: "Automatic",
    note: "Feature-specific on a desktop, and stepped right down on phones and under reduced motion.",
  },
  {
    value: "off",
    label: "Off",
    note: "No contextual accents and no background textures anywhere.",
  },
];

const INTENSITIES: { value: BackgroundIntensity; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "balanced", label: "Balanced" },
  { value: "cinematic", label: "Cinematic" },
];

export function CinematicSection() {
  const { mode, intensity, setMode, setIntensity } = useContextTheme();
  const [listOpen, setListOpen] = useState(false);

  const active = MODES.find((entry) => entry.value === mode) ?? MODES[0];
  const off = mode === "off";

  return (
    <Paper withBorder p="lg" radius="md">
      <Text fw={500} mb="sm">
        Cinematic Experience
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Every area of Life OS can carry its own atmosphere — an accent and a texture drawn from
        the kind of story it belongs to. Everything else, from spacing to typography, stays the
        same everywhere.
      </Text>

      {/* ── Contextual themes ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text size="sm" fw={500}>
          Contextual themes
        </Text>
        <SegmentedControl
          size="xs"
          value={mode}
          onChange={(value) => setMode(value as ContextMode)}
          aria-label="Contextual themes"
          data={MODES.map(({ value, label }) => ({ value, label }))}
        />
      </div>
      <Text size="xs" c="dimmed" mt={6} lh={1.45}>
        {active.note}
      </Text>

      {/* ── Background intensity ──────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
        <Text size="sm" fw={500} c={off ? "dimmed" : undefined}>
          Background intensity
        </Text>
        <SegmentedControl
          size="xs"
          value={intensity}
          onChange={(value) => setIntensity(value as BackgroundIntensity)}
          aria-label="Background intensity"
          disabled={off}
          data={INTENSITIES}
        />
      </div>
      <Text size="xs" c="dimmed" mt={6} lh={1.45}>
        {off
          ? "Turn contextual themes on to use background textures."
          : "Textures are drawn in CSS and sit behind the interface at very low opacity — the strongest setting is still under a tenth. Phones step down automatically."}
      </Text>

      {/* ── The inventory ─────────────────────────────────────────────── */}
      <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={() => setListOpen((open) => !open)}
          aria-expanded={listOpen}
        >
          <span className="inline-flex items-center gap-1.5">
            {listOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            {listOpen ? "Hide" : "Show"} the {CONTEXTS.length} environments
          </span>
        </Anchor>

        <Collapse in={listOpen}>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {CONTEXTS.map((context) => (
              <li key={context.id} className="flex items-center gap-2.5 text-sm">
                {/* The accent, as the smallest possible sample. */}
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: context.accent }}
                />
                <span className="min-w-0 flex-1 truncate">
                  <Text size="sm" span>
                    {context.title}
                  </Text>
                  <Text size="xs" c="dimmed" span ml={6}>
                    {context.inspiration}
                  </Text>
                </span>
                <Text size="xs" c="dimmed" className="shrink-0 font-mono">
                  {context.match[0]}
                </Text>
              </li>
            ))}
          </ul>

          <Text size="xs" c="dimmed" mt="sm" lh={1.45}>
            The Library and Explore Mode are absent on purpose — both already have a full
            atmosphere of their own, and a context layered over either would be two of them
            competing.
          </Text>
        </Collapse>
      </div>
    </Paper>
  );
}
