"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, Button, Anchor, Table, Badge, ActionIcon
} from "@mantine/core";
import { IconWeight, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import type { WellnessWeightEntry } from "@/modules/wellness";

export function WeightContent({ entries }: { entries: WellnessWeightEntry[] }) {
  const [weightKg, setWeightKg] = useState<number | "">(70);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!weightKg) return;
    setSaving(true);
    try {
      await fetch("/api/wellness/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: Number(weightKg), date: new Date().toISOString().slice(0, 10) }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [weightKg]);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/wellness/weight/${id}`, { method: "DELETE" });
    window.location.reload();
  }, []);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconWeight size={24} />
        <Text size="xl" fw={700}>Weight Tracking</Text>
      </Group>

      <Paper withBorder p="md">
        <Group align="end" gap="sm">
          <NumberInput
            label="Weight (kg)"
            value={weightKg}
            onChange={(v) => setWeightKg(v as number)}
            min={20}
            max={500}
            decimalScale={1}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSave} loading={saving}>Log Weight</Button>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History ({sorted.length} entries)</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No weight entries yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Weight</Table.Th>
                <Table.Th>Body Fat</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                  <Table.Td><Badge>{e.weightKg} kg</Badge></Table.Td>
                  <Table.Td>{e.bodyFatPercentage ? `${e.bodyFatPercentage}%` : "—"}</Table.Td>
                  <Table.Td>{e.notes ?? "—"}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(e.id)}>
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
