"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconPlayerStop,
  IconSquareCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTodayRoutine, useStartExecution, useCompleteExecution, useSkipExecution, useStartExecutionItem } from "@/hooks/use-today-routine";
import { useRoutine } from "@/hooks/use-routines";
import { RoutineTimeline } from "@/modules/routines/components/RoutineTimeline";
import { RoutineProgress } from "@/modules/routines/components/RoutineProgress";

export default function RoutineTimelinePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: routine } = useRoutine(id);
  const { data: todayRoutines, refetch } = useTodayRoutine();
  const startExecution = useStartExecution();
  const completeExecution = useCompleteExecution();
  const skipExecution = useSkipExecution();
  const startItem = useStartExecutionItem();

  const todayRoutine = todayRoutines?.find((r) => r.routine.id === id);
  const execution = todayRoutine?.execution;
  const executionItems = todayRoutine?.executionItems ?? [];

  async function handleStart() {
    if (!execution) return;
    await startExecution.mutateAsync({ routineId: id, executionId: execution.id });
    notifications.show({ title: "Started", message: "Routine started", color: "blue" });
    refetch();
  }

  async function handleComplete() {
    if (!execution) return;
    await completeExecution.mutateAsync({ routineId: id, executionId: execution.id });
    notifications.show({ title: "Completed", message: "Routine completed", color: "green" });
    refetch();
  }

  async function handleSkip() {
    if (!execution) return;
    await skipExecution.mutateAsync({ routineId: id, executionId: execution.id });
    notifications.show({ title: "Skipped", message: "Routine skipped", color: "orange" });
    refetch();
  }

  async function handleStartItem(itemId: string) {
    if (!execution) return;
    await startItem.mutateAsync({ routineId: id, executionId: execution.id, executionItemId: itemId });
    notifications.show({ title: "Started", message: "Activity started", color: "blue" });
    refetch();
  }

  async function handleCompleteItem(itemId: string) {
    const res = await fetch(`/api/routines/${id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ executionId: execution!.id, executionItemId: itemId }),
    });
    if (res.ok) {
      notifications.show({ title: "Completed", message: "Activity completed", color: "green" });
      refetch();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Group mb="md">
          <ActionIcon variant="subtle" component={Link} href={`/routines/${id}`}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600}>{routine?.name ?? "Routine"} — Timeline</Text>
        </Group>

        {todayRoutine && execution && (
          <Paper withBorder p="md" radius="md" mb="lg">
            <RoutineProgress
              routine={todayRoutine}
              onStart={handleStart}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />

            {execution.status === "pending" && (
              <Group mt="sm">
                <Button
                  size="xs"
                  leftSection={<IconPlayerPlay size={14} />}
                  onClick={handleStart}
                  loading={startExecution.isPending}
                >
                  Start Routine
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  leftSection={<IconX size={14} />}
                  onClick={handleSkip}
                  loading={skipExecution.isPending}
                >
                  Skip Today
                </Button>
              </Group>
            )}

            {execution.status === "in_progress" && (
              <Button
                mt="sm"
                size="xs"
                leftSection={<IconSquareCheck size={14} />}
                onClick={handleComplete}
                loading={completeExecution.isPending}
              >
                Complete Routine
              </Button>
            )}
          </Paper>
        )}

        <Paper withBorder p="md" radius="md">
          <Text size="sm" fw={600} mb="md">
            Activity Timeline
          </Text>
          {executionItems.length > 0 ? (
            <RoutineTimeline
              executionItems={executionItems}
              onStartItem={handleStartItem}
              onCompleteItem={handleCompleteItem}
            />
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No activities scheduled for today
            </Text>
          )}
        </Paper>
      </motion.div>
    </div>
  );
}
