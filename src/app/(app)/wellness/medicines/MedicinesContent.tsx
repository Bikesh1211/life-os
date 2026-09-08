"use client";

import { useState, useCallback } from "react";
import {
  Stack, Group, Text, Paper, SimpleGrid, TextInput, NumberInput, Select, Button, Anchor, Table, Badge, ActionIcon, Switch
} from "@mantine/core";
import { IconPill, IconPlus, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type { WellnessMedicineReminder, WellnessMedicineLog } from "@/modules/wellness";

export function MedicinesContent({
  reminders,
  logs,
}: {
  reminders: WellnessMedicineReminder[];
  logs: WellnessMedicineLog[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name || !dosage || !time) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/medicines", {
        method: "POST",
        body: JSON.stringify({
          name, dosage, frequency, time,
          startDate: new Date().toISOString().slice(0, 10),
        }),
      });
      setShowForm(false);
      setName("");
      setDosage("");
      setTime("08:00");
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [name, dosage, frequency, time]);

  const handleToggle = useCallback(async (id: string, isActive: boolean) => {
    await apiFetch(`/api/wellness/medicines/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !isActive }),
    });
    window.location.reload();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await apiFetch(`/api/wellness/medicines/${id}`, { method: "DELETE" });
    window.location.reload();
  }, []);

  const recentLogs = [...logs].sort((a, b) => new Date(b.takenAt || b.createdAt).getTime() - new Date(a.takenAt || a.createdAt).getTime());

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/wellness">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconPill size={24} />
        <Text size="xl" fw={700}>Medicines</Text>
        <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setShowForm(!showForm)} ml="auto">
          Add Medicine
        </Button>
      </Group>

      {showForm && (
        <Paper withBorder p="md">
          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="sm">
            <TextInput label="Medicine Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
            <TextInput label="Dosage" value={dosage} onChange={(e) => setDosage(e.currentTarget.value)} placeholder="1 tablet" required />
            <Select label="Frequency" data={["daily", "weekly", "custom"]} value={frequency} onChange={(v) => setFrequency(v ?? "daily")} />
            <TextInput label="Time" type="time" value={time} onChange={(e) => setTime(e.currentTarget.value)} required />
          </SimpleGrid>
          <Button fullWidth mt="sm" onClick={handleCreate} loading={saving}>Save Medicine</Button>
        </Paper>
      )}

      {reminders.length > 0 && (
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Your Medicines</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Dosage</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Active</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reminders.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td><Text fw={500}>{r.name}</Text></Table.Td>
                  <Table.Td>{r.dosage}</Table.Td>
                  <Table.Td><Badge>{r.frequency}</Badge></Table.Td>
                  <Table.Td>{r.times[0] ?? "—"}</Table.Td>
                  <Table.Td>
                    <Switch checked={r.isActive} onChange={() => handleToggle(r.id, r.isActive)} size="xs" />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(r.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {recentLogs.length > 0 && (
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Recent Logs</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Scheduled Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentLogs.slice(0, 20).map((l) => (
                <Table.Tr key={l.id}>
                  <Table.Td>{new Date(l.takenAt || l.createdAt).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Badge color={l.name ? "green" : "yellow"}>
                      {l.name ? "taken" : "logged"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{l.dosage ?? "—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {reminders.length === 0 && <Text size="sm" c="dimmed">No medicine reminders yet. Add one above.</Text>}
    </Stack>
  );
}
