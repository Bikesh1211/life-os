"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconTarget, IconCheck, IconX, IconCalendarTime, IconPuzzle, IconPercentage } from "@tabler/icons-react";
import { Card, Text, Group } from "@mantine/core";
import { apiFetch } from "@/core/api/http";

type Analytics = {
  totalCreated: number;
  totalCompleted: number;
  totalCancelled: number;
  longTermCount: number;
  shortTermCount: number;
  avgProgress: number;
  avgCompletionTimeDays: number;
  overdueCount: number;
  completionRate: number;
  categoryDistribution: Record<string, number>;
};

export default function AnalyticsTab() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["goals", "analytics"],
    queryFn: () => apiFetch<Analytics>("/api/goals/analytics"),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.totalCreated === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconTarget size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Analytics Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Create and complete goals to see your analytics here.
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Created", value: data.totalCreated, icon: IconTarget, color: "blue" },
    { label: "Completed", value: data.totalCompleted, icon: IconCheck, color: "green" },
    { label: "Cancelled", value: data.totalCancelled, icon: IconX, color: "red" },
    { label: "Completion Rate", value: `${data.completionRate}%`, icon: IconPercentage, color: "teal" },
    { label: "Avg Progress", value: `${data.avgProgress}%`, icon: IconPuzzle, color: "violet" },
    { label: "Avg Time to Complete", value: `${data.avgCompletionTimeDays}d`, icon: IconCalendarTime, color: "orange" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Goal Analytics
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Track your goal-setting patterns and achievements
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <Card key={card.label} shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <card.icon size={18} style={{ color: `var(--mantine-color-${card.color}-6)` }} />
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                {card.label}
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {card.value}
            </Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Goal Breakdown
          </Text>
          <div className="space-y-3">
            <Group justify="space-between">
              <Text size="sm">Long-term</Text>
              <Text size="sm" fw={600}>{data.longTermCount}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Short-term</Text>
              <Text size="sm" fw={600}>{data.shortTermCount}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Overdue</Text>
              <Text size="sm" fw={600} c="red">{data.overdueCount}</Text>
            </Group>
          </div>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Category Distribution
          </Text>
          {Object.keys(data.categoryDistribution).length === 0 ? (
            <Text size="sm" c="dimmed">No categories used yet</Text>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.categoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <Group key={category} justify="space-between">
                    <Text size="sm" tt="capitalize">{category}</Text>
                    <Text size="sm" fw={600}>{count}</Text>
                  </Group>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
