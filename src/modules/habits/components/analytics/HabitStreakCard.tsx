"use client";

import { useMemo } from "react";
import { Paper, Text, Group, Badge, Stack } from "@mantine/core";
import { IconFlame, IconTrophy } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { StreakData } from "@/hooks/use-habit-analytics";
import { useHabitStreaks } from "@/hooks/use-habit-analytics";

export function HabitStreakCard() {
  const { data, isLoading } = useHabitStreaks();

  if (isLoading) {
    return (
      <Paper withBorder p="md" radius="md">
        <div className="h-48 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No streak data yet. Start completing habits!
        </Text>
      </Paper>
    );
  }

  const sorted = [...data].sort((a, b) => b.current - a.current);
  const topStreak = sorted[0];

  return (
    <Paper withBorder p="md" radius="md">
      <Group mb="md">
        <IconFlame size={20} className="text-orange-400" />
        <Text fw={600} size="sm">Streak Analytics</Text>
      </Group>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sorted.slice(0, 6).map((habit, i) => (
          <motion.div
            key={habit.habitId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)] px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <Text size="sm" truncate>
                {habit.title}
              </Text>
              <Text size="xs" c="dimmed">
                {habit.totalCompletions} total completions
              </Text>
            </div>
            <Group gap={4}>
              <Badge
                size="sm"
                variant="light"
                color={habit.current > 0 ? "orange" : "gray"}
              >
                {habit.current}d
              </Badge>
              <Badge size="sm" variant="light" color="yellow">
                {habit.longest}d
              </Badge>
            </Group>
          </motion.div>
        ))}
      </div>

      <Text size="xs" c="dimmed" mt="sm" ta="right">
        <IconTrophy size={12} className="inline" /> Orange = current, Yellow = longest
      </Text>
    </Paper>
  );
}
