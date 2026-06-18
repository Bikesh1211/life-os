"use client";

import { Stack, Group, Text, Paper, SimpleGrid, Anchor, ActionIcon } from "@mantine/core";
import { IconArrowLeft, IconRun, IconWalk, IconFlame } from "@tabler/icons-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import type { FitnessSummary } from "@/modules/health";

export function FitnessContent({ summary }: { summary: FitnessSummary }) {
  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/health">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconRun size={24} />
        <Text size="xl" fw={700}>Fitness</Text>
      </Group>

      {/* Summary stats */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.totalWorkoutMinutesWeek}</Text>
          <Text size="xs" c="dimmed">Minutes This Week</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.totalWorkoutMinutesMonth}</Text>
          <Text size="xs" c="dimmed">Minutes This Month</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.totalCaloriesBurned > 0 ? summary.totalCaloriesBurned : "—"}</Text>
          <Text size="xs" c="dimmed">Calories Burned</Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Workout by type */}
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Workouts by Type (30 days)</Text>
          {summary.workoutByType.length === 0 ? (
            <Text size="xs" c="dimmed">No workouts yet.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.workoutByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={80} />
                <ReTooltip />
                <Bar dataKey="minutes" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Step trend */}
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Daily Steps</Text>
          {summary.stepTrend.length === 0 ? (
            <Text size="xs" c="dimmed">No step data yet.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summary.stepTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ReTooltip />
                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </SimpleGrid>

      {/* Avg daily steps */}
      {summary.avgDailySteps > 0 && (
        <Paper withBorder p="sm">
          <Group justify="center">
            <IconWalk size={18} />
            <Text size="lg" fw={600}>Average: {summary.avgDailySteps.toLocaleString()} steps/day</Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
