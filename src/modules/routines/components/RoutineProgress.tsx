"use client";

import { Group, Text, RingProgress, Stack, Badge } from "@mantine/core";
import dayjs from "dayjs";
import type { TodayRoutine } from "@/hooks/use-today-routine";

type RoutineProgressProps = {
  routine: TodayRoutine;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
};

export function RoutineProgress({ routine, onStart, onComplete, onSkip }: RoutineProgressProps) {
  const { execution, executionItems } = routine;
  const completed = executionItems.filter((i) => i.status === "completed").length;
  const inProgress = executionItems.filter((i) => i.status === "in_progress").length;
  const total = executionItems.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const currentItem = executionItems.find((i) => i.status === "in_progress");
  const nextItem = executionItems.find(
    (i) => i.status === "pending" && i.routineItem,
  );
  const now = dayjs();

  return (
    <div className="flex items-center gap-4">
      <RingProgress
        size={80}
        thickness={8}
        sections={[{ value: progress, color: progress === 100 ? "green" : "blue" }]}
        label={
          <Text size="xs" ta="center" fw={700}>
            {progress}%
          </Text>
        }
      />

      <Stack gap={4} className="flex-1">
        <Text size="sm" fw={600}>
          {routine.routine.name}
        </Text>

        <Group gap="xs">
          <Badge size="sm" color={execution.status === "in_progress" ? "blue" : "yellow"}>
            {execution.status === "in_progress" ? "In Progress" : "Not Started"}
          </Badge>
          <Text size="xs" c="dimmed">
            {completed}/{total} done
          </Text>
        </Group>

        {currentItem && (
          <Text size="xs" c="blue">
            Current: {currentItem.routineItem?.title}
          </Text>
        )}
        {!currentItem && nextItem && execution.status !== "completed" && (
          <Text size="xs" c="dimmed">
            Next: {nextItem.routineItem?.title} at {nextItem.routineItem?.startTime}
          </Text>
        )}
        {execution.status === "completed" && (
          <Text size="xs" c="green">
            All activities completed
          </Text>
        )}
      </Stack>
    </div>
  );
}
