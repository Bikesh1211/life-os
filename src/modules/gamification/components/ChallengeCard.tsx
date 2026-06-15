"use client";

import { Paper, Group, Text, Badge, RingProgress, Stack } from "@mantine/core";
import { IconTarget, IconCheck } from "@tabler/icons-react";

type ChallengeCardProps = {
  name: string;
  description: string;
  challengeType: string;
  xpReward: number;
  progress: number;
  criteriaValue: number;
  isCompleted: boolean;
};

export function ChallengeCard({
  name,
  description,
  challengeType,
  xpReward,
  progress,
  criteriaValue,
  isCompleted,
}: ChallengeCardProps) {
  const pct = Math.min(100, Math.round((progress / criteriaValue) * 100));
  const color = isCompleted ? "green" : pct > 0 ? "yellow" : "dark";

  const typeColor =
    challengeType === "daily"
      ? "blue"
      : challengeType === "weekly"
        ? "violet"
        : "teal";

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="md" wrap="nowrap">
        <RingProgress
          size={70}
          thickness={7}
          sections={[{ value: pct, color }]}
          label={
            isCompleted ? (
              <IconCheck size={18} className="text-green-500" />
            ) : (
              <Text size="xs" ta="center" fw={700}>
                {pct}%
              </Text>
            )
          }
        />

        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600} size="sm">
              {name}
            </Text>
            <Badge size="xs" variant="light" color={typeColor}>
              {challengeType}
            </Badge>
          </Group>

          <Text size="xs" c="dimmed" lineClamp={1}>
            {description}
          </Text>

          <Group gap="xs">
            <Badge size="xs" variant="outline" color="yellow">
              +{xpReward} XP
            </Badge>
            <Text size="xs" c="dimmed">
              {progress}/{criteriaValue}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
