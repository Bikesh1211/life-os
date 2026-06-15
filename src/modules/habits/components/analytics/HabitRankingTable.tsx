"use client";

import { Paper, Text, Badge, Group, Table } from "@mantine/core";
import { motion } from "framer-motion";
import type { RankingsData } from "@/hooks/use-habit-analytics";
import { useHabitRankings } from "@/hooks/use-habit-analytics";
import { IconArrowUp, IconArrowDown, IconMinus } from "@tabler/icons-react";

type Props = {
  filters?: Record<string, string>;
};

const categoryColors: Record<string, string> = {
  health: "red",
  fitness: "orange",
  reading: "yellow",
  learning: "green",
  productivity: "blue",
  mindfulness: "violet",
  finance: "pink",
  social: "teal",
  creative: "indigo",
};

export function HabitRankingTable({ filters }: Props) {
  const { data, isLoading } = useHabitRankings(filters);

  if (isLoading) {
    return (
      <Paper withBorder p="md" radius="md">
        <div className="h-64 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
      </Paper>
    );
  }

  if (!data || data.byCompletionRate.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No ranking data available.
        </Text>
      </Paper>
    );
  }

  const rows = data.byCompletionRate.map((item: Record<string, unknown>, i: number) => {
    const rate = item.rate as number;
    const prevRate = i < data.byCompletionRate.length - 1
      ? (data.byCompletionRate[i + 1].rate as number)
      : rate;
    let trendIcon = <IconMinus size={14} className="text-gray-400" />;
    if (rate > prevRate) trendIcon = <IconArrowUp size={14} className="text-green-400" />;
    else if (rate < prevRate) trendIcon = <IconArrowDown size={14} className="text-red-400" />;

    return (
      <Table.Tr key={item.habitId as string}>
        <Table.Td>
          <Group gap="xs">
            <Text size="sm" c="dimmed" w={20}>
              {i + 1}
            </Text>
            <div>
              <Text size="sm" fw={500}>
                {item.title as string}
              </Text>
              <Text size="xs" c="dimmed">
                {(item.frequency as string)?.charAt(0).toUpperCase() + (item.frequency as string)?.slice(1)}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge
            size="sm"
            variant="light"
            color={categoryColors[(item.category as string) ?? ""] ?? "gray"}
          >
            {(item.category as string) ?? "Other"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap={4}>
            <Text size="sm" fw={600}>
              {rate}%
            </Text>
            {trendIcon}
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{item.completed as number}/{item.expected as number}</Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb="sm">
        Habit Performance Ranking
      </Text>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Habit</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Rate</Table.Th>
            <Table.Th>Complete</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Paper>
  );
}
