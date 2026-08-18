"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  SegmentedControl,
  ThemeIcon,
} from "@mantine/core";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area,
} from "recharts";
import { apiFetch, toSearchParams } from "@/core/api/http";
import {
  IconClock,
  IconCalendarStats,
  IconArrowUpRight,
  IconArrowDownRight,
  IconStar,
  IconMoon,
  IconSunrise,
} from "@tabler/icons-react";

type DailyData = {
  date: string;
  totalHours: number;
  avgQuality: number | null;
  sessionCount: number;
  bedtime: string;
  wakeTime: string;
};

type SleepStats = {
  totalSleptHours: number;
  totalNights: number;
  longestSleepHours: number;
  shortestSleepHours: number;
  avgBedTime: string;
  avgWakeTime: string;
  avgQuality: number;
  bestDay: { date: string; totalHours: number; quality: number | null } | null;
  worstDay: { date: string; totalHours: number; quality: number | null } | null;
  consistencyScore: number;
};

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  sub?: string;
}) {
  return (
    <Paper withBorder p="sm">
      <Group justify="space-between" wrap="nowrap" mb={2}>
        <Text size="xs" tt="uppercase" c="dimmed" fw={600}>{label}</Text>
        <ThemeIcon variant="light" color={color} size="sm" radius="xl">
          <Icon size={14} />
        </ThemeIcon>
      </Group>
      <Text size="lg" fw={700}>{value}</Text>
      {sub && <Text size="xs" c="dimmed">{sub}</Text>}
    </Paper>
  );
}

export function AnalyticsTab() {
  const [period, setPeriod] = useState<string>("month");
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, statsRes] = await Promise.all([
        apiFetch<DailyData[]>(`/api/wellness/sleep/analytics${toSearchParams({ period })}`),
        apiFetch<SleepStats>("/api/wellness/sleep/statistics"),
      ]);
      setDailyData(analyticsRes);
      setStats(statsRes);
    } catch {} finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = dailyData.map((d) => ({
    date: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hours: d.totalHours,
    quality: d.avgQuality ?? 0,
  }));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>Analytics</Text>
          <Text size="sm" c="dimmed">Sleep patterns and trends</Text>
        </div>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          data={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "quarter", label: "Quarter" },
            { value: "year", label: "Year" },
          ]}
          size="xs"
        />
      </Group>

      {/* Statistics Cards */}
      {stats && (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
          <StatCard
            label="Total Slept"
            value={formatDuration(stats.totalSleptHours)}
            icon={IconMoon}
            color="indigo"
          />
          <StatCard
            label="Nights Tracked"
            value={String(stats.totalNights)}
            icon={IconCalendarStats}
            color="blue"
          />
          <StatCard
            label="Longest Sleep"
            value={formatDuration(stats.longestSleepHours)}
            icon={IconArrowUpRight}
            color="teal"
          />
          <StatCard
            label="Shortest Sleep"
            value={formatDuration(stats.shortestSleepHours)}
            icon={IconArrowDownRight}
            color="red"
          />
          <StatCard
            label="Avg Bed Time"
            value={stats.avgBedTime}
            icon={IconClock}
            color="violet"
          />
          <StatCard
            label="Avg Wake Time"
            value={stats.avgWakeTime}
            icon={IconSunrise}
            color="blue"
          />
          <StatCard
            label="Avg Quality"
            value={`${stats.avgQuality.toFixed(1)}/10`}
            icon={IconStar}
            color="orange"
          />
          <StatCard
            label="Consistency"
            value={`${stats.consistencyScore}%`}
            icon={IconCalendarStats}
            color={stats.consistencyScore >= 70 ? "teal" : "yellow"}
          />
          {stats.bestDay && (
            <StatCard
              label="Best Day"
              value={new Date(stats.bestDay.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              icon={IconStar}
              color="teal"
              sub={`${formatDuration(stats.bestDay.totalHours)}`}
            />
          )}
          {stats.worstDay && (
            <StatCard
              label="Worst Day"
              value={new Date(stats.worstDay.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              icon={IconStar}
              color="red"
              sub={`${formatDuration(stats.worstDay.totalHours)}`}
            />
          )}
        </SimpleGrid>
      )}

      {/* Daily Sleep Duration Chart */}
      {chartData.length > 0 && (
        <>
          <Paper withBorder p="md">
            <Text size="sm" fw={600} mb="md">Daily Sleep Duration</Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} unit="h" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="hours" fill="#4C6EF5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Sleep Quality Trend */}
          <Paper withBorder p="md">
            <Text size="sm" fw={600} mb="md">Sleep Quality Trend</Text>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#F76707"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Area Chart: Combined */}
          <Paper withBorder p="md">
            <Text size="sm" fw={600} mb="md">Sleep Duration vs Quality</Text>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis yAxisId="left" fontSize={11} unit="h" />
                <YAxis yAxisId="right" orientation="right" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area
                  yAxisId="left"
                  dataKey="hours"
                  fill="#4C6EF5"
                  fillOpacity={0.2}
                  stroke="#4C6EF5"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="quality"
                  stroke="#F76707"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}

      {!loading && chartData.length === 0 && (
        <Paper withBorder p="xl" className="text-center">
          <Text size="lg" fw={600} mb={4}>No data for this period</Text>
          <Text size="sm" c="dimmed">Log more sleep sessions to see analytics.</Text>
        </Paper>
      )}
    </Stack>
  );
}
