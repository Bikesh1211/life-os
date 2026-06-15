"use client";

import { Paper, Group, Text, RingProgress, Stack } from "@mantine/core";
import { IconTrophy, IconFlame } from "@tabler/icons-react";

type LevelCardProps = {
  level: number;
  totalXp: number;
  currentXp: number;
  xpForNext: number;
  progress: number;
  currentStreak?: number;
};

export function LevelCard({
  level,
  totalXp,
  currentXp,
  xpForNext,
  progress,
  currentStreak,
}: LevelCardProps) {
  return (
    <Paper withBorder p="lg" radius="md">
      <Group gap="xl" wrap="nowrap">
        <RingProgress
          size={120}
          thickness={12}
          sections={[{ value: progress, color: "yellow" }]}
          label={
            <Stack gap={0} align="center">
              <Text fw={900} size="xl" style={{ lineHeight: 1 }}>
                {level}
              </Text>
              <Text size="xs" c="dimmed">
                Level
              </Text>
            </Stack>
          }
        />

        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <IconTrophy size={18} className="text-yellow-500" />
            <Text fw={600}>{totalXp.toLocaleString()} Total XP</Text>
          </Group>

          <div className="h-2 w-full rounded-full bg-[var(--mantine-color-dark-6)]">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <Text size="sm" c="dimmed">
            {currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP to next level
          </Text>

          {currentStreak !== undefined && currentStreak > 0 && (
            <Group gap={4}>
              <IconFlame size={14} className="text-orange-500" />
              <Text size="sm" c="dimmed">
                {currentStreak} day streak
              </Text>
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
