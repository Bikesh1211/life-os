"use client";

import { Stack, Title, Select } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Rule", type: "text" as const },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: [
      { value: "decision", label: "Decision" },
      { value: "behavior", label: "Behavior" },
      { value: "boundary", label: "Boundary" },
      { value: "ritual", label: "Ritual" },
    ],
  },
  { key: "examples", label: "Examples", type: "textarea" as const },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export function RulesEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Rules</Title>
      <EditableList
        sectionType="rules"
        initial={initial}
        fields={fields}
        emptyMessage="No rules yet. Add your first rule."
        addLabel="Add Rule"
      />
    </Stack>
  );
}
