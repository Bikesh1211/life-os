"use client";

import { Paper, Group, Text, Stack, SimpleGrid } from "@mantine/core";
import {
  IconChecklist,
  IconRepeat,
  IconTarget,
  IconStar,
  IconTrendingUp,
  IconCalendarStats,
  IconFlame,
  IconBrain,
} from "@tabler/icons-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
};

function StatCard({ label, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <Paper withBorder p="md" radius="md" className="group transition-all hover:shadow-md">
      <Group gap="sm" wrap="nowrap">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110"
          style={{ backgroundColor: `var(--mantine-color-${color}-light)` }}
        >
          <Icon size={22} style={{ color: `var(--mantine-color-${color}-filled)` }} />
        </div>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {label}
          </Text>
          <Text fw={800} size="28" style={{ lineHeight: 1.2 }}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

type StatisticsGridProps = {
  habits: {
    totalHabits: number;
    completionRate: number;
    totalCompletions: number;
    currentStreak: number;
  } | null;
  routines: {
    routineCount: number;
    completionRate: number;
    totalCompleted: number;
    consistencyScore: number;
  } | null;
  tasks: {
    total: number;
    done: number;
    todo: number;
    inProgress: number;
  } | null;
  goals: {
    total: number;
    active: number;
    completed: number;
  };
};

export function StatisticsGrid({ habits, routines, tasks, goals }: StatisticsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <StatCard
        label="Habits Completed"
        value={habits?.totalCompletions ?? 0}
        subtitle={`${habits?.totalHabits ?? 0} total habits`}
        icon={IconChecklist}
        color="green"
      />
      <StatCard
        label="Tasks Done"
        value={tasks?.done ?? 0}
        subtitle={`${tasks?.todo ?? 0} remaining`}
        icon={IconTarget}
        color="blue"
      />
      <StatCard
        label="Routines Completed"
        value={routines?.totalCompleted ?? 0}
        subtitle={`${routines?.routineCount ?? 0} routines`}
        icon={IconRepeat}
        color="violet"
      />
      <StatCard
        label="Goals Completed"
        value={goals.completed}
        subtitle={`${goals.active} active`}
        icon={IconStar}
        color="teal"
      />
    </SimpleGrid>
  );
}
