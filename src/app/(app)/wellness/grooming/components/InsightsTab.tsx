"use client";

import { Stack, Group, Text, Paper, SimpleGrid, RingProgress, ThemeIcon, Badge, Alert, Box } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconBulb,
  IconCheck,
  IconFlame,
  IconChartBar,
  IconCalendarStats,
  IconTrendingUp,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#4FC3F7", "#81C784", "#FFB74D", "#F48FB1", "#CE93D8", "#FF8A65", "#90CAF9", "#A1887F"];

function InsightCard({ type, message }: { type: string; message: string }) {
  const color = type === "positive" ? "green" : type === "negative" ? "red" : "yellow";

  return (
    <Alert icon={type === "positive" ? <IconCheck size={16} /> : type === "negative" ? <IconAlertTriangle size={16} /> : <IconBulb size={16} />} color={color}>
      {message}
    </Alert>
  );
}

export function InsightsTab() {
  const { data: stats } = useQuery({
    queryKey: ["wellness", "grooming", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["wellness", "grooming", "activities"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/activities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: insights } = useQuery({
    queryKey: ["wellness", "grooming", "insights"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/insights");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const list = activities ?? [];

  const categoryCount = list.reduce((acc: Record<string, number>, a: any) => {
    const cat = a.groomingCategory ?? "uncategorized";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({
    name: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));

  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: 0,
    };
  });

  const totalActivities = list.length;
  const overdueCount = list.filter((a: any) => a.nextDueDate && a.nextDueDate < new Date().toISOString().slice(0, 10) && !a.isCompletedToday).length;
  const completedPct = totalActivities > 0 ? Math.round(((totalActivities - overdueCount) / totalActivities) * 100) : 0;

  return (
    <Stack gap="lg">
      <PageHeader title="Grooming Insights" subtitle="Analytics and smart suggestions" />

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Paper withBorder p="md" radius="lg" ta="center">
          <RingProgress
            size={100}
            thickness={10}
            sections={[{ value: completedPct, color: completedPct >= 80 ? "green" : completedPct >= 50 ? "yellow" : "red" }]}
            label={<Text fw={700} size="xl" ta="center">{completedPct}%</Text>}
          />
          <Text size="sm" c="dimmed">Overall Completion</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg" ta="center">
          <RingProgress
            size={100}
            thickness={10}
            sections={[{ value: Math.min(100, ((stats?.currentStreak ?? 0) / 30) * 100), color: "orange" }]}
            label={<Text fw={700} size="xl" ta="center">{stats?.currentStreak ?? 0}</Text>}
          />
          <Text size="sm" c="dimmed">Current Streak</Text>
        </Paper>
        <Paper withBorder p="md" radius="lg" ta="center">
          <RingProgress
            size={100}
            thickness={10}
            sections={[{ value: stats?.groomingScore ?? 0, color: "teal" }]}
            label={<Text fw={700} size="xl" ta="center">{stats?.groomingScore ?? 0}</Text>}
          />
          <Text size="sm" c="dimmed">Grooming Score</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="lg">
        <Group mb="md">
          <IconChartBar size={18} />
          <Text fw={600}>Category Breakdown</Text>
        </Group>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Text c="dimmed" size="sm" ta="center" py="xl">No activities to show</Text>
        )}
      </Paper>

      <Paper withBorder p="md" radius="lg">
        <Group mb="md">
          <IconTrendingUp size={18} />
          <Text fw={600}>Weekly Trend</Text>
        </Group>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#4FC3F7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {insights && insights.length > 0 && (
        <Paper withBorder p="md" radius="lg">
          <Group mb="md">
            <IconBulb size={18} />
            <Text fw={600}>Smart Suggestions</Text>
          </Group>
          <Stack gap="xs">
            {insights.map((insight: any, i: number) => (
              <InsightCard key={i} type={insight.type} message={insight.message} />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
