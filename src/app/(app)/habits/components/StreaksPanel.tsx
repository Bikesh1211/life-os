"use client";

import { motion } from "framer-motion";
import { IconFlame } from "@tabler/icons-react";
import { Card, Text, Progress, Group, Badge } from "@mantine/core";
import { useHabitStreaks } from "@/hooks/use-habit-analytics";

export function StreaksPanel() {
  const { data: streaks, isLoading } = useHabitStreaks();

  if (isLoading) {
    return (
      <>
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
          <IconFlame size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
          No Streaks Yet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
          Complete habits consistently to build streaks.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Streaks
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Your habit streaks and consistency
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {streaks.map((s) => (
          <Card key={s.habitId} shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm" lineClamp={1}>
                {s.title}
              </Text>
              <Group gap="xs">
                {s.current > 0 && (
                  <Badge color="orange" size="sm" variant="light">
                    {s.current}-day streak
                  </Badge>
                )}
              </Group>
            </Group>
            <Group gap="lg" mb="sm">
              <div>
                <Text size="xs" c="dimmed">Current</Text>
                <Text size="lg" fw={700}>{s.current}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Longest</Text>
                <Text size="lg" fw={700}>{s.longest}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Total</Text>
                <Text size="lg" fw={700}>{s.totalCompletions}</Text>
              </div>
            </Group>
            {s.longest > 0 && (
              <Progress
                value={s.longest > 0 ? (s.current / s.longest) * 100 : 0}
                size="sm"
                color="orange"
              />
            )}
            {s.brokenStreaks.length > 0 && (
              <div className="mt-3">
                <Text size="xs" c="dimmed" mb={4}>
                  Broken streaks: {s.brokenStreaks.length}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
