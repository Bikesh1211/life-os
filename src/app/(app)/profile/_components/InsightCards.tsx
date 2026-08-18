"use client";

import { useQuery } from "@tanstack/react-query";
import { Paper, Group, Text, Stack, SimpleGrid, ThemeIcon } from "@mantine/core";
import { IconBulb, IconTrendingUp, IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

type Insight = {
  type: "positive" | "negative" | "info";
  message: string;
};

const insightIcons = {
  positive: IconTrendingUp,
  negative: IconAlertCircle,
  info: IconInfoCircle,
};

const insightColors = {
  positive: "teal",
  negative: "red",
  info: "blue",
};

function InsightCard({ insight }: { insight: Insight }) {
  const Icon = insightIcons[insight.type];
  const color = insightColors[insight.type];

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      className="transition-all hover:shadow-sm"
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color={color} size="lg" radius="xl">
          <Icon size={18} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">
          {insight.message}
        </Text>
      </Group>
    </Paper>
  );
}

export function InsightCards() {
  const { data: insights, isLoading } = useQuery<Insight[]>({
    queryKey: ["habit-insights"],
    queryFn: async () => apiFetch<Insight[]>("/api/habits/analytics/insights"),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6)]"
          />
        ))}
      </SimpleGrid>
    );
  }

  if (!insights || insights.length === 0) return null;

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="xs" mb="md">
        <IconBulb size={16} className="text-yellow-500" />
        <Text fw={600} size="sm">
          Insights
        </Text>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {insights.slice(0, 4).map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </SimpleGrid>
    </Paper>
  );
}
