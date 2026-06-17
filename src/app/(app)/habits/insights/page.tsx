"use client";

import { motion } from "framer-motion";
import { IconBulb, IconInfoCircle, IconMoodSmile, IconAlertTriangle } from "@tabler/icons-react";
import { Card, Text, Group } from "@mantine/core";
import { useHabitInsights } from "@/hooks/use-habit-analytics";

const iconMap = {
  positive: IconMoodSmile,
  negative: IconAlertTriangle,
  info: IconInfoCircle,
};

const colorMap = {
  positive: "teal",
  negative: "red",
  info: "blue",
};

export default function HabitsInsightsPage() {
  const { data: insights, isLoading } = useHabitInsights();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconBulb size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Insights Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Track habits consistently to receive personalized insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Insights
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Personalized observations about your habits
        </p>
      </motion.div>

      <div className="grid gap-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.type];
          const color = colorMap[insight.type];
          return (
            <Card key={i} shadow="sm" padding="md" radius="md" withBorder>
              <Group gap="sm">
                <Icon size={22} style={{ color: `var(--mantine-color-${color}-6)` }} />
                <Text size="sm">{insight.message}</Text>
              </Group>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
