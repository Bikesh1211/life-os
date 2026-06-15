"use client";

import { Paper, Text, Timeline, Badge, Group, Stack } from "@mantine/core";
import {
  IconCircleCheck,
  IconTarget,
  IconRepeat,
  IconStar,
  IconAward,
} from "@tabler/icons-react";
import { useXpHistory } from "@/hooks/use-gamification";

const eventIcons: Record<string, React.ElementType> = {
  habit_completed: IconCircleCheck,
  task_completed: IconTarget,
  routine_completed: IconRepeat,
  achievement_bonus: IconStar,
  badge_bonus: IconAward,
  challenge_completed: IconAward,
};

const eventColors: Record<string, string> = {
  habit_completed: "green",
  task_completed: "blue",
  routine_completed: "violet",
  achievement_bonus: "yellow",
  badge_bonus: "orange",
  challenge_completed: "teal",
};

export function ActivityTimeline() {
  const { data: history, isLoading } = useXpHistory(30);

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb="md">
        Recent Activity
      </Text>

      {isLoading ? (
        <Stack gap="sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-[var(--mantine-color-dark-6)]"
            />
          ))}
        </Stack>
      ) : history && history.length > 0 ? (
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {history.map((tx) => {
            const Icon = eventIcons[tx.eventType] ?? IconStar;
            const color = eventColors[tx.eventType] ?? "gray";

            return (
              <Timeline.Item
                key={tx.id}
                bullet={
                  <Icon size={12} style={{ color: `var(--mantine-color-${color}-filled)` }} />
                }
                title={
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {tx.description}
                    </Text>
                    <Badge size="sm" color={color} variant="light">
                      +{tx.xpAmount} XP
                    </Badge>
                  </Group>
                }
              >
                <Text size="xs" c="dimmed">
                  {new Date(tx.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No activity yet. Start completing habits, tasks, and routines to earn XP.
        </Text>
      )}
    </Paper>
  );
}
