"use client";

import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Principle", type: "text" as const },
  { key: "content", label: "Description", type: "textarea" as const },
  { key: "category", label: "Category", type: "text" as const },
];

export function LifePrinciplesEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Life Principles</Title>
      <EditableList
        sectionType="life_principles"
        initial={initial}
        fields={fields}
        emptyMessage="No principles yet. Add your first life principle."
        addLabel="Add Principle"
      />
    </Stack>
  );
}
