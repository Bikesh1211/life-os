"use client";

import { Paper, Text, Group, Box } from "@mantine/core";
import { IconStar, IconPin, IconClock } from "@tabler/icons-react";
import { getMoodEmoji, formatDate, computeReadingTime } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type EntryCardProps = {
  entry: JournalEntry;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function EntryCard({ entry, isSelected, onSelect }: EntryCardProps) {
  const wordCount = (entry.content ?? "").split(/\s+/).filter(Boolean).length;
  const readingTime = computeReadingTime(entry.content ?? "");

  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      onClick={onSelect}
      className={`group cursor-pointer transition-all duration-200 hover:shadow-sm ${
        isSelected
          ? "border-blue-300 bg-blue-50/50 shadow-sm dark:border-blue-700 dark:bg-blue-900/10"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-[var(--mantine-color-dark-7)] dark:hover:border-gray-600"
      }`}
    >
      <Group gap="xs" mb={4} wrap="nowrap">
        {entry.isPinned && (
          <IconPin size={12} className="shrink-0 text-gray-400" />
        )}
        <Text size="sm" fw={600} lineClamp={1} className="flex-1">
          {entry.title}
        </Text>
        <Group gap={2} wrap="nowrap" className="shrink-0">
          {entry.mood && (
            <Text size="sm" className="opacity-70 group-hover:opacity-100 transition-opacity">
              {getMoodEmoji(entry.mood)}
            </Text>
          )}
        </Group>
      </Group>

      {entry.content && (
        <Text size="xs" c="dimmed" lineClamp={2} mb={8}>
          {entry.content}
        </Text>
      )}

      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {formatDate(new Date(entry.eventDate ?? entry.createdAt))}
          </Text>
          {wordCount > 0 && (
            <Text size="xs" c="dimmed" className="flex items-center gap-0.5">
              <IconClock size={10} />
              {readingTime} min
            </Text>
          )}
        </Group>

        <Group gap={4}>
          {entry.tags && entry.tags.length > 0 && (
            <Group gap={2}>
              {entry.tags.slice(0, 2).map((tag) => (
                <Box
                  key={tag}
                  className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  {tag}
                </Box>
              ))}
              {entry.tags.length > 2 && (
                <Text size="xs" c="dimmed">+{entry.tags.length - 2}</Text>
              )}
            </Group>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
