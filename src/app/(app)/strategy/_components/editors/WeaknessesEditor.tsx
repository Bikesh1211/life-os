"use client";

import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Weakness", type: "text" as const },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "triggers", label: "Triggers", type: "textarea" as const },
  { key: "improvementStrategy", label: "Improvement Strategy", type: "textarea" as const },
];

export function WeaknessesEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Weaknesses</Title>
      <EditableList
        sectionType="weaknesses"
        initial={initial}
        fields={fields}
        emptyMessage="No weaknesses listed yet."
        addLabel="Add Weakness"
      />
    </Stack>
  );
}
