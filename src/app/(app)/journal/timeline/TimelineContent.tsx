"use client";

import { useMemo } from "react";
import { Stack, Title, Group, Text, Paper, Badge, Box } from "@mantine/core";
import Link from "next/link";
import { getMoodEmoji, getMoodColor, formatDate } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type TimelineContentProps = {
  entries: JournalEntry[];
};

export function TimelineContent({ entries }: TimelineContentProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const d = new Date(entry.eventDate ?? entry.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  function isBackdated(entry: JournalEntry) {
    return (
      entry.eventDate &&
      Math.abs(new Date(entry.eventDate).getTime() - new Date(entry.createdAt).getTime()) > 86400000
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Timeline</Title>
        <Text
          component={Link}
          href="/journal"
          size="sm"
          c="dimmed"
          className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
        >
          &larr; Back to entries
        </Text>
      </Group>

      {grouped.length === 0 ? (
        <Paper withBorder p="xl" className="text-center">
          <Text c="dimmed">No entries yet.</Text>
        </Paper>
      ) : (
        <Stack gap="lg">
          {grouped.map(([month, monthEntries]) => {
            const [year, monthNum] = month.split("-");
            const date = new Date(Number(year), Number(monthNum) - 1);
            const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

            return (
              <div key={month}>
                <Group gap="sm" mb="sm">
                  <Text fw={600} size="sm">
                    {monthName}
                  </Text>
                  <Badge size="sm" variant="light">
                    {monthEntries.length} entries
                  </Badge>
                </Group>

                <Box className="relative ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  {monthEntries.map((entry, i) => (
                    <Box key={entry.id} className={`relative ${i < monthEntries.length - 1 ? "pb-4" : ""}`}>
                      <Box
                        className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900"
                        style={{ backgroundColor: entry.mood ? getMoodColor(entry.mood) : "var(--mantine-color-gray-4)" }}
                      />
                      <Link href={`/journal/${entry.id}`} className="no-underline">
                        <Paper withBorder p="sm" className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <Group gap="xs" mb={2}>
                            {entry.mood && (
                              <Text size="sm" role="img">
                                {getMoodEmoji(entry.mood)}
                              </Text>
                            )}
                            <Text size="sm" fw={600}>
                              {entry.title}
                            </Text>
                            <Group gap={4} className="ml-auto">
                              {isBackdated(entry) && (
                                <Badge size="xs" variant="light" color="gray">
                                  Written {formatDate(new Date(entry.createdAt))}
                                </Badge>
                              )}
                              <Text size="xs" c="dimmed">
                                {formatDate(new Date(entry.eventDate ?? entry.createdAt))}
                              </Text>
                            </Group>
                          </Group>
                          {entry.content && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {entry.content}
                            </Text>
                          )}
                        </Paper>
                      </Link>
                    </Box>
                  ))}
                </Box>
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
