"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconTarget,
  IconCalendarStats,
  IconTrendingUp,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useRoutineDetailAnalytics } from "@/hooks/use-routine-analytics";

export default function RoutineAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: analytics, isLoading } = useRoutineDetailAnalytics(id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
          ))}
        </div>
      </div>
    );
  }

  const dailyData = analytics?.dailyData ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Group mb="md">
          <ActionIcon variant="subtle" component={Link} href={`/routines/${id}`}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600}>Routine Analytics</Text>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
          <Paper withBorder p="md" radius="md">
            <Group gap="xs">
              <IconCalendarStats size={20} className="text-[var(--mantine-color-dimmed)]" />
              <div>
                <Text size="xs" c="dimmed">Total Runs</Text>
                <Text size="xl" fw={700}>{analytics?.totalExecutions ?? 0}</Text>
              </div>
            </Group>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Group gap="xs">
              <IconCheck size={20} className="text-green-500" />
              <div>
                <Text size="xs" c="dimmed">Completed</Text>
                <Text size="xl" fw={700}>{analytics?.completed ?? 0}</Text>
              </div>
            </Group>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Group gap="xs">
              <IconTarget size={20} className="text-blue-500" />
              <div>
                <Text size="xs" c="dimmed">Completion Rate</Text>
                <Text size="xl" fw={700}>{analytics?.completionRate ?? 0}%</Text>
              </div>
            </Group>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Group gap="xs">
              <IconTrendingUp size={20} className="text-violet-500" />
              <div>
                <Text size="xs" c="dimmed">Avg Item Rate</Text>
                <Text size="xl" fw={700}>{analytics?.avgItemCompletionRate ?? 0}%</Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>

        {dailyData.length > 0 && (
          <>
            <Paper withBorder p="md" radius="md" mb="md">
              <Text size="sm" fw={600} mb="md">Daily Completion Rate Trend</Text>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-dark-5)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--mantine-color-dark-7)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                    }}
                  />
                  <Line type="monotone" dataKey="completionRate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="sm" fw={600} mb="md">Daily Execution Status</Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-dark-5)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--mantine-color-dark-7)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="completionRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </>
        )}

        {dailyData.length === 0 && (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text c="dimmed">No execution data yet. Start tracking this routine to see analytics.</Text>
          </Paper>
        )}
      </motion.div>
    </div>
  );
}
