"use client";

import { Stack, Title } from "@mantine/core";
import { EditableList } from "./EditableList";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "title", label: "Title", type: "text" as const },
  { key: "content", label: "Notes", type: "textarea" as const },
];

export function ReflectionNotesEditor({ initial }: Props) {
  return (
    <Stack gap="md">
      <Title order={3}>Reflection Notes</Title>
      <EditableList
        sectionType="reflection_notes"
        initial={initial}
        fields={fields}
        emptyMessage="No reflection notes yet."
        addLabel="Add Note"
      />
    </Stack>
  );
}
