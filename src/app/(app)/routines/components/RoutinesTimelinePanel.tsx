"use client";

import { motion } from "framer-motion";
import {
  Stack, Group, Text, Paper, Badge, Button, SimpleGrid, RingProgress,
} from "@mantine/core";
import {
  IconPlayerPlay, IconSquareCheck, IconX, IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  useTodayRoutine, useStartExecution, useCompleteExecution, useSkipExecution,
} from "@/hooks/use-today-routine";
import { RoutineTimeline } from "@/modules/routines/components/RoutineTimeline";

function getStatusColor(status: string) {
  switch (status) {
    case "completed": return "green";
    case "in_progress": return "blue";
    case "skipped": return "gray";
    case "missed": return "red";
    default: return "dark";
  }
}

export function RoutinesTimelinePanel() {
  const { data: todayRoutines, isLoading, refetch } = useTodayRoutine();
  const startExecution = useStartExecution();
  const completeExecution = useCompleteExecution();
  const skipExecution = useSkipExecution();

  if (isLoading) {
    return (
      <>
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
          ))}
        </SimpleGrid>
      </>
    );
  }

  const scheduled = todayRoutines ?? [];
  const allItems = scheduled.flatMap((r) => r.executionItems);
  const completed = allItems.filter((i) => i.status === "completed").length;
  const total = allItems.length;
  const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusCounts = {
    pending: scheduled.filter((r) => r.execution.status === "pending").length,
    in_progress: scheduled.filter((r) => r.execution.status === "in_progress").length,
    completed: scheduled.filter((r) => r.execution.status === "completed").length,
    skipped: scheduled.filter((r) => r.execution.status === "skipped").length,
  };

  async function handleStart(routineId: string, executionId: string) {
    await startExecution.mutateAsync({ routineId, executionId });
    refetch();
  }

  async function handleComplete(routineId: string, executionId: string) {
    await completeExecution.mutateAsync({ routineId, executionId });
    refetch();
  }

  async function handleSkip(routineId: string, executionId: string) {
    await skipExecution.mutateAsync({ routineId, executionId });
    refetch();
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
            Today&apos;s Timeline
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed)]">
            Track all your routines for today
          </p>
        </div>

        {total > 0 && (
          <Paper withBorder p="md" radius="md" mb="lg">
            <Group gap="lg">
              <RingProgress
                size={100} thickness={10}
                sections={[{ value: overallProgress, color: overallProgress === 100 ? "green" : "blue" }]}
                label={<Text size="sm" ta="center" fw={700}>{overallProgress}%</Text>}
              />
              <Stack gap={4}>
                <Text size="sm" fw={600}>Overall Progress</Text>
                <Group gap="xs">
                  <Badge color="blue" variant="light" size="sm">{statusCounts.in_progress} In Progress</Badge>
                  <Badge color="green" variant="light" size="sm">{statusCounts.completed} Completed</Badge>
                  <Badge color="gray" variant="light" size="sm">{statusCounts.pending} Pending</Badge>
                </Group>
              </Stack>
            </Group>
          </Paper>
        )}

        {scheduled.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6)]">
              <IconPlayerPlay size={32} className="text-[var(--mantine-color-dimmed)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--mantine-color-text)]">
              No Routines Scheduled Today
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed)]">
              Create a routine and set it to active to see it here.
            </p>
            <Button component={Link} href="/routines" mt="lg" variant="light">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <Stack gap="md">
            {scheduled.map((sr) => {
              const { routine, execution, executionItems } = sr;
              const itemCompleted = executionItems.filter((i) => i.status === "completed").length;
              const itemTotal = executionItems.length;
              const itemProgress = itemTotal > 0 ? Math.round((itemCompleted / itemTotal) * 100) : 0;

              return (
                <Paper key={routine.id} withBorder p="md" radius="md">
                  <Group mb="sm" justify="apart">
                    <Group>
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: routine.color ?? "var(--mantine-color-blue-6)" }} />
                      <Text fw={600}>{routine.name}</Text>
                      <Badge color={getStatusColor(execution.status)} variant="light" size="sm">
                        {execution.status.replace("_", " ")}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      {execution.status === "pending" && (
                        <>
                          <Button size="xs" leftSection={<IconPlayerPlay size={14} />}
                            onClick={() => handleStart(routine.id, execution.id)} loading={startExecution.isPending}>
                            Start
                          </Button>
                          <Button size="xs" variant="light" color="gray" leftSection={<IconX size={14} />}
                            onClick={() => handleSkip(routine.id, execution.id)} loading={skipExecution.isPending}>
                            Skip
                          </Button>
                        </>
                      )}
                      {execution.status === "in_progress" && (
                        <Button size="xs" leftSection={<IconSquareCheck size={14} />}
                          onClick={() => handleComplete(routine.id, execution.id)} loading={completeExecution.isPending}>
                          Complete
                        </Button>
                      )}
                      <Button size="xs" variant="subtle" component={Link}
                        href={`/routines/${routine.id}/timeline`} rightSection={<IconArrowRight size={14} />}>
                        Detail
                      </Button>
                    </Group>
                  </Group>

                  {itemProgress > 0 && (
                    <RingProgress size={60} thickness={6}
                      sections={[{ value: itemProgress, color: itemProgress === 100 ? "green" : "blue" }]}
                      label={<Text size="xs" ta="center" fw={700}>{itemProgress}%</Text>} />
                  )}

                  {executionItems.length > 0 ? (
                    <RoutineTimeline executionItems={executionItems} readonly />
                  ) : (
                    <Text size="sm" c="dimmed" py="sm">No activities scheduled</Text>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </motion.div>
    </>
  );
}
