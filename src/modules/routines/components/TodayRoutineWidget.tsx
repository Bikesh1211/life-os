"use client";

import { Paper, Group, Text, Button, Badge, Stack, RingProgress } from "@mantine/core";
import { IconPlayerPlay, IconSquareCheck, IconX, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useTodayRoutine, useStartExecution, useSkipExecution } from "@/hooks/use-today-routine";

export function TodayRoutineWidget() {
  const { data: routines, isLoading } = useTodayRoutine();
  const startExecution = useStartExecution();
  const skipExecution = useSkipExecution();

  if (isLoading) {
    return (
      <Paper withBorder p="md" radius="md">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <div className="mt-3 h-16 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
      </Paper>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" fw={600} mb="xs">Today's Routine</Text>
        <Text size="xs" c="dimmed">
          No routines scheduled for today.
        </Text>
        <Button
          component={Link}
          href="/routines"
          variant="light"
          size="xs"
          mt="sm"
          rightSection={<IconArrowRight size={14} />}
        >
          Create a Routine
        </Button>
      </Paper>
    );
  }

  const primaryRoutine = routines[0];
  const { execution, executionItems } = primaryRoutine;
  const completed = executionItems.filter((i) => i.status === "completed").length;
  const total = executionItems.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const currentItem = executionItems.find((i) => i.status === "in_progress");
  const nextItem = executionItems.find(
    (i) => i.status === "pending" && i.routineItem,
  );

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text size="sm" fw={600}>Today's Routine</Text>
        <Badge
          size="sm"
          color={execution.status === "completed" ? "green" : execution.status === "in_progress" ? "blue" : "yellow"}
        >
          {execution.status === "completed"
            ? "Done"
            : execution.status === "in_progress"
              ? "In Progress"
              : "Not Started"}
        </Badge>
      </Group>

      <Group gap="md">
        <RingProgress
          size={60}
          thickness={6}
          sections={[{ value: progress, color: progress === 100 ? "green" : "blue" }]}
          label={
            <Text size="xs" ta="center" fw={700}>
              {progress}%
            </Text>
          }
        />

        <Stack gap={2} className="flex-1">
          <Text size="sm" fw={500} lineClamp={1}>
            {primaryRoutine.routine.name}
          </Text>
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
            <Text size="xs" c="green">All done for today!</Text>
          )}
          <Text size="xs" c="dimmed">
            {completed}/{total} activities
          </Text>
        </Stack>
      </Group>

      {execution.status === "pending" && (
        <Group mt="sm">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlayerPlay size={12} />}
            onClick={() => startExecution.mutate({ routineId: primaryRoutine.routine.id, executionId: execution.id })}
            loading={startExecution.isPending}
          >
            Start
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconX size={12} />}
            onClick={() => skipExecution.mutate({ routineId: primaryRoutine.routine.id, executionId: execution.id })}
            loading={skipExecution.isPending}
          >
            Skip
          </Button>
        </Group>
      )}

      <Button
        component={Link}
        href={`/routines/${primaryRoutine.routine.id}/timeline`}
        variant="subtle"
        size="xs"
        fullWidth
        mt="xs"
        rightSection={<IconArrowRight size={12} />}
      >
        View Timeline
      </Button>
    </Paper>
  );
}
