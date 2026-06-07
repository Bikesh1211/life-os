"use client";

import { Paper, Text, Group, Box } from "@mantine/core";
import Link from "next/link";
import { getMoodEmoji, getMoodColor, formatDate } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type EntryCardProps = {
  entry: JournalEntry;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function EntryCard({ entry, isSelected, onSelect }: EntryCardProps) {
  return (
    <Paper
      component={Link}
      href={`/journal/${entry.id}`}
      onClick={onSelect}
      withBorder
      p="sm"
      className={`block cursor-pointer transition-all duration-150 ${
        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <Group gap="xs" mb={4}>
        {entry.mood && (
          <Text size="lg" role="img">
            {getMoodEmoji(entry.mood)}
          </Text>
        )}
        <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1 }}>
          {entry.title}
        </Text>
        <Text size="xs" c="dimmed">
          {formatDate(new Date(entry.createdAt))}
        </Text>
      </Group>

      {entry.content && (
        <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
          {entry.content}
        </Text>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <Group gap={4}>
          {entry.tags.slice(0, 3).map((tag) => (
            <Box
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {tag}
            </Box>
          ))}
          {entry.tags.length > 3 && (
            <Text size="xs" c="dimmed">
              +{entry.tags.length - 3}
            </Text>
          )}
        </Group>
      )}
    </Paper>
  );
}
