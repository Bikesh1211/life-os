"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack, Group, Text, SimpleGrid, Button, Paper, Badge, Modal, TextInput,
  Skeleton, NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconBarbell, IconCalendarBolt, IconTrash } from "@tabler/icons-react";
import { PremiumCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { apiFetch, toSearchParams } from "@/core/api/http";

async function fetchWorkouts() {
  return apiFetch(`/api/fitness/workouts${toSearchParams({ limit: 100 })}`);
}

async function createWorkout(body: { date: string }) {
  return apiFetch("/api/fitness/workouts", { method: "POST", body: JSON.stringify(body) });
}

async function deleteWorkout(id: string) {
  return apiFetch(`/api/fitness/workouts/${id}`, { method: "DELETE" });
}

export function FitnessWorkoutsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["fitness", "workouts"],
    queryFn: fetchWorkouts,
  });

  const createMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] });
      close();
      router.push(`/fitness/workout/${data.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fitness"] }),
  });

  return (
    <Stack gap="md">
      <PageHeader
        title="Workout History"
        subtitle="Track and review your completed workouts"
      >
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          New Workout
        </Button>
      </PageHeader>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={120} radius="md" />
          ))}
        </SimpleGrid>
      ) : !sessions || sessions.length === 0 ? (
        <PremiumCard variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a" }} padding="lg">
          <Text fw={600} size="lg" c="white">No Workouts Yet</Text>
          <Text size="sm" c="white" opacity={0.8} mb="md">
            Log your first workout to start tracking your fitness journey.
          </Text>
          <Button variant="white" onClick={open}>Log First Workout</Button>
        </PremiumCard>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {sessions.map((session: {
            id: string; date: string; name?: string; durationMinutes?: number;
            mood?: number; isCompleted: boolean; programDayId?: string;
          }) => (
            <PremiumCard
              key={session.id}
              variant="interactive"
              padding="md"
              motionProps={{ onClick: () => router.push(`/fitness/workout/${session.id}`) }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm">{session.name ?? "Workout"}</Text>
                {session.isCompleted ? (
                  <Badge size="sm" color="green" variant="light">Done</Badge>
                ) : (
                  <Badge size="sm" color="yellow" variant="light">In Progress</Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" mb="sm">{session.date}</Text>
              <Group gap="xs">
                {session.durationMinutes && (
                  <Badge size="sm" variant="outline">{session.durationMinutes} min</Badge>
                )}
                {session.mood && (
                  <Badge size="sm" variant="outline" color="blue">Mood: {session.mood}/5</Badge>
                )}
              </Group>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                mt="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(session.id);
                }}
              >
                <IconTrash size={14} />
              </Button>
            </PremiumCard>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title="New Workout" centered>
        <Stack gap="md">
          <TextInput
            label="Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.currentTarget.value)}
            required
          />
          <Button
            onClick={() => createMutation.mutate({ date: newDate })}
            loading={createMutation.isPending}
          >
            Start Workout
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
