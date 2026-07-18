"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack, Group, Text, SimpleGrid, Button, Paper, Modal, TextInput,
  Skeleton, NumberInput, Divider, Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDimensions, IconScale, IconRulerMeasure, IconBarbell } from "@tabler/icons-react";
import { PremiumCard } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

async function fetchMeasurements() {
  const res = await fetch("/api/fitness/measurements?limit=50");
  if (!res.ok) throw new Error("Failed to fetch measurements");
  return res.json();
}

async function logMeasurement(body: Record<string, unknown>) {
  const res = await fetch("/api/fitness/measurements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to log measurement");
  return res.json();
}

export function FitnessMeasurementsTab() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState<Record<string, unknown>>({
    date: new Date().toISOString().slice(0, 10),
  });

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["fitness", "measurements"],
    queryFn: fetchMeasurements,
  });

  const mutation = useMutation({
    mutationFn: logMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] });
      close();
    },
  });

  const latest = Array.isArray(measurements) && measurements.length > 0 ? measurements[0] : null;

  return (
    <Stack gap="md">
      <PageHeader
        title="Body Measurements"
        subtitle="Track your body metrics over time"
      >
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          Log Measurement
        </Button>
      </PageHeader>

      {isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : (
        <>
          {/* Latest measurement summary */}
          {latest && (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
              {latest.weightKg && (
                <StatCard label="Weight" value={`${Number(latest.weightKg).toFixed(1)} kg`} icon={IconScale} color="green" />
              )}
              {latest.bodyFatPercentage && (
                <StatCard label="Body Fat" value={`${Number(latest.bodyFatPercentage).toFixed(1)}%`} icon={IconDimensions} color="orange" />
              )}
              {latest.muscleMassKg && (
                <StatCard label="Muscle Mass" value={`${Number(latest.muscleMassKg).toFixed(1)} kg`} icon={IconBarbell} color="blue" />
              )}
              {latest.waistCm && (
                <StatCard label="Waist" value={`${Number(latest.waistCm).toFixed(1)} cm`} icon={IconRulerMeasure} color="violet" />
              )}
            </SimpleGrid>
          )}

          {/* Measurement history */}
          {Array.isArray(measurements) && measurements.length > 0 ? (
            <PremiumCard variant="default" padding="lg">
              <Text fw={600} size="sm" mb="md">Measurement History</Text>
              <Stack gap="xs">
                {measurements.slice(0, 20).map((m: {
                  id: string; date: string; weightKg?: string; bodyFatPercentage?: string;
                  muscleMassKg?: string; waistCm?: string;
                }) => (
                  <Paper key={m.id} withBorder p="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>{m.date}</Text>
                      <Group gap="xs">
                        {m.weightKg && <Badge size="sm" variant="light">{Number(m.weightKg).toFixed(1)} kg</Badge>}
                        {m.bodyFatPercentage && <Badge size="sm" variant="light" color="orange">{Number(m.bodyFatPercentage).toFixed(1)}% BF</Badge>}
                        {m.muscleMassKg && <Badge size="sm" variant="light" color="blue">{Number(m.muscleMassKg).toFixed(1)} kg muscle</Badge>}
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </PremiumCard>
          ) : (
            <PremiumCard variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a" }} padding="lg">
              <Text fw={600} size="lg" c="white">No Measurements Yet</Text>
              <Text size="sm" c="white" opacity={0.8} mb="md">
                Log your first body measurement to start tracking changes.
              </Text>
              <Button variant="white" onClick={open}>Log First Measurement</Button>
            </PremiumCard>
          )}
        </>
      )}

      <Modal opened={opened} onClose={close} title="Log Body Measurement" centered size="md">
        <Stack gap="sm">
          <TextInput
            label="Date"
            type="date"
            value={form.date as string}
            onChange={(e) => setForm({ ...form, date: e.currentTarget.value })}
            required
          />
          <NumberInput
            label="Weight (kg)"
            value={form.weightKg as number}
            onChange={(v) => setForm({ ...form, weightKg: v })}
            decimalScale={1}
            min={0}
            max={500}
          />
          <NumberInput
            label="Body Fat (%)"
            value={form.bodyFatPercentage as number}
            onChange={(v) => setForm({ ...form, bodyFatPercentage: v })}
            decimalScale={1}
            min={0}
            max={70}
          />
          <NumberInput
            label="Muscle Mass (kg)"
            value={form.muscleMassKg as number}
            onChange={(v) => setForm({ ...form, muscleMassKg: v })}
            decimalScale={1}
            min={0}
            max={200}
          />
          <Divider label="Body Measurements (cm)" labelPosition="center" />
          <SimpleGrid cols={2} spacing="sm">
            <NumberInput label="Waist" value={form.waistCm as number} onChange={(v) => setForm({ ...form, waistCm: v })} decimalScale={1} min={0} max={200} />
            <NumberInput label="Hips" value={form.hipsCm as number} onChange={(v) => setForm({ ...form, hipsCm: v })} decimalScale={1} min={0} max={200} />
            <NumberInput label="Chest" value={form.chestCm as number} onChange={(v) => setForm({ ...form, chestCm: v })} decimalScale={1} min={0} max={200} />
            <NumberInput label="Arms" value={form.armsCm as number} onChange={(v) => setForm({ ...form, armsCm: v })} decimalScale={1} min={0} max={100} />
            <NumberInput label="Thighs" value={form.thighsCm as number} onChange={(v) => setForm({ ...form, thighsCm: v })} decimalScale={1} min={0} max={100} />
            <NumberInput label="Neck" value={form.neckCm as number} onChange={(v) => setForm({ ...form, neckCm: v })} decimalScale={1} min={0} max={80} />
          </SimpleGrid>
          <Button
            onClick={() => mutation.mutate(form)}
            loading={mutation.isPending}
            mt="sm"
          >
            Save Measurement
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
