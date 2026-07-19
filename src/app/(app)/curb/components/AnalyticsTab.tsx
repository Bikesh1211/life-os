"use client";

import { useState, useEffect, useCallback } from "react";
import { Paper, Text, Group, Stack, SimpleGrid, Badge, SegmentedControl, Skeleton, Table } from "@mantine/core";

type AnalyticsData = {
  dateFrom: string;
  dateTo: string;
  totalCount: number;
  dailyAverage: number;
  improvement: number;
  regression: number;
  bestDay: { date: string; count: number } | null;
  worstDay: { date: string; count: number } | null;
  highestHabit: { habitId: string; habitName: string; count: number } | null;
  lowestHabit: { habitId: string; habitName: string; count: number } | null;
  habitRankings: Array<{ habitId: string; habitName: string; count: number; previousCount: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
  triggerDistribution: Array<{ trigger: string; count: number }>;
  moodDistribution: Array<{ mood: string; count: number }>;
};

export function AnalyticsTab() {
  const [period, setPeriod] = useState<string>("week");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/curb/analytics?period=${period}`);
      if (!res.ok) { setData(null); return; }
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={36} width={300} radius="md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={100} radius="lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <Text c="dimmed">Failed to load analytics</Text>;

  const improvementColor = data.improvement > 0 ? "teal" : data.improvement < 0 ? "red" : "gray";

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={700}>Analytics</Text>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          data={[
            { value: "week", label: "7 Days" },
            { value: "month", label: "30 Days" },
            { value: "quarter", label: "90 Days" },
            { value: "year", label: "Year" },
          ]}
          size="xs"
        />
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total</Text>
          <Text size="xl" fw={700}>{data.totalCount}</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Daily Avg</Text>
          <Text size="xl" fw={700}>{data.dailyAverage}</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Improvement</Text>
          <Group gap={4}>
            <Text size="xl" fw={700} c={improvementColor}>
              {data.improvement > 0 ? "↓" : data.improvement < 0 ? "↑" : "—"}
              {Math.abs(data.improvement)}%
            </Text>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Best / Worst Day</Text>
          <Text size="sm" fw={600}>
            {data.bestDay ? `${data.bestDay.count} / ` : "— / "}
            {data.worstDay ? data.worstDay.count : "—"}
          </Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="md" radius="lg">
          <Text size="sm" fw={600} mb="sm">Habit Rankings</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Habit</Table.Th>
                <Table.Th>Count</Table.Th>
                <Table.Th>Change</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.habitRankings.map((h) => {
                const change = h.count - h.previousCount;
                return (
                  <Table.Tr key={h.habitId}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{h.habitName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">{h.count}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c={change <= 0 ? "teal" : "red"}>
                        {change > 0 ? "+" : ""}{change}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              {data.habitRankings.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3}><Text size="sm" c="dimmed" ta="center">No data</Text></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="md" radius="lg">
          <Text size="sm" fw={600} mb="sm">Daily Trend</Text>
          <div className="flex items-end gap-1 h-32">
            {data.dailyTrend.map((d) => {
              const maxCount = Math.max(...data.dailyTrend.map((x) => x.count), 1);
              const height = (d.count / maxCount) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${height}%`,
                      background: d.count > maxCount * 0.7 ? "var(--mantine-color-red-5)" : d.count > maxCount * 0.3 ? "var(--mantine-color-yellow-5)" : "var(--mantine-color-green-5)",
                      minHeight: d.count > 0 ? 4 : 0,
                    }}
                  />
                  {d.count > 0 && <Text size="9" className="text-[9px] leading-none text-gray-500">{d.count}</Text>}
                </div>
              );
            })}
          </div>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="md" radius="lg">
          <Text size="sm" fw={600} mb="sm">Top Triggers</Text>
          {data.triggerDistribution.length === 0 ? (
            <Text size="sm" c="dimmed">No trigger data yet. Add triggers to your logs.</Text>
          ) : (
            <div className="space-y-2">
              {data.triggerDistribution.slice(0, 5).map((t) => {
                const total = data.triggerDistribution.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((t.count / total) * 100);
                return (
                  <div key={t.trigger}>
                    <Group justify="space-between" mb={2}>
                      <Text size="sm">{t.trigger}</Text>
                      <Text size="xs" c="dimmed">{t.count} ({pct}%)</Text>
                    </Group>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Paper>

        <Paper withBorder p="md" radius="lg">
          <Text size="sm" fw={600} mb="sm">Mood Distribution</Text>
          {data.moodDistribution.length === 0 ? (
            <Text size="sm" c="dimmed">No mood data yet. Add moods to your logs.</Text>
          ) : (
            <div className="space-y-2">
              {data.moodDistribution.slice(0, 5).map((m) => {
                const total = data.moodDistribution.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((m.count / total) * 100);
                return (
                  <div key={m.mood}>
                    <Group justify="space-between" mb={2}>
                      <Text size="sm">{m.mood}</Text>
                      <Text size="xs" c="dimmed">{m.count} ({pct}%)</Text>
                    </Group>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
