"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconScale, IconFlame, IconCheck, IconX, IconTrendingUp, IconClock } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Progress, RingProgress, SimpleGrid, Stack } from "@mantine/core";

type Analytics = {
  totalCreated: number;
  totalCompleted: number;
  totalFailed: number;
  totalCancelled: number;
  integrityScore: number;
  currentStreak: number;
  longestStreak: number;
  promiseRatio: number;
  failureRate: number;
  completedBeforeDeadline: number;
  avgCompletionTimeHours: number;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    completed: number;
  }>;
  dayOfWeekDistribution: Record<string, { total: number; completed: number }>;
  insights?: Array<{ type: "positive" | "negative" | "info"; message: string }>;
};

export default function AnalyticsTab() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["integrity", "analytics"],
    queryFn: () =>
      fetch("/api/integrity/analytics?insights=true").then((r) =>
        r.ok ? r.json() : null,
      ),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const scoreColor = analytics.integrityScore >= 80 ? "green" : analytics.integrityScore >= 50 ? "yellow" : "red";

  const insightColors: Record<string, string> = {
    positive: "green",
    negative: "red",
    info: "blue",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Analytics
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Track your integrity journey
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Promises", value: analytics.totalCreated, icon: IconCheck, color: "blue" },
          { label: "Completed", value: analytics.totalCompleted, icon: IconCheck, color: "green" },
          { label: "Failed", value: analytics.totalFailed, icon: IconX, color: "red" },
          { label: "Longest Streak", value: `${analytics.longestStreak}d`, icon: IconFlame, color: "orange" },
        ].map((card) => (
          <Card key={card.label} shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <card.icon size={20} style={{ color: `var(--mantine-color-${card.color}-6)` }} />
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

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Integrity Score
          </Text>
          <div className="flex items-center justify-center">
            <RingProgress
              size={160}
              thickness={16}
              sections={[{ value: analytics.integrityScore, color: scoreColor }]}
              label={
                <Text ta="center" fw={700} size="xl">
                  {analytics.integrityScore}
                </Text>
              }
            />
          </div>
          <Stack gap="xs" mt="md">
            <Group justify="space-between">
              <Text size="sm">Promise Ratio: {analytics.promiseRatio}%</Text>
              <Text size="sm" c={analytics.promiseRatio >= 80 ? "green" : "yellow"}>
                {analytics.promiseRatio >= 80 ? "Good" : "Needs Work"}
              </Text>
            </Group>
            <Progress value={analytics.promiseRatio} size="sm" color={analytics.promiseRatio >= 80 ? "green" : "yellow"} />

            <Group justify="space-between">
              <Text size="sm">Failure Rate: {analytics.failureRate}%</Text>
              <Text size="sm" c={analytics.failureRate <= 10 ? "green" : analytics.failureRate <= 25 ? "yellow" : "red"}>
                {analytics.failureRate <= 10 ? "Low" : analytics.failureRate <= 25 ? "Medium" : "High"}
              </Text>
            </Group>
            <Progress value={analytics.failureRate} size="sm" color={analytics.failureRate <= 10 ? "green" : analytics.failureRate <= 25 ? "yellow" : "red"} />
          </Stack>
        </Card>

        {analytics.insights && analytics.insights.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={600} size="sm" mb="md">
              Insights
            </Text>
            <Stack gap="sm">
              {analytics.insights.map((insight, i) => (
                <Card key={i} padding="sm" radius="md" withBorder>
                  <Group gap="xs">
                    <Badge
                      color={insightColors[insight.type] ?? "gray"}
                      size="sm"
                      variant="light"
                    >
                      {insight.type}
                    </Badge>
                    <Text size="sm">{insight.message}</Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        )}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Category Distribution
          </Text>
          {Object.entries(analytics.categoryDistribution).length === 0 ? (
            <Text size="sm" c="dimmed">No data yet</Text>
          ) : (
            <Stack gap="xs">
              {Object.entries(analytics.categoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <Group key={category} justify="space-between">
                    <Text size="sm" tt="capitalize">{category}</Text>
                    <Text size="sm" fw={600}>{count}</Text>
                  </Group>
                ))}
            </Stack>
          )}
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Day of Week Performance
          </Text>
          {Object.entries(analytics.dayOfWeekDistribution).filter(([_, d]) => d.total > 0).length === 0 ? (
            <Text size="sm" c="dimmed">No data yet</Text>
          ) : (
            <Stack gap="xs">
              {Object.entries(analytics.dayOfWeekDistribution)
                .filter(([_, d]) => d.total > 0)
                .map(([day, data]) => {
                  const rate = Math.round((data.completed / data.total) * 100);
                  return (
                    <div key={day}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm">{day}</Text>
                        <Text size="sm" fw={600}>{data.completed}/{data.total} ({rate}%)</Text>
                      </Group>
                      <Progress value={rate} size="sm" color={rate >= 80 ? "green" : rate >= 50 ? "yellow" : "red"} />
                    </div>
                  );
                })}
            </Stack>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Difficulty Breakdown
          </Text>
          {analytics.difficultyDistribution.length === 0 ? (
            <Text size="sm" c="dimmed">No data yet</Text>
          ) : (
            <Stack gap="xs">
              {analytics.difficultyDistribution.map((d) => (
                <div key={d.difficulty}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" tt="capitalize">{d.difficulty}</Text>
                    <Text size="sm" fw={600}>{d.completed}/{d.count} completed</Text>
                  </Group>
                  <Progress
                    value={d.count > 0 ? (d.completed / d.count) * 100 : 0}
                    size="sm"
                    color={d.difficulty === "easy" ? "green" : d.difficulty === "medium" ? "yellow" : d.difficulty === "hard" ? "orange" : "red"}
                  />
                </div>
              ))}
            </Stack>
          )}
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="sm" mb="md">
            Statistics
          </Text>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">Completed Before Deadline</Text>
              <Text size="sm" fw={600}>{analytics.completedBeforeDeadline}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Avg Completion Time</Text>
              <Text size="sm" fw={600}>{analytics.avgCompletionTimeHours}h</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Current Streak</Text>
              <Text size="sm" fw={600}>{analytics.currentStreak} days</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Longest Streak</Text>
              <Text size="sm" fw={600}>{analytics.longestStreak} days</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Total Created</Text>
              <Text size="sm" fw={600}>{analytics.totalCreated}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Total Completed</Text>
              <Text size="sm" fw={600}>{analytics.totalCompleted}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Total Cancelled</Text>
              <Text size="sm" fw={600}>{analytics.totalCancelled}</Text>
            </Group>
          </Stack>
        </Card>
      </div>
    </div>
  );
}
