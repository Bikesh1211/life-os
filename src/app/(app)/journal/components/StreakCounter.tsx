"use client";

import { Paper, Group, Text, RingProgress } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";

type StreakCounterProps = {
  streak: number;
};

export function StreakCounter({ streak }: StreakCounterProps) {
  const maxStreak = 365;

  return (
    <Paper withBorder p="sm" className="flex items-center gap-3">
      <RingProgress
        size={60}
        thickness={6}
        roundCaps
        sections={[{ value: Math.min((streak / maxStreak) * 100, 100), color: streak >= 30 ? "orange" : streak >= 7 ? "yellow" : "blue" }]}
      />
      <div>
        <Group gap={4}>
          <IconFlame size={18} className={streak > 0 ? "text-orange-500" : "text-gray-400"} />
          <Text fw={700} size="lg">
            {streak}
          </Text>
          <Text size="sm" c="dimmed">
            day{streak !== 1 ? "s" : ""}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          Writing streak
        </Text>
      </div>
    </Paper>
  );
}
