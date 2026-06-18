"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, NumberInput, Button, Anchor, Table, Badge, ActionIcon
} from "@mantine/core";
import { IconHeartbeat, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import type { WellnessBloodPressureEntry } from "@/modules/wellness";

function bpCategory(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "green" };
  if (systolic < 130 && diastolic < 80) return { label: "Elevated", color: "yellow" };
  if (systolic < 140 || diastolic < 90) return { label: "Stage 1 High", color: "orange" };
  return { label: "Stage 2 High", color: "red" };
}

export function BloodPressureContent({ entries }: { entries: WellnessBloodPressureEntry[] }) {
  const [systolic, setSystolic] = useState<number | "">(120);
  const [diastolic, setDiastolic] = useState<number | "">(80);
  const [pulse, setPulse] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!systolic || !diastolic) return;
    setSaving(true);
    try {
      await fetch("/api/wellness/blood-pressure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systolic: Number(systolic), diastolic: Number(diastolic),
          pulse: pulse ? Number(pulse) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [systolic, diastolic, pulse]);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0];

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconHeartbeat size={24} />
        <Text size="xl" fw={700}>Blood Pressure</Text>
      </Group>

      {latest && (
        <Paper withBorder p="lg" className="text-center">
          <Text size="3rem" fw={700}>{latest.systolic}/{latest.diastolic}</Text>
          <Badge size="lg" color={bpCategory(latest.systolic, latest.diastolic).color} mt="xs">
            {bpCategory(latest.systolic, latest.diastolic).label}
          </Badge>
          {latest.pulse && <Text size="sm" c="dimmed" mt="xs">Pulse: {latest.pulse} bpm</Text>}
        </Paper>
      )}

      <Paper withBorder p="md">
        <SimpleGrid cols={3} spacing="sm">
          <NumberInput label="Systolic" value={systolic} onChange={(v) => setSystolic(v as number)} min={60} max={300} />
          <NumberInput label="Diastolic" value={diastolic} onChange={(v) => setDiastolic(v as number)} min={30} max={200} />
          <NumberInput label="Pulse" value={pulse} onChange={(v) => setPulse(v as number)} min={20} max={300} />
        </SimpleGrid>
        <Button fullWidth mt="sm" onClick={handleSave} loading={saving}>Log Reading</Button>
      </Paper>

      <Paper withBorder p="md">
        <Text size="sm" fw={600} mb="sm">History</Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="dimmed">No readings yet.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Systolic</Table.Th>
                <Table.Th>Diastolic</Table.Th>
                <Table.Th>Pulse</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((e) => {
                const cat = bpCategory(e.systolic, e.diastolic);
                return (
                  <Table.Tr key={e.id}>
                    <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                    <Table.Td><Text fw={500}>{e.systolic}</Text></Table.Td>
                    <Table.Td><Text fw={500}>{e.diastolic}</Text></Table.Td>
                    <Table.Td>{e.pulse ?? "—"}</Table.Td>
                    <Table.Td><Badge color={cat.color}>{cat.label}</Badge></Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
