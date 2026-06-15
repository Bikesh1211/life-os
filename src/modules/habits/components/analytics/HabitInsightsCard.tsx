"use client";

import { Paper, Text, Stack, Group, Badge } from "@mantine/core";
import { motion } from "framer-motion";
import { IconBulb, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import { useHabitInsights } from "@/hooks/use-habit-analytics";
import type { Insight } from "@/hooks/use-habit-analytics";

type Props = {
  filters?: Record<string, string>;
};

function InsightIcon({ type }: { type: Insight["type"] }) {
  if (type === "positive") return <IconBulb size={16} className="text-green-400 shrink-0" />;
  if (type === "negative") return <IconAlertTriangle size={16} className="text-red-400 shrink-0" />;
  return <IconInfoCircle size={16} className="text-blue-400 shrink-0" />;
}

function InsightBadge({ type }: { type: Insight["type"] }) {
  if (type === "positive") return <Badge size="xs" color="green" variant="light">Insight</Badge>;
  if (type === "negative") return <Badge size="xs" color="red" variant="light">Warning</Badge>;
  return <Badge size="xs" color="blue" variant="light">Info</Badge>;
}

export function HabitInsightsCard({ filters }: Props) {
  const { data, isLoading } = useHabitInsights(filters);

  if (isLoading) {
    return (
      <Paper withBorder p="md" radius="md">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Not enough data to generate insights. Keep tracking!
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group mb="md">
        <IconBulb size={20} className="text-yellow-400" />
        <Text fw={600} size="sm">Smart Insights</Text>
      </Group>
      <Stack gap="sm">
        {data.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)] px-3 py-2.5"
          >
            <InsightIcon type={insight.type} />
            <div className="flex-1 min-w-0">
              <Text size="sm">{insight.message}</Text>
            </div>
            <InsightBadge type={insight.type} />
          </motion.div>
        ))}
      </Stack>
    </Paper>
  );
}
