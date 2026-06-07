"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Stack, Title, Text, Group } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import { JournalEditor } from "../components/JournalEditor";

export default function BackfillEntryPage() {
  const router = useRouter();

  const handleSave = useCallback(
    async (data: {
      title: string;
      content: string;
      mood?: string;
      tags?: string[];
      reflectionScore?: number;
      eventDate?: string;
    }) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      const entry = await res.json();
      router.replace(`/journal/${entry.id}`);
    },
    [router],
  );

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
      <JournalEditor onSave={handleSave} />
    </Stack>
  );
}
