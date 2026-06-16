"use client";

import { SimpleGrid, Paper, Group, Text, RingProgress } from "@mantine/core";
import { IconClock, IconCheckbox, IconPercentage } from "@tabler/icons-react";
import type { DayMetrics } from "@/hooks/use-day-plan";

type MetricsHeaderProps = {
  metrics: DayMetrics | null;
  isLoading: boolean;
  date: string;
};

export function MetricsHeader({ metrics, isLoading, date }: MetricsHeaderProps) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <Paper key={i} withBorder p="sm" radius="md">
            <div className="h-12 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  if (!metrics) return null;

  const { plannedHours, completedItems, totalItems, completionRate } = metrics;

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
      <Paper withBorder p="sm" radius="md">
        <Group gap="sm">
          <RingProgress
            size={48}
            thickness={5}
            sections={[{ value: completionRate, color: completionRate === 100 ? "green" : "blue" }]}
          />
          <div>
            <Text size="xs" c="dimmed">Completion Rate</Text>
            <Text size="lg" fw={700}>{completionRate}%</Text>
            <Text size="xs" c="dimmed">{completedItems}/{totalItems} items</Text>
          </div>
        </Group>
      </Paper>

      <Paper withBorder p="sm" radius="md">
        <Group gap="sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--mantine-color-blue-light)]">
            <IconClock size={22} className="text-[var(--mantine-color-blue-filled)]" />
          </div>
          <div>
            <Text size="xs" c="dimmed">Planned Hours</Text>
            <Text size="lg" fw={700}>{plannedHours}h</Text>
            <Text size="xs" c="dimmed">Scheduled for today</Text>
          </div>
        </Group>
      </Paper>

      <Paper withBorder p="sm" radius="md">
        <Group gap="sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--mantine-color-green-light)]">
            <IconCheckbox size={22} className="text-[var(--mantine-color-green-filled)]" />
          </div>
          <div>
            <Text size="xs" c="dimmed">Completed</Text>
            <Text size="lg" fw={700}>{completedItems}</Text>
            <Text size="xs" c="dimmed">of {totalItems} activities</Text>
          </div>
        </Group>
      </Paper>
    </SimpleGrid>
  );
}
