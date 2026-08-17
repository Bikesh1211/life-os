"use client";

import { useState } from "react";
import { Anchor, Collapse, Group, Stack, Text } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconCompass } from "@tabler/icons-react";

/**
 * The fields Explore Mode reads, offered where the records are actually
 * entered.
 *
 * They live behind a disclosure rather than in the main body of each modal, and
 * that is the point: none of them is required to plan a trip or log a place.
 * A record entered without any of them is still complete — it simply prints
 * fewer figures in the archive and does not appear on the map. Putting eight
 * optional inputs above "Create Trip" would make the ordinary path feel like a
 * form to be completed.
 *
 * The option lists are the enums the database and the zod schemas already
 * agree on, written once here so a fourth spelling of "moderate" cannot enter
 * through a dropdown.
 */

export const CATEGORY_OPTIONS = [
  { value: "mountains", label: "Mountains" },
  { value: "adventure", label: "Adventure" },
  { value: "beach", label: "Beach" },
  { value: "spiritual", label: "Spiritual" },
  { value: "city", label: "City" },
  { value: "historical", label: "Historical" },
  { value: "nature", label: "Nature" },
  { value: "food", label: "Food" },
];

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "extreme", label: "Extreme" },
];

export const PLANNING_STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "researching", label: "Researching" },
  { value: "ready", label: "Ready to go" },
];

export function ExploreFieldset({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Stack gap="xs">
      <Anchor
        component="button"
        type="button"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        style={{ alignSelf: "flex-start" }}
      >
        <Group gap={6} wrap="nowrap">
          {open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          <IconCompass size={14} />
          <span>Explore Mode fields</span>
        </Group>
      </Anchor>

      <Collapse in={open}>
        <Stack gap="sm">
          {hint && (
            <Text size="xs" c="dimmed">
              {hint}
            </Text>
          )}
          {children}
        </Stack>
      </Collapse>
    </Stack>
  );
}

/**
 * Turns a text input into a number for the API, or `undefined` when the field
 * was left alone.
 *
 * `undefined` rather than `null` or `0`: an untouched distance field means "not
 * recorded", and the archive prints nothing for that. Sending `0` would put
 * "0 km" on the dossier, which is a claim nobody made.
 */
export function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
