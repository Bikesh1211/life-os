"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Title, Group, Button, TextInput, Select, Paper, Text, SimpleGrid } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { EntryCard } from "./components/EntryCard";
import { StreakCounter } from "./components/StreakCounter";
import { computeStreak } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type JournalContentProps = {
  entries: JournalEntry[];
  streak: number;
};

export function JournalContent({ entries, streak }: JournalContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q));
    }
    if (moodFilter) {
      result = result.filter((e) => e.mood === moodFilter);
    }
    return result;
  }, [entries, search, moodFilter]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Journal</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => router.push("/journal/new")}>
          New Entry
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <StreakCounter streak={streak} />
        <Paper withBorder p="sm">
          <Text size="sm" fw={500}>
            Total Entries
          </Text>
          <Text size="xl" fw={700}>
            {entries.length}
          </Text>
        </Paper>
        <Paper withBorder p="sm">
          <Text size="sm" fw={500}>
            This Month
          </Text>
          <Text size="xl" fw={700}>
            {entries.filter((e) => {
              const d = new Date(e.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </Text>
        </Paper>
      </SimpleGrid>

      <Group gap="sm">
        <TextInput
          placeholder="Search entries..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="flex-1"
        />
        <Select
          placeholder="Filter by mood"
          data={["happy", "sad", "neutral", "anxious", "stressed", "motivated", "excited"]}
          value={moodFilter}
          onChange={setMoodFilter}
          clearable
          className="w-40"
        />
      </Group>

      {filtered.length === 0 ? (
        <Paper withBorder p="xl" className="text-center">
          <Text c="dimmed">
            {search || moodFilter ? "No entries match your filters." : "No journal entries yet. Start writing!"}
          </Text>
        </Paper>
      ) : (
        <Stack gap="xs">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
