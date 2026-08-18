"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Paper, Button, TextInput, NumberInput, Select, Badge,
  SimpleGrid, ActionIcon, Skeleton,
} from "@mantine/core";
import { IconArrowLeft, IconBarbell, IconPlus, IconTrash, IconCheck } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

type SetRow = {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number | "";
  weightKg: number | "";
  sortOrder: number;
};

type Props = {
  programDayId?: string;
};

async function fetchExercises() {
  return apiFetch<any[]>("/api/fitness/exercises");
}

export function WorkoutSessionContent({ programDayId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["fitness", "exercises"],
    queryFn: fetchExercises,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      return apiFetch<any>("/api/fitness/workouts", {
        method: "POST",
        body: JSON.stringify({ date, programDayId: programDayId ?? null }),
      });
    },
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const saveSetsMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      const formattedSets = sets.map((s, i) => ({
        ...s,
        sessionId,
        reps: s.reps === "" ? null : s.reps,
        weightKg: s.weightKg === "" ? null : String(s.weightKg),
        sortOrder: i,
      }));
      return apiFetch<any>(`/api/fitness/workouts/${sessionId}/sets`, {
        method: "PUT",
        body: JSON.stringify({ sets: formattedSets }),
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await saveSetsMutation.mutateAsync();
      return apiFetch<any>(`/api/fitness/workouts/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({ _action: "complete" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] });
      router.push(`/fitness/workout/${sessionId}`);
    },
  });

  function addSet() {
    if (!selectedExercise || !exercises) return;
    const exercise = exercises.find((e: { id: string }) => e.id === selectedExercise);
    if (!exercise) return;
    const existingCount = sets.filter((s) => s.exerciseId === selectedExercise).length;
    setSets([
      ...sets,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setNumber: existingCount + 1,
        reps: "",
        weightKg: "",
        sortOrder: sets.length,
      },
    ]);
  }

  function removeSet(index: number) {
    setSets(sets.filter((_, i) => i !== index));
  }

  function updateSet(index: number, field: keyof SetRow, value: unknown) {
    const updated = [...sets];
    (updated[index] as any)[field] = value;
    setSets(updated);
  }

  if (!sessionId && !startMutation.isPending) {
    return (
      <Stack gap="md" p="lg" maw={500} mx="auto">
        <Group>
          <ActionIcon variant="subtle" onClick={() => router.push("/fitness")}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <IconBarbell size={24} />
          <Text fw={700} size="lg">Start Workout</Text>
        </Group>
        <TextInput
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          required
        />
        <Button
          size="lg"
          fullWidth
          onClick={() => startMutation.mutate()}
          loading={startMutation.isPending}
        >
          Begin Workout
        </Button>
      </Stack>
    );
  }

  if (!sessionId) {
    return <Skeleton height={300} radius="md" />;
  }

  return (
    <Stack gap="md">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.push("/fitness")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <IconBarbell size={24} />
        <Text fw={700} size="lg">Workout — {date}</Text>
        <Badge color="yellow" variant="light">In Progress</Badge>
      </Group>

      {/* Add exercise sets */}
      <Paper withBorder p="md">
        <Text fw={600} size="sm" mb="sm">Log Exercise Sets</Text>
        <Group mb="sm">
          <Select
            placeholder="Select exercise"
            data={exercises?.map((e: { id: string; name: string }) => ({
              value: e.id,
              label: e.name,
            })) ?? []}
            value={selectedExercise}
            onChange={(v) => setSelectedExercise(v ?? "")}
            searchable
            style={{ flex: 1 }}
          />
          <Button onClick={addSet} leftSection={<IconPlus size={16} />} disabled={!selectedExercise}>
            Add Set
          </Button>
        </Group>

        {sets.length === 0 ? (
          <Text size="sm" c="dimmed">No sets logged yet. Select an exercise and add sets.</Text>
        ) : (
          <Stack gap="xs">
            {sets.map((set, i) => (
              <Paper key={i} withBorder p="xs">
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={500}>{set.exerciseName} — Set {set.setNumber}</Text>
                  <ActionIcon color="red" variant="subtle" size="sm" onClick={() => removeSet(i)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
                <Group gap="sm">
                  <NumberInput
                    label="Reps"
                    value={set.reps}
                    onChange={(v) => updateSet(i, "reps", v)}
                    min={0}
                    w={80}
                    size="xs"
                  />
                  <NumberInput
                    label="Weight (kg)"
                    value={set.weightKg}
                    onChange={(v) => updateSet(i, "weightKg", v)}
                    min={0}
                    decimalScale={1}
                    w={100}
                    size="xs"
                  />
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Actions */}
      <Group justify="center" gap="md">
        <Button
          variant="light"
          onClick={() => {
            saveSetsMutation.mutate();
          }}
          loading={saveSetsMutation.isPending}
        >
          Save Sets
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: "green", to: "teal" }}
          leftSection={<IconCheck size={18} />}
          onClick={() => completeMutation.mutate()}
          loading={completeMutation.isPending}
        >
          Complete Workout
        </Button>
      </Group>
    </Stack>
  );
}
