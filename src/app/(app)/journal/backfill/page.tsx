"use client";

import { Stack, Title, Text, Group } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import { JournalEditor } from "../components/JournalEditor";

export default function BackfillEntryPage() {
  return (
    <Stack gap="md">
      <Group gap="sm">
        <IconHistory size={24} className="text-gray-500" />
        <div>
          <Title order={2}>Backfill Entry</Title>
          <Text size="sm" c="dimmed">
            Write about a past date
          </Text>
        </div>
      </Group>
      <JournalEditor />
    </Stack>
  );
}
