"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, TextInput, NumberInput, Select, Button, Anchor, Table, Badge, ActionIcon, Progress, ThemeIcon, Tooltip
} from "@mantine/core";
import { IconTargetArrow, IconTrophy, IconPlus, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessUserGoal, WellnessAchievement } from "@/modules/wellness";

export function GoalsContent({
  goals,
  achievements,
}: {
  goals: WellnessUserGoal[];
  achievements: WellnessAchievement[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState("weight");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState<number | "">(0);
  const [unit, setUnit] = useState("kg");
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!title || !targetValue) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/goals", {
        method: "POST",
        body: JSON.stringify({
          goalType, title, targetValue: Number(targetValue), unit,
          startDate: new Date().toISOString().slice(0, 10),
        }),
      });
      setShowForm(false);
      setTitle("");
      setTargetValue(0);
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [goalType, title, targetValue, unit]);

  const handleDelete = useCallback(async (id: string) => {
    await apiFetch(`/api/wellness/goals/${id}`, { method: "DELETE" });
    window.location.reload();
  }, []);

  const handleUpdate = useCallback(async (id: string, currentValue: number) => {
    const newVal = prompt("Enter current value:", String(currentValue));
    if (newVal === null) return;
    await apiFetch(`/api/wellness/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify({ currentValue: Number(newVal) }),
    });
    window.location.reload();
  }, []);

  const active = goals.filter((g) => g.isActive);
  const completed = goals.filter((g) => !g.isActive);

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconTargetArrow size={24} />
        <Text size="xl" fw={700}>Goals & Achievements</Text>
        <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setShowForm(!showForm)} ml="auto">
          New Goal
        </Button>
      </Group>

      {showForm && (
        <Paper withBorder p="md">
          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="sm">
            <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Lose 5kg" required />
            <Select label="Type" data={["weight", "steps", "workouts", "calories", "water", "sleep", "custom"]} value={goalType} onChange={(v) => setGoalType(v ?? "custom")} />
            <NumberInput label="Target" value={targetValue} onChange={(v) => setTargetValue(v as number)} min={0} required />
            <TextInput label="Unit" value={unit} onChange={(e) => setUnit(e.currentTarget.value)} />
          </SimpleGrid>
          <Button fullWidth mt="sm" onClick={handleCreate} loading={saving}>Create Goal</Button>
        </Paper>
      )}

      {achievements.length > 0 && (
        <>
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">Achievements ({achievements.length})</Text>
          <Group gap="xs">
            {achievements.map((a) => (
              <Tooltip key={a.id} label={a.title}>
                <ThemeIcon variant="light" color="yellow" size="lg" radius="xl">
                  <IconTrophy size={18} />
                </ThemeIcon>
              </Tooltip>
            ))}
          </Group>
        </>
      )}

      {active.length > 0 && (
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Active Goals</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Goal</Table.Th>
                <Table.Th>Progress</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {active.map((g) => {
                const progress = Number(g.targetValue) > 0
                  ? Math.min(100, Math.round((Number(g.currentValue) / Number(g.targetValue)) * 100))
                  : 0;
                return (
                  <Table.Tr key={g.id}>
                    <Table.Td>
                      <Text fw={500}>{g.goalType}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Progress value={progress} size="lg" style={{ flex: 1 }} color={progress >= 100 ? "teal" : "blue"} />
                        <Text size="xs" fw={500}>{Number(g.currentValue)}/{Number(g.targetValue)} {g.unit}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={progress >= 100 ? "teal" : "blue"}>{progress}%</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Button size="xs" variant="light" onClick={() => handleUpdate(g.id, Number(g.currentValue))}>
                          Update
                        </Button>
                        <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(g.id)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {completed.length > 0 && (
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Completed Goals</Text>
          {completed.map((g) => (
            <Group key={g.id} gap="xs" mb={4}>
              <Text size="sm">{g.goalType}</Text>
              <Badge size="sm" color="gray">{Number(g.currentValue)}/{Number(g.targetValue)} {g.unit}</Badge>
            </Group>
          ))}
        </Paper>
      )}

      {goals.length === 0 && achievements.length === 0 && (
        <Text size="sm" c="dimmed">No goals or achievements yet. Create your first goal above.</Text>
      )}
    </Stack>
  );
}
