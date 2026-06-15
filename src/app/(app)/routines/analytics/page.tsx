"use client";

import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  Badge,
  Button,
  RingProgress,
} from "@mantine/core";
import {
  IconTarget,
  IconTrendingUp,
  IconCalendarStats,
  IconCheck,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRoutineAnalytics } from "@/hooks/use-routine-analytics";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `var(--mantine-color-${color}-light)` }}
        >
          <Icon size={22} style={{ color: `var(--mantine-color-${color}-filled)` }} />
        </div>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">{label}</Text>
          <Text fw={700} size="xl">{value}</Text>
        </Stack>
      </Group>
    </Paper>
  );
}

export default function RoutinesAnalyticsPage() {
  const { data: analytics, isLoading } = useRoutineAnalytics();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
          ))}
        </SimpleGrid>
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed)]">
            Cross-routine performance and trends
          </p>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
          <StatCard
            label="Routines"
            value={analytics?.routineCount ?? 0}
            icon={IconTarget}
            color="blue"
          />
          <StatCard
            label="Total Executions"
            value={analytics?.executionCount ?? 0}
            icon={IconCalendarStats}
            color="violet"
          />
          <StatCard
            label="Completion Rate"
            value={analytics ? `${Math.round(analytics.completionRate)}%` : "0%"}
            icon={IconCheck}
            color="green"
          />
          <StatCard
            label="Consistency"
            value={analytics ? `${Math.round(analytics.consistencyScore)}%` : "0%"}
            icon={IconTrendingUp}
            color="teal"
          />
        </SimpleGrid>

        {analytics && (
          <Stack gap="md">
            {analytics.bestDay && (
              <Paper withBorder p="md" radius="md">
                <Group gap="lg">
                  <RingProgress
                    size={80}
                    thickness={8}
                    sections={[{ value: Math.round(analytics.bestDay.rate * 100), color: "green" }]}
                    label={
                      <Text size="xs" ta="center" fw={700}>
                        {Math.round(analytics.bestDay.rate * 100)}%
                      </Text>
                    }
                  />
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>Best Day</Text>
                    <Text size="sm" c="dimmed">{analytics.bestDay.date}</Text>
                    <Text size="xs" c="dimmed">
                      Highest completion rate across all routines
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            )}

            {analytics.routinePerformance.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Routine Performance</Text>
                <Stack gap="sm">
                  {analytics.routinePerformance.map((rp) => (
                    <Group key={rp.routineId} justify="apart">
                      <Group>
                        <Text size="sm">{rp.routineId}</Text>
                        <Badge
                          color={rp.rate >= 0.8 ? "green" : rp.rate >= 0.5 ? "yellow" : "red"}
                          variant="light"
                          size="sm"
                        >
                          {Math.round(rp.rate * 100)}%
                        </Badge>
                      </Group>
                      <Button
                        size="xs"
                        variant="subtle"
                        component={Link}
                        href={`/routines/${rp.routineId}/analytics`}
                        rightSection={<IconArrowRight size={14} />}
                      >
                        Details
                      </Button>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {analytics.mostMissedItems.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Most Missed Activities</Text>
                <Stack gap="sm">
                  {analytics.mostMissedItems.slice(0, 5).map((item) => (
                    <Group key={item.routineItemId} justify="apart">
                      <Text size="sm">{item.itemTitle || "Unnamed activity"}</Text>
                      <Badge color="red" variant="light" size="sm">
                        {Math.round((1 - item.rate) * 100)}% missed
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {analytics.dailyTrend.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Daily Completion Rate Trend</Text>
                <Stack gap="xs">
                  {analytics.dailyTrend.slice(-14).map((day) => (
                    <Group key={day.date} justify="apart">
                      <Text size="xs" c="dimmed">{day.date}</Text>
                      <Group gap="xs">
                        <Text size="xs">{day.completed}/{day.total}</Text>
                        <div
                          className="h-2 rounded"
                          style={{
                            width: 100,
                            backgroundColor: "var(--mantine-color-dark-6)",
                          }}
                        >
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${Math.round(day.rate * 100)}%`,
                              backgroundColor: `var(--mantine-color-${day.rate >= 0.8 ? "green" : day.rate >= 0.5 ? "yellow" : "red"}-filled)`,
                            }}
                          />
                        </div>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}

        {analytics && analytics.routineCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6)]">
              <IconTrendingUp size={32} className="text-[var(--mantine-color-dimmed)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--mantine-color-text)]">
              No Data Yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed)]">
              Start using your routines to see analytics here.
            </p>
            <Button component={Link} href="/routines" mt="lg" variant="light">
              Go to Dashboard
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
