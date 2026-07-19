"use client";

import { useState, useEffect } from "react";
import { Paper, Text, Stack, Group, SimpleGrid, RingProgress, Badge, Skeleton } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp, IconAlertTriangle, IconActivity } from "@tabler/icons-react";

type DashboardData = {
  todayTotal: number;
  highestHabit: { name: string; count: number } | null;
  lowestHabit: { name: string; count: number } | null;
  activeHabitCount: number;
  cleanStreak: number;
  longestCleanStreak: number;
  recoveryProgress: number;
  riskScore: number;
  dailyAverage30d: number;
  weekTotal: number;
  todayRatio: number;
};

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <Paper withBorder p="md" radius="lg" className="flex items-start gap-3">
      <div className={`rounded-xl p-2.5`} style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        <Text size="xl" fw={700} style={{ color }}>{value}</Text>
        {sub && <Text size="xs" c="dimmed">{sub}</Text>}
      </div>
    </Paper>
  );
}

export function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curb/dashboard")
      .then((r) => { if (!r.ok) throw new Error("API error"); return r.json(); })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={100} radius="lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <Text c="dimmed">Failed to load dashboard</Text>;

  const riskColor = data.riskScore < 30 ? "teal" : data.riskScore < 60 ? "yellow" : "red";
  const recoveryColor = data.recoveryProgress >= 50 ? "teal" : data.recoveryProgress >= 20 ? "yellow" : "red";

  return (
    <Stack gap="md">
      <Text size="lg" fw={700}>Today's Summary</Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          label="Total Today"
          value={data.todayTotal}
          icon={IconActivity}
          color="#3b82f6"
          sub={`Avg: ${data.dailyAverage30d}/day`}
        />
        <StatCard
          label="Week Total"
          value={data.weekTotal}
          icon={IconTrendingDown}
          color="#8b5cf6"
        />
        <StatCard
          label="Clean Streak"
          value={`${data.cleanStreak} days`}
          icon={IconTrendingUp}
          color="#10b981"
          sub={`Best: ${data.longestCleanStreak} days`}
        />
        <StatCard
          label="Active Habits"
          value={data.activeHabitCount}
          icon={IconActivity}
          color="#f59e0b"
        />
      </SimpleGrid>

      {data.highestHabit && (
        <Paper withBorder p="md" radius="lg">
          <Group gap="xl">
            <div className="flex-1">
              <Text size="sm" c="dimmed" fw={600}>Highest Today</Text>
              <Text size="lg" fw={700}>{data.highestHabit.name}</Text>
              <Text size="2xl" fw={700} c="red">{data.highestHabit.count}x</Text>
            </div>
            {data.lowestHabit && data.lowestHabit.name && (
              <div className="flex-1">
                <Text size="sm" c="dimmed" fw={600}>Lowest Today</Text>
                <Text size="lg" fw={700}>{data.lowestHabit.name}</Text>
                <Text size="2xl" fw={700} c="teal">{data.lowestHabit.count}x</Text>
              </div>
            )}
          </Group>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="md" radius="lg" className="flex items-center gap-4">
          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: Math.min(100, data.recoveryProgress), color: recoveryColor }]}
          />
          <div>
            <Text size="sm" c="dimmed" fw={600}>Recovery Progress</Text>
            <Text size="xl" fw={700}>{data.recoveryProgress}%</Text>
            <Text size="xs" c="dimmed">Compared to last 30 days</Text>
          </div>
        </Paper>

        <Paper withBorder p="md" radius="lg" className="flex items-center gap-4">
          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: Math.min(100, data.riskScore), color: riskColor }]}
          />
          <div>
            <Group gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Risk Score</Text>
              {data.riskScore >= 60 && <IconAlertTriangle size={16} color="red" />}
            </Group>
            <Text size="xl" fw={700}>{data.riskScore}/100</Text>
            <Text size="xs" c="dimmed">{data.riskScore < 30 ? "Low risk" : data.riskScore < 60 ? "Moderate" : "High risk"}</Text>
          </div>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
