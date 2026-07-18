"use client";

import { Paper, Group, Text, RingProgress, Stack, SimpleGrid } from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconCloud,
  IconChecklist,
  IconClock,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";
import dayjs from "dayjs";

type Props = {
  date: string;
  productivityScore: number | null;
  tasksCompleted: number;
  tasksTotal: number;
  focusMinutes: number;
  completionRate: number;
  streak: number;
  dailyGoalTitle: string | null;
};

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: <IconSun size={20} /> };
  if (hour < 17) return { text: "Good afternoon", icon: <IconCloud size={20} /> };
  return { text: "Good evening", icon: <IconMoon size={20} /> };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "green";
  if (score >= 60) return "blue";
  if (score >= 40) return "yellow";
  return "red";
}

export function DailySummary({
  date,
  productivityScore,
  tasksCompleted,
  tasksTotal,
  focusMinutes,
  completionRate,
  streak,
  dailyGoalTitle,
}: Props) {
  const greeting = getGreeting();
  const dayjsDate = dayjs(date);
  const dayName = dayjsDate.format("dddd");
  const formattedDate = dayjsDate.format("MMMM D, YYYY");
  const score = productivityScore ?? 0;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4}>
          <Group gap="xs">
            {greeting.icon}
            <Text fw={600} size="lg">{greeting.text}</Text>
          </Group>
          <Text fw={700} size="xl">{dayName}</Text>
          <Text size="sm" c="dimmed">{formattedDate}</Text>
          {dailyGoalTitle && (
            <Group gap="xs" mt={4}>
              <IconTarget size={14} />
              <Text size="sm" c="dimmed">Today's goal: </Text>
              <Text size="sm" fw={500}>{dailyGoalTitle}</Text>
            </Group>
          )}
        </Stack>

        <Group gap="lg">
          {productivityScore !== null && (
            <RingProgress
              size={80}
              thickness={8}
              roundCaps
              label={
                <Text size="sm" fw={700} style={{ textAlign: "center" }}>
                  {score}
                </Text>
              }
              sections={[{ value: score, color: getScoreColor(score) }]}
            />
          )}

          <SimpleGrid cols={2} spacing="xs">
            <Paper withBorder p="xs" radius="md" style={{ textAlign: "center" }} miw={90}>
              <Group gap={4} justify="center">
                <IconChecklist size={14} />
                <Text size="xs" c="dimmed">Tasks</Text>
              </Group>
              <Text fw={600} size="sm">{tasksCompleted}/{tasksTotal}</Text>
            </Paper>
            <Paper withBorder p="xs" radius="md" style={{ textAlign: "center" }} miw={90}>
              <Group gap={4} justify="center">
                <IconClock size={14} />
                <Text size="xs" c="dimmed">Focus</Text>
              </Group>
              <Text fw={600} size="sm">{focusMinutes}m</Text>
            </Paper>
            <Paper withBorder p="xs" radius="md" style={{ textAlign: "center" }} miw={90}>
              <Group gap={4} justify="center">
                <IconFlame size={14} />
                <Text size="xs" c="dimmed">Rate</Text>
              </Group>
              <Text fw={600} size="sm">{completionRate}%</Text>
            </Paper>
            <Paper withBorder p="xs" radius="md" style={{ textAlign: "center" }} miw={90}>
              <Group gap={4} justify="center">
                <IconFlame size={14} />
                <Text size="xs" c="dimmed">Streak</Text>
              </Group>
              <Text fw={600} size="sm">{streak}d</Text>
            </Paper>
          </SimpleGrid>
        </Group>
      </Group>
    </Paper>
  );
}
