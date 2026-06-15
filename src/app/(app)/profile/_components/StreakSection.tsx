"use client";

import { Paper, Group, Text, Stack, RingProgress, SimpleGrid } from "@mantine/core";
import { IconFlame, IconTrendingUp, IconCalendarStats } from "@tabler/icons-react";

type StreakSectionProps = {
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  habitsCurrentStreak?: number;
  habitsLongestStreak?: number;
};

export function StreakSection({
  currentStreak,
  longestStreak,
  consistencyScore,
  habitsCurrentStreak,
  habitsLongestStreak,
}: StreakSectionProps) {
  const streakColor =
    currentStreak >= 30 ? "orange" : currentStreak >= 7 ? "yellow" : currentStreak >= 3 ? "blue" : "gray";

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb="md">
        Streaks & Consistency
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Group gap="md" wrap="nowrap">
          <RingProgress
            size={80}
            thickness={8}
            sections={[
              {
                value: Math.min(100, (currentStreak / Math.max(1, longestStreak)) * 100),
                color: streakColor,
              },
            ]}
            label={
              <IconFlame
                size={24}
                className={currentStreak > 0 ? "text-orange-500" : "text-[var(--mantine-color-dimmed)]"}
              />
            }
          />
          <Stack gap={2}>
            <Text size="sm" fw={600}>
              {currentStreak} days
            </Text>
            <Text size="xs" c="dimmed">
              Current Streak
            </Text>
          </Stack>
        </Group>

        <Group gap="md" wrap="nowrap">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mantine-color-dark-6)]">
            <Stack gap={0} align="center">
              <Text fw={800} size="24" className="text-orange-400">
                {longestStreak}
              </Text>
              <Text size="xs" c="dimmed">
                days
              </Text>
            </Stack>
          </div>
          <Stack gap={2}>
            <Text fw={600} size="sm">
              Longest Streak
            </Text>
            <Text size="xs" c="dimmed">
              Best performance
            </Text>
          </Stack>
        </Group>

        <Group gap="md" wrap="nowrap">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mantine-color-dark-6)]">
            <Stack gap={0} align="center">
              <Text fw={800} size="24" className="text-teal-400">
                {consistencyScore}%
              </Text>
            </Stack>
          </div>
          <Stack gap={2}>
            <Text fw={600} size="sm">
              Consistency Score
            </Text>
            <Text size="xs" c="dimmed">
              Last 30 days
            </Text>
          </Stack>
        </Group>
      </SimpleGrid>
    </Paper>
  );
}
