"use client";

import { useMemo } from "react";
import { Modal, Stack, Text, Group, Paper, SimpleGrid, ScrollArea } from "@mantine/core";
import { IconX, IconBook, IconPencil, IconFlame, IconCalendarMonth } from "@tabler/icons-react";
import type { BookPage as BookPageType } from "./useBookData";
import type { JournalEntry } from "@/modules/journal";

type StatsOverlayProps = {
  opened: boolean;
  onClose: () => void;
  pages: BookPageType[];
};

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = dates
    .map((d) => new Date(d + "T00:00:00"))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - sorted[0].getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor((sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = dates
    .map((d) => new Date(d + "T00:00:00"))
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor((sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function StatsOverlay({ opened, onClose, pages }: StatsOverlayProps) {
  const stats = useMemo(() => {
    const entryPages = pages.filter((p): p is Extract<BookPageType, { type: "entry" }> => p.type === "entry");
    const totalEntries = entryPages.reduce((acc: number, p) => acc + p.entries.length, 0);
    const totalWords = entryPages.reduce((acc: number, p) => {
      return acc + p.entries.reduce((w: number, e: JournalEntry) => w + (e.content ?? "").split(/\s+/).filter(Boolean).length, 0);
    }, 0);
    const dates = entryPages.map((p) => p.date);
    const currentStreak = computeStreak(dates);
    const longestStreak = computeLongestStreak(dates);

    const monthCount = new Map<string, number>();
    for (const { date, entries } of entryPages) {
      const monthKey = date.slice(0, 7);
      monthCount.set(monthKey, (monthCount.get(monthKey) ?? 0) + entries.length);
    }
    let mostActiveMonth = "";
    let mostActiveCount = 0;
    for (const [key, count] of monthCount) {
      if (count > mostActiveCount) {
        mostActiveCount = count;
        mostActiveMonth = key;
      }
    }

    return { totalEntries, totalWords, currentStreak, longestStreak, mostActiveMonth, mostActiveCount };
  }, [pages]);

  const statItems = [
    { label: "Total Entries", value: stats.totalEntries, icon: IconPencil },
    { label: "Total Words", value: stats.totalWords.toLocaleString(), icon: IconBook },
    { label: "Current Streak", value: `${stats.currentStreak} days`, icon: IconFlame },
    { label: "Longest Streak", value: `${stats.longestStreak} days`, icon: IconFlame },
    {
      label: "Most Active Month",
      value: stats.mostActiveMonth
        ? `${new Date(stats.mostActiveMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })} (${stats.mostActiveCount})`
        : "N/A",
      icon: IconCalendarMonth,
    },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Journal Statistics" size="md" closeButtonProps={{ icon: <IconX size={16} /> }}>
      <SimpleGrid cols={1} spacing="sm">
        {statItems.map((item) => (
          <Paper key={item.label} withBorder p="md" radius="md">
            <Group gap="sm">
              <item.icon size={20} className="text-gray-400" />
              <div>
                <Text size="xs" c="dimmed">
                  {item.label}
                </Text>
                <Text size="lg" fw={700}>
                  {item.value}
                </Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
      <Text size="xs" c="dimmed" ta="center" mt="md">
        {stats.totalEntries} entries across {pages.filter((p) => p.type === "entry").length} unique days
      </Text>
    </Modal>
  );
}
