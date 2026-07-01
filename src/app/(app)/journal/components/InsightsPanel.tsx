"use client";

import { useMemo } from "react";
import { Paper, SimpleGrid, Stack, Text, Group, ThemeIcon, Button } from "@mantine/core";
import {
  IconChartBar,
  IconFlame,
  IconCalendarEvent,
  IconMoodSmile,
  IconTag,
  IconPin,
  IconPlus,
} from "@tabler/icons-react";
import type { JournalEntry } from "@/modules/journal";
import { getMoodEmoji } from "@/modules/journal/utils";
import dayjs from "dayjs";

type Props = {
  entries: JournalEntry[];
  streak: number;
  onCreateClick: () => void;
};

type StatCard = {
  label: string;
  value: string | number;
  icon: typeof IconChartBar;
  color: string;
};

export function InsightsPanel({ entries, streak, onCreateClick }: Props) {
  const stats = useMemo<StatCard[]>(() => {
    const total = entries.length;
    const pinned = entries.filter((e) => e.isPinned).length;

    const thisMonth = entries.filter((e) => {
      const d = new Date(e.eventDate ?? e.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const moodCounts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
      }
    }
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    const tagCounts: Record<string, number> = {};
    for (const entry of entries) {
      for (const tag of entry.tags ?? []) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];

    return [
      { label: "Total Entries", value: total, icon: IconChartBar, color: "blue" },
      { label: "Current Streak", value: streak, icon: IconFlame, color: "orange" },
      { label: "This Month", value: thisMonth, icon: IconCalendarEvent, color: "cyan" },
      { label: "Pinned", value: pinned, icon: IconPin, color: "yellow" },
      {
        label: "Common Mood",
        value: topMood ? `${getMoodEmoji(topMood[0])} ${topMood[0]}` : "None",
        icon: IconMoodSmile,
        color: "pink",
      },
      {
        label: "Common Tag",
        value: topTag ? `${topTag[0]} (${topTag[1]})` : "None",
        icon: IconTag,
        color: "violet",
      },
    ];
  }, [entries, streak]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <IconChartBar size={48} stroke={1.5} className="mb-4 opacity-40" />
        <Text size="sm" mb={4}>
          No data to analyze yet. Write your first entry!
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={onCreateClick} size="sm">
          New Entry
        </Button>
      </div>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
      {stats.map((card) => (
        <Paper key={card.label} p="md" radius="md">
          <Group gap="sm" mb={4}>
            <ThemeIcon variant="light" size="md" color={card.color}>
              <card.icon size={18} />
            </ThemeIcon>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase">
              {card.label}
            </Text>
          </Group>
          <Text fw={700} size="28px" className="tabular-nums">
            {card.value}
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
