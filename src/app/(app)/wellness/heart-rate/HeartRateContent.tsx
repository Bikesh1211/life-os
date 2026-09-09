"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, Button, Anchor, Table, ActionIcon
} from "@mantine/core";
import { IconActivity, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessHeartRateEntry } from "@/modules/wellness";

export function HeartRateContent({ entries }: { entries: WellnessHeartRateEntry[] }) {
  const [resting, setResting] = useState<number | "">(60);
  const [average, setAverage] = useState<number | "">("");
  const [max, setMax] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!resting && !average && !max) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/heart-rate", {
        method: "POST",
        body: JSON.stringify({
          resting: resting ? Number(resting) : undefined,
          average: average ? Number(average) : undefined,
          max: max ? Number(max) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [resting, average, max]);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const avgResting = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + (e.bpm ?? 0), 0) / entries.length) : 0;

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconActivity size={24} />
        <Text size="xl" fw={700}>Heart Rate</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{avgResting || "—"}</Text>
          <Text size="xs" c="dimmed">Avg Resting (bpm)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{entries.length}</Text>
          <Text size="xs" c="dimmed">Recordings</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{sorted[0]?.bpm ?? "—"}</Text>
          <Text size="xs" c="dimmed">Latest Avg</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md">
        <SimpleGrid cols={3} spacing="sm">
          <NumberInput label="Resting (bpm)" value={resting} onChange={(v) => setResting(v as number)} min={20} max={300} />
          <NumberInput label="Average (bpm)" value={average} onChange={(v) => setAverage(v as number)} min={20} max={300} />
          <NumberInput label="Max (bpm)" value={max} onChange={(v) => setMax(v as number)} min={20} max={300} />
        </SimpleGrid>
        <Button fullWidth mt="sm" onClick={handleSave} loading={saving}>Log Heart Rate</Button>
      </Paper>

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No heart rate data yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Resting</Table.Th>
                <Table.Th>Average</Table.Th>
                <Table.Th>Max</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                  <Table.Td>{e.bpm ?? "—"}</Table.Td>
                  <Table.Td><Text fw={500}>{e.bpm ?? "—"}</Text></Table.Td>
                  <Table.Td>{e.bpm ?? "—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
