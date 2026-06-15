"use client";

import { Paper, Group, Text, ThemeIcon, Badge, ActionIcon, Stack, Switch } from "@mantine/core";
import {
  IconSunrise,
  IconBook,
  IconBrain,
  IconRun,
  IconMoon,
  IconRepeat,
  IconDotsVertical,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Routine } from "@/hooks/use-routines";

const iconMap: Record<string, React.ElementType> = {
  sunrise: IconSunrise,
  book: IconBook,
  brain: IconBrain,
  run: IconRun,
  moon: IconMoon,
};

type RoutineCardProps = {
  routine: Routine;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

export function RoutineCard({ routine, onToggleActive, onDuplicate, onDelete }: RoutineCardProps) {
  const Icon = routine.icon ? iconMap[routine.icon] : IconRepeat;

  return (
    <Paper withBorder p="md" radius="md" className="relative">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              variant="light"
              color={routine.color ?? "blue"}
              size="lg"
              radius="md"
            >
              <Icon size={20} />
            </ThemeIcon>
            <div>
              <Link
                href={`/routines/${routine.id}`}
                className="text-sm font-semibold no-underline hover:underline"
                style={{ color: "var(--mantine-color-text)" }}
              >
                {routine.name}
              </Link>
              {routine.description && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {routine.description}
                </Text>
              )}
            </div>
          </Group>
          <Group gap={4} wrap="nowrap">
            <Badge
              size="sm"
              variant={routine.isActive ? "filled" : "outline"}
              color={routine.isActive ? "green" : "gray"}
            >
              {routine.isActive ? "Active" : "Paused"}
            </Badge>
            <ActionIcon variant="subtle" size="sm" onClick={() => onDuplicate(routine.id)}>
              <IconCopy size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(routine.id)}>
              <IconTrash size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm">
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {routine.items?.length ?? 0} activities
            {" · "}
            {routine.scheduleType === "daily"
              ? "Every day"
              : routine.scheduleType === "weekdays"
                ? "Weekdays"
                : routine.scheduleType === "weekends"
                  ? "Weekends"
                  : "Custom days"}
          </Text>
          <Switch
            size="sm"
            checked={routine.isActive}
            onChange={() => onToggleActive(routine.id, !routine.isActive)}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
