"use client";

import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Activity", type: "text" as const },
  { key: "description", label: "Description", type: "textarea" as const },
  {
    key: "impact",
    label: "Impact",
    type: "select" as const,
    options: [
      { value: "booster", label: "Energy Booster" },
      { value: "drain", label: "Energy Drain" },
    ],
  },
  { key: "rating", label: "Rating (1-10)", type: "number" as const },
  { key: "frequency", label: "Frequency", type: "text" as const },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export function EnergyPatternsEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Energy Patterns</Title>
      <EditableList
        sectionType="energy_patterns"
        initial={initial}
        fields={fields}
        emptyMessage="No energy patterns yet."
        addLabel="Add Pattern"
      />
    </Stack>
  );
}
