"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, TextInput, Button, Anchor, Table, Badge, ActionIcon
} from "@mantine/core";
import { IconRun, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessWorkoutEntry } from "@/modules/wellness";

export function WorkoutsContent({ entries }: { entries: WellnessWorkoutEntry[] }) {
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState<number | "">(30);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!workoutType || !duration) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/workouts", {
        method: "POST",
        body: JSON.stringify({
          workoutType, durationMinutes: Number(duration),
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [workoutType, duration]);

  const handleDelete = useCallback(async (id: string) => {
    await apiFetch(`/api/wellness/workouts/${id}`, { method: "DELETE" });
    window.location.reload();
  }, []);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalMin = entries.reduce((s, w) => s + w.durationMinutes, 0);
  const totalCal = entries.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0);
  const grouped = Object.entries(
    entries.reduce<Record<string, number>>((acc, w) => {
      acc[w.workoutType] = (acc[w.workoutType] ?? 0) + w.durationMinutes;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconRun size={24} />
        <Text size="xl" fw={700}>Workouts</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{entries.length}</Text>
          <Text size="xs" c="dimmed">Sessions</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{totalMin}</Text>
          <Text size="xs" c="dimmed">Total Minutes</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{totalCal > 0 ? totalCal : "—"}</Text>
          <Text size="xs" c="dimmed">Calories Burned</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md">
        <Group align="end" gap="sm">
          <TextInput label="Workout Type" placeholder="Running, Yoga..." value={workoutType} onChange={(e) => setWorkoutType(e.currentTarget.value)} style={{ flex: 1 }} />
          <NumberInput label="Minutes" value={duration} onChange={(v) => setDuration(v as number)} min={1} w={100} />
          <Button onClick={handleSave} loading={saving}>Log Workout</Button>
        </Group>
      </Paper>

      {grouped.length > 0 && (
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">By Type</Text>
          {grouped.map(([type, mins]) => (
            <Group key={type} justify="space-between" mb={4}>
              <Text size="sm">{type}</Text>
              <Text size="sm" fw={500}>{mins} min</Text>
            </Group>
          ))}
        </Paper>
      )}

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No workouts yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Calories</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.slice(0, 50).map((w) => (
                <Table.Tr key={w.id}>
                  <Table.Td>{new Date(w.date).toLocaleDateString()}</Table.Td>
                  <Table.Td><Badge>{w.workoutType}</Badge></Table.Td>
                  <Table.Td>{w.durationMinutes} min</Table.Td>
                  <Table.Td>{w.caloriesBurned ?? "—"}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(w.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
