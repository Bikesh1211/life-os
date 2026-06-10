"use client";

import { useMemo } from "react";
import { Stack, Title, Text, Paper, Group, Badge } from "@mantine/core";
import Link from "next/link";
import type { KnowledgeEntry } from "@/modules/knowledge";

type Props = {
  entries: KnowledgeEntry[];
};

export function KnowledgeTimeline({ entries }: Props) {
  const grouped = useMemo(() => {
    const groups: Record<string, KnowledgeEntry[]> = {};
    for (const entry of entries) {
      const key = new Date(entry.dateLearned).toISOString().split("T")[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  const [weekEntries, monthEntries, olderEntries] = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const week: typeof grouped = [];
    const month: typeof grouped = [];
    const older: typeof grouped = [];

    for (const [date] of grouped) {
      const d = new Date(date);
      if (d >= weekAgo) week.push([date, []]);
      else if (d >= monthAgo) month.push([date, []]);
      else older.push([date, []]);
    }

    return [week.length, month.length, older.length];
  }, [grouped]);

  const now = new Date();

  return (
    <Stack gap="lg">
      <Title order={2}>Knowledge Timeline</Title>

      <Group gap="lg">
        <Paper withBorder p="sm" radius="md">
          <Text size="xs" c="dimmed">This Week</Text>
          <Text fw={700}>{grouped.filter(([d]) => new Date(d) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length} days</Text>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Text size="xs" c="dimmed">This Month</Text>
          <Text fw={700}>{grouped.filter(([d]) => new Date(d) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).length} days</Text>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Text size="xs" c="dimmed">Total Days</Text>
          <Text fw={700}>{grouped.length}</Text>
        </Paper>
      </Group>

      {grouped.map(([date, dayEntries]) => (
        <div key={date}>
          <Text fw={600} size="sm" c="dimmed" mb="xs">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Stack gap={4}>
            {dayEntries.map((entry) => (
              <Paper
                key={entry.id}
                component={Link}
                href={`/knowledge/${entry.id}`}
                p="sm"
                withBorder
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge size="sm" variant="light">
                      {entry.subject}
                    </Badge>
                    <Text size="sm">{entry.title}</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge size="sm" color="gray" variant="outline">
                      M:{entry.masteryLevel}/10
                    </Badge>
                    <Badge size="sm" color="gray" variant="outline">
                      C:{entry.confidenceScore}/10
                    </Badge>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      ))}
      {grouped.length === 0 && (
        <Text c="dimmed" py="xl" ta="center">
          No entries yet. Start capturing what you learn!
        </Text>
      )}
    </Stack>
  );
}
