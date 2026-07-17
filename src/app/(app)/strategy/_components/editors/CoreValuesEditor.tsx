"use client";

import { useState } from "react";
import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "name", label: "Value Name", type: "text" as const },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "whyMatters", label: "Why It Matters", type: "textarea" as const },
  { key: "examples", label: "Real-Life Examples", type: "textarea" as const },
];

export function CoreValuesEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Core Values</Title>
      <EditableList
        sectionType="core_values"
        initial={initial}
        fields={fields}
        emptyMessage="No values yet. Add your first core value."
        addLabel="Add Value"
      />
    </Stack>
  );
}
