"use client";

import {
  Stack,
  Group,
  Text,
  Paper,
  Progress,
  SimpleGrid,
} from "@mantine/core";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";

type TimeCategory = { id: string; name: string; icon: string; color: string };
type CategoryDistribution = { categoryId: string | null; totalMinutes: number; sessionCount: number };
type DayDistribution = { date: string; totalMinutes: number; sessionCount: number };
type TrendData = { week: string; totalMinutes: number; sessionCount: number };
type BudgetProgress = { id: string; categoryId: string; period: string; targetMinutes: number; actualMinutes: number; remainingMinutes: number; percentage: number; isExceeded: boolean };

const CATEGORY_COLORS = [
  "#4C6EF5", "#7C3AED", "#E64980", "#FA5252", "#FD7E14",
  "#FAB005", "#40C057", "#15AABF", "#1C7ED6", "#7950F2",
  "#F06595", "#FF6B6B", "#F59F00", "#868E96", "#ADB5BD",
];

function aggregateByPeriod(bars: { date: string; totalMinutes: number; sessionCount: number }[], period: string) {
  if (period === "year" || period === "all_time") {
    const grouped = new Map<string, { totalMinutes: number; sessionCount: number }>();
    for (const b of bars) {
      const key = period === "year" ? dayjs(b.date).format("MMM") : dayjs(b.date).format("MMM YY");
      const existing = grouped.get(key) ?? { totalMinutes: 0, sessionCount: 0 };
      existing.totalMinutes += b.totalMinutes;
      existing.sessionCount += b.sessionCount;
      grouped.set(key, existing);
    }
    return Array.from(grouped.entries()).map(([label, data]) => ({
      day: label,
      hours: Math.round((data.totalMinutes / 60) * 10) / 10,
      fullDate: label,
    }));
  }
  return bars.map((d) => ({
    day: dayjs(d.date).format("ddd"),
    hours: Math.round((d.totalMinutes / 60) * 10) / 10,
    fullDate: d.date,
  }));
}

function ChartCard({ title, children, height }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <Paper withBorder p="md" radius="lg">
      <Text size="sm" fw={600} mb="md">{title}</Text>
      <div style={{ height: height ?? 300 }}>{children}</div>
    </Paper>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <Text size="sm" c="dimmed">{message}</Text>
    </div>
  );
}

export default function OverviewCharts({
  byCategory,
  byDay,
  trend,
  budgets,
  categories,
  periodLabel,
}: {
  byCategory: CategoryDistribution[];
  byDay: DayDistribution[];
  trend: TrendData[];
  budgets: BudgetProgress[];
  categories: TimeCategory[];
  periodLabel: string;
}) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const pieData = byCategory.map((c) => ({
    name: categoryMap.get(c.categoryId ?? "")?.name ?? "Uncategorized",
    value: c.totalMinutes,
    color: categoryMap.get(c.categoryId ?? "")?.color ?? "gray",
    sessions: c.sessionCount,
    hours: Math.round((c.totalMinutes / 60) * 10) / 10,
  }));

  const barData = aggregateByPeriod(byDay, periodLabel === "Today" ? "today" : periodLabel === "This Week" ? "week" : periodLabel === "This Month" ? "month" : periodLabel === "This Year" ? "year" : "all_time");

  const trendData = trend.map((t) => ({
    week: t.week,
    hours: Math.round((t.totalMinutes / 60) * 10) / 10,
  }));

  const chartTitle = byDay.length > 0
    ? `Time Breakdown (${periodLabel})`
    : "Time Breakdown";

  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ChartCard title="Time by Category" height={300}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }: any) => `${name} ${Math.round(value / 60 * 10) / 10}h`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={((value: any) => `${Math.round(Number(value) / 60 * 10) / 10}h`) as any} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No data" />
          )}
        </ChartCard>

        <ChartCard title={chartTitle} height={300}>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="day" stroke="var(--mantine-color-dimmed)" fontSize={12} />
                <YAxis stroke="var(--mantine-color-dimmed)" fontSize={12} unit="h" />
                <RechartsTooltip formatter={((value: any) => `${Number(value)}h`) as any} />
                <Bar dataKey="hours" fill="var(--mantine-color-blue-6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No entries" />
          )}
        </ChartCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ChartCard title="Weekly Trend (Last 12 Weeks)" height={250}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="week" stroke="var(--mantine-color-dimmed)" fontSize={10} />
                <YAxis stroke="var(--mantine-color-dimmed)" fontSize={12} unit="h" />
                <RechartsTooltip formatter={((value: any) => `${Number(value)}h`) as any} />
                <Line type="monotone" dataKey="hours" stroke="var(--mantine-color-indigo-6)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Not enough data for trend" />
          )}
        </ChartCard>

        <ChartCard title="Budget Progress" height={250}>
          {budgets.length > 0 ? (
            <Stack gap="sm">
              {budgets.slice(0, 6).map((b) => {
                const cat = categoryMap.get(b.categoryId);
                return (
                  <div key={b.id}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">{cat?.name ?? "Unknown"}</Text>
                      <Text size="xs" c="dimmed">
                        {Math.round(b.actualMinutes / 60 * 10) / 10}h / {Math.round(b.targetMinutes / 60 * 10) / 10}h
                      </Text>
                    </Group>
                    <Progress
                      value={Math.min(b.percentage, 100)}
                      color={b.isExceeded ? "red" : "blue"}
                      size="md"
                      radius="md"
                    />
                  </div>
                );
              })}
            </Stack>
          ) : (
            <EmptyState message="No budgets set" />
          )}
        </ChartCard>
      </SimpleGrid>
    </>
  );
}
