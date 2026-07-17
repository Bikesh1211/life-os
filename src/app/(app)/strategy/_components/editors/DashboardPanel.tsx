"use client";

import { SimpleGrid, Paper, Text, Title, Group, RingProgress, Center } from "@mantine/core";
import { IconUser, IconHeart, IconScale, IconEye, IconBolt, IconNotes } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { sections: StrategySection[] };

const totalSections = 11;

export function DashboardPanel({ sections }: Props) {
  const completed = new Set(sections.map((s) => s.sectionType)).size;
  const pct = Math.round((completed / totalSections) * 100);
  const lastUpdated = sections.length > 0
    ? new Date(Math.max(...sections.map((s) => new Date(s.updatedAt).getTime()))).toLocaleDateString()
    : "Never";

  const metrics = [
    { label: "Sections Completed", value: `${completed}/${totalSections}`, icon: IconHeart, color: "red" },
    { label: "Completion", value: `${pct}%`, icon: IconScale, color: "blue" },
    { label: "Last Updated", value: lastUpdated, icon: IconEye, color: "green" },
    { label: "Total Items", value: String(sections.length), icon: IconNotes, color: "violet" },
  ];

  return (
    <>
      <Group mb="lg">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: pct, color: "blue" }]}
          label={
            <Center>
              <Text size="xl" fw={700}>
                {pct}%
              </Text>
            </Center>
          }
        />
        <div>
          <Title order={3}>Operating Manual</Title>
          <Text c="dimmed" size="sm">
            {completed} of {totalSections} sections completed
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
        {metrics.map((m) => (
          <Paper key={m.label} p="md" radius="md" withBorder>
            <Group>
              <m.icon size={28} color={`var(--mantine-color-${m.color}-6)`} />
              <div>
                <Text size="xs" c="dimmed">{m.label}</Text>
                <Text fw={600}>{m.value}</Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </>
  );
}
