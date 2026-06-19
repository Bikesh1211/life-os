"use client";

import { useEffect, useState } from "react";
import { Stack, Text, Paper, Badge, Group, Loader, Center } from "@mantine/core";
import type { FeedbackEntry } from "../repository";

const categoryColors: Record<string, string> = {
  bug: "red",
  feature: "blue",
  idea: "violet",
  complaint: "orange",
  praise: "teal",
  general: "gray",
};

function formatDate(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FeedbackList() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center p="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (entries.length === 0) {
    return (
      <Paper withBorder p="lg" radius="md">
        <Text size="sm" c="dimmed" ta="center">
          No feedback submitted yet.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {entries.map((entry) => (
        <Paper key={entry.id} withBorder p="sm" radius="md">
          <Group gap="xs" mb={4}>
            <Badge size="sm" color={categoryColors[entry.category] ?? "gray"} variant="light" tt="capitalize">
              {entry.category}
            </Badge>
            <Text size="xs" c="dimmed">{formatDate(entry.createdAt)}</Text>
          </Group>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {entry.message.length > 200 ? `${entry.message.slice(0, 200)}...` : entry.message}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}
