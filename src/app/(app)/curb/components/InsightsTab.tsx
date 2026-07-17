"use client";

import { useState, useEffect, useCallback } from "react";
import { Paper, Text, Group, Stack, SegmentedControl, Badge, Skeleton } from "@mantine/core";
import { IconBulb, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

type Insight = {
  type: "positive" | "negative" | "info";
  message: string;
};

const INSIGHT_ICONS = {
  positive: IconBulb,
  negative: IconAlertTriangle,
  info: IconInfoCircle,
};

const INSIGHT_COLORS = {
  positive: "teal",
  negative: "red",
  info: "blue",
};

export function InsightsTab() {
  const [period, setPeriod] = useState<string>("month");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/curb/insights?period=${period}`);
      const json = await res.json();
      setInsights(json);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={700}>Insights</Text>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          data={[
            { value: "week", label: "7 Days" },
            { value: "month", label: "30 Days" },
            { value: "quarter", label: "90 Days" },
          ]}
          size="xs"
        />
      </Group>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={64} radius="md" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Paper withBorder p="xl" radius="lg" ta="center">
          <Text c="dimmed" size="lg">No insights yet</Text>
          <Text size="sm" c="dimmed">Start tracking to see patterns and insights</Text>
        </Paper>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = INSIGHT_ICONS[insight.type];
            const color = INSIGHT_COLORS[insight.type];
            return (
              <Paper key={i} withBorder p="md" radius="lg">
                <Group gap="sm" align="flex-start">
                  <div className={`rounded-lg p-2 mt-0.5`} style={{ background: `var(--mantine-color-${color}-light)` }}>
                    <Icon size={18} style={{ color: `var(--mantine-color-${color}-filled)` }} />
                  </div>
                  <div className="flex-1">
                    <Text size="sm">{insight.message}</Text>
                  </div>
                  <Badge size="sm" variant="light" color={color}>
                    {insight.type}
                  </Badge>
                </Group>
              </Paper>
            );
          })}
        </div>
      )}
    </Stack>
  );
}
