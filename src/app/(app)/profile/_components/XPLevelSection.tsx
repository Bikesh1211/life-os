"use client";

import { Paper, Group, Text, RingProgress, Stack, Badge } from "@mantine/core";
import { IconTrophy, IconFlame, IconTarget } from "@tabler/icons-react";
import type { LevelInfo } from "@/hooks/use-gamification";

type XPLevelSectionProps = {
  levelInfo: LevelInfo;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
};

export function XPLevelSection({
  levelInfo,
  currentStreak,
  longestStreak,
  consistencyScore,
}: XPLevelSectionProps) {
  return (
    <Paper withBorder p="lg" radius="md" className="relative overflow-hidden">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-500/8 to-orange-500/5 blur-2xl" />

      <Stack gap="md" className="relative z-10 sm:flex-row sm:items-start">
        <div className="flex justify-center sm:block">
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: levelInfo.progress, color: "yellow" }]}
            label={
              <Stack gap={0} align="center">
                <Text fw={900} size="24" className="text-yellow-500" style={{ lineHeight: 1 }}>
                  {levelInfo.level}
                </Text>
                <Text size="xs" c="dimmed">
                  Level
                </Text>
              </Stack>
            }
          />
        </div>

        <Stack gap={6} style={{ flex: 1 }}>
          <Group gap="xs">
            <IconTrophy size={18} className="text-yellow-500" />
            <Text fw={700} size="lg">
              {levelInfo.totalXp.toLocaleString()} Total XP
            </Text>
          </Group>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--mantine-color-dark-6)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-700"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>

          <Text size="sm" c="dimmed">
            {levelInfo.currentXp.toLocaleString()} / {levelInfo.xpForNext.toLocaleString()} XP to Level{" "}
            {levelInfo.level + 1}
          </Text>

          <Text size="xs" c="dimmed">
            {levelInfo.xpForNext - levelInfo.currentXp > 0
              ? `${(levelInfo.xpForNext - levelInfo.currentXp).toLocaleString()} XP remaining`
              : "Ready to level up!"}
          </Text>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
            <Group gap="xs">
              <IconFlame size={16} className={currentStreak > 0 ? "text-orange-500" : "text-[var(--mantine-color-dimmed)]"} />
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Current Streak
                </Text>
                <Text fw={600} size="sm">
                  {currentStreak} days
                </Text>
              </Stack>
            </Group>

            <Group gap="xs">
              <IconFlame size={16} className="text-orange-400" />
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Longest Streak
                </Text>
                <Text fw={600} size="sm">
                  {longestStreak} days
                </Text>
              </Stack>
            </Group>

            <Group gap="xs">
              <IconTarget size={16} className="text-teal-500" />
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Consistency
                </Text>
                <Text fw={600} size="sm">
                  {consistencyScore}%
                </Text>
              </Stack>
            </Group>
          </div>
        </Stack>

        <Stack gap={4} className="hidden sm:flex">
          {Array.from({ length: Math.min(levelInfo.level, 5) }).map((_, i) => (
            <Badge
              key={i}
              size="sm"
              variant="light"
              color="yellow"
              className="opacity-60"
            >
              Level {levelInfo.level - i}
            </Badge>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
