"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, Button, Anchor, Table, ActionIcon
} from "@mantine/core";
import { IconWalk, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessStepEntry } from "@/modules/wellness";

export function StepsContent({ entries }: { entries: WellnessStepEntry[] }) {
  const [steps, setSteps] = useState<number | "">(0);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!steps) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/steps", {
        method: "POST",
        body: JSON.stringify({ steps: Number(steps), date: new Date().toISOString().slice(0, 10) }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [steps]);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const avgSteps = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.steps, 0) / entries.length) : 0;
  const maxSteps = entries.length > 0 ? Math.max(...entries.map((e) => e.steps)) : 0;

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconWalk size={24} />
        <Text size="xl" fw={700}>Steps</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{entries.length > 0 ? entries[entries.length - 1].steps.toLocaleString() : "—"}</Text>
          <Text size="xs" c="dimmed">Today</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{avgSteps.toLocaleString()}</Text>
          <Text size="xs" c="dimmed">Daily Avg</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{maxSteps.toLocaleString()}</Text>
          <Text size="xs" c="dimmed">Best Day</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md">
        <Group align="end" gap="sm">
          <NumberInput label="Steps" value={steps} onChange={(v) => setSteps(v as number)} min={0} max={1000000} style={{ flex: 1 }} />
          <Button onClick={handleSave} loading={saving}>Log Steps</Button>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No step entries yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Steps</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                  <Table.Td><Text fw={500}>{e.steps.toLocaleString()}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
