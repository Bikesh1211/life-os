"use client";

import { useState } from "react";
import { Anchor, Collapse, Paper, SegmentedControl, Text } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import {
  CONTEXTS,
  type AmbientEffects,
  type BackgroundIntensity,
  type ContextMode,
  type MotionPreference,
} from "@/core/themes/contexts";
import { useContextTheme } from "@/core/themes/contexts/use-context-theme";

/**
 * Settings → Cinematic Experience.
 *
 * Four controls and a list. The controls run from the broadest decision to the
 * narrowest — whether contexts apply at all, how present they are, whether
 * anything drifts, and whether anything moves — so the first one a reader meets
 * is the one that matters most.
 *
 * The list is there because "every area has its own atmosphere" is a claim, and
 * a claim you cannot check is marketing. Folded away by default so the settings
 * page does not grow by thirty rows.
 */

const MODES: { value: ContextMode; label: string; note: string }[] = [
  {
    value: "full",
    label: "Full",
    note: "Every feature becomes its own room — its own ground, surfaces, ink and light, with a band naming it. Tasks is a mission dossier, Journal is a gothic night, Finance is a trading floor.",
  },
  {
    value: "tint",
    label: "Tint",
    note: "One application, coloured per area. Your movie theme keeps the palette; each feature contributes only its accent and a faint texture.",
  },
  {
    value: "off",
    label: "Off",
    note: "No contextual colour and no background textures anywhere.",
  },
];

const INTENSITIES: { value: BackgroundIntensity; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "balanced", label: "Balanced" },
  { value: "cinematic", label: "Cinematic" },
];

export function CinematicSection() {
  const { mode, intensity, ambient, motion, setMode, setIntensity, setAmbient, setMotion } =
    useContextTheme();
  const [listOpen, setListOpen] = useState(false);

  const active = MODES.find((entry) => entry.value === mode) ?? MODES[0];
  const off = mode === "off";

  return (
    <Paper withBorder p="lg" radius="md">
      <Text fw={500} mb="sm">
        Cinematic Experience
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Every area of Life OS can become its own cinematic environment, the way the Library is a
        wizarding reading room. The layout, the spacing and the typography never change — what
        changes is the ground you are standing on.
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
          ? "Turn contextual environments on to use background textures."
          : "Textures are drawn entirely in CSS — no images, nothing to download — and sit behind the interface. Phones step down automatically."}
      </Text>

      {/* ── Ambient effects ───────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
        <Text size="sm" fw={500} c={off ? "dimmed" : undefined}>
          Ambient effects
        </Text>
        <SegmentedControl
          size="xs"
          value={ambient}
          onChange={(value) => setAmbient(value as AmbientEffects)}
          aria-label="Ambient effects"
          disabled={off}
          data={[
            { value: "subtle", label: "Subtle" },
            { value: "off", label: "Off" },
          ]}
        />
      </div>
      <Text size="xs" c="dimmed" mt={6} lh={1.45}>
        The drifting dust in the air of a scene. Everything else in an environment is still.
      </Text>

      {/* ── Motion ────────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
        <Text size="sm" fw={500}>
          Motion
        </Text>
        <SegmentedControl
          size="xs"
          value={motion}
          onChange={(value) => setMotion(value as MotionPreference)}
          aria-label="Motion"
          data={[
            { value: "system", label: "System" },
            { value: "full", label: "Full" },
            { value: "reduced", label: "Reduced" },
          ]}
        />
      </div>
      <Text size="xs" c="dimmed" mt={6} lh={1.45}>
        {motion === "system"
          ? "Following your system's reduce-motion setting."
          : motion === "reduced"
            ? "Ambient motion is stopped here regardless of your system setting."
            : "Ambient motion plays here even if your system asks to reduce motion."}
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
                  style={{ background: context.palette.accent }}
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
            The Library and Explore Mode are absent on purpose — both are already complete
            environments, and they are the benchmark these thirty-one were built to match.
          </Text>
        </Collapse>
      </div>
    </Paper>
  );
}
