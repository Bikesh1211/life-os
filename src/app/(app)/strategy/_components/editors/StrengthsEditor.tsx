"use client";

import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Strength", type: "text" as const },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "examples", label: "Examples", type: "textarea" as const },
  { key: "strategy", label: "How to Use It More Effectively", type: "textarea" as const },
];

export function StrengthsEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Strengths</Title>
      <EditableList
        sectionType="strengths"
        initial={initial}
        fields={fields}
        emptyMessage="No strengths listed yet."
        addLabel="Add Strength"
      />
    </Stack>
  );
}
