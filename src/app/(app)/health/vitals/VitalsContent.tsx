"use client";

import { Stack, Group, Text, Paper, SimpleGrid, Badge, Anchor, ActionIcon } from "@mantine/core";
import { IconArrowLeft, IconWeight, IconHeartbeat, IconActivity, IconBed, IconDroplet } from "@tabler/icons-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import type { VitalsSnapshot, VitalsTrends } from "@/modules/health";

function bpCategory(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "green" };
  if (systolic < 130 && diastolic < 80) return { label: "Elevated", color: "yellow" };
  if (systolic < 140 || diastolic < 90) return { label: "Stage 1 High", color: "orange" };
  return { label: "Stage 2 High", color: "red" };
}

function TrendChart({ data, title, color, unit }: {
  data: { date: string; value: number }[];
  title: string;
  color: string;
  unit?: string;
}) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" fw={600} mb="sm">{title}</Text>
      {data.length === 0 ? (
        <Text size="xs" c="dimmed">No data yet.</Text>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <ReTooltip />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}

export function VitalsContent({ snapshot, trends }: { snapshot: VitalsSnapshot; trends: VitalsTrends }) {
  const bpCombined = trends.systolic.map((s, i) => ({
    date: s.date,
    systolic: s.value,
    diastolic: trends.diastolic[i]?.value,
  }));

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/health">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconHeartbeat size={24} />
        <Text size="xl" fw={700}>Vitals</Text>
      </Group>

      {/* Current Snapshot */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <IconWeight size={20} className="inline-block mb-1" />
          <Text size="2rem" fw={700}>{snapshot.latestWeight ? `${snapshot.latestWeight.weightKg}` : "—"}</Text>
          <Text size="xs" c="dimmed">Weight (kg)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <IconHeartbeat size={20} className="inline-block mb-1" />
          <Text size="2rem" fw={700}>
            {snapshot.latestBp ? `${snapshot.latestBp.systolic}/${snapshot.latestBp.diastolic}` : "—"}
          </Text>
          <Text size="xs" c="dimmed">Blood Pressure</Text>
          {snapshot.latestBp && (
            <Badge size="sm" color={bpCategory(snapshot.latestBp.systolic, snapshot.latestBp.diastolic).color} mt={4}>
              {bpCategory(snapshot.latestBp.systolic, snapshot.latestBp.diastolic).label}
            </Badge>
          )}
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <IconActivity size={20} className="inline-block mb-1" />
          <Text size="2rem" fw={700}>{snapshot.latestHr ? `${snapshot.latestHr.average ?? snapshot.latestHr.resting ?? "—"}` : "—"}</Text>
          <Text size="xs" c="dimmed">Heart Rate (bpm)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <IconBed size={20} className="inline-block mb-1" />
          <Text size="2rem" fw={700}>{snapshot.avgSleepDuration ? `${snapshot.avgSleepDuration}h` : "—"}</Text>
          <Text size="xs" c="dimmed">Avg Sleep</Text>
        </Paper>
      </SimpleGrid>

      {/* Trend Charts */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TrendChart data={trends.weight} title="Weight Trend" color="#22d3ee" unit="kg" />
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Blood Pressure Trend</Text>
          {bpCombined.length === 0 ? (
            <Text size="xs" c="dimmed">No data yet.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bpCombined}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ReTooltip />
                <Line type="monotone" dataKey="systolic" stroke="#ec4899" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#f472b6" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>
        <TrendChart data={trends.sleepDuration} title="Sleep Duration" color="#6366f1" unit="h" />
        <TrendChart data={trends.sleepQuality} title="Sleep Quality" color="#8b5cf6" />
      </SimpleGrid>
    </Stack>
  );
}
