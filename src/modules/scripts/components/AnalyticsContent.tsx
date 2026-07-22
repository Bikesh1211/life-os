"use client";

import { useEffect, useState } from "react";
import { Card, Text, Group, Stack, Title, SimpleGrid, RingProgress } from "@mantine/core";
import { IconFileText, IconClock, IconTrendingUp, IconStar, IconMicrophone2 } from "@tabler/icons-react";

type DashboardData = {
  totalScripts: number;
  draftCount: number;
  practicingCount: number;
  readyCount: number;
  archivedCount: number;
  favoriteCount: number;
  totalWordCount: number;
  totalDuration: number;
  practiceStats: { totalSessions: number; totalDuration: number; avgConfidence: number; avgRating: number; avgVoiceQuality: number; avgEyeContact: number };
};

export function AnalyticsContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scripts/dashboard")
      .then(async (r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>Loading analytics...</Text>;
  if (!data) return <Text>Failed to load analytics</Text>;

  const completionRate = data.totalScripts > 0
    ? Math.round(((data.readyCount + data.archivedCount) / data.totalScripts) * 100)
    : 0;

  const practiceConsistency = data.practiceStats.totalSessions > 0
    ? Math.min(100, Math.round((data.practiceStats.totalSessions / 30) * 100))
    : 0;

  return (
    <Stack gap="md" mt="md">
      <Title order={3}>Analytics</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Card withBorder padding="lg" radius="md">
          <Group>
            <IconFileText size={32} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Total Scripts</Text>
              <Text size="xl" fw={700}>{data.totalScripts}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group>
            <IconClock size={32} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Total Speaking Hours</Text>
              <Text size="xl" fw={700}>{(data.totalDuration / 3600).toFixed(1)}h</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group>
            <IconMicrophone2 size={32} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Practice Hours</Text>
              <Text size="xl" fw={700}>{(data.practiceStats.totalDuration / 3600).toFixed(1)}h</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="lg" radius="md">
          <Stack align="center" gap="md">
            <Text fw={500}>Completion Rate</Text>
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: completionRate, color: "green" }]}
              label={<Text ta="center" size="xl" fw={700}>{completionRate}%</Text>}
            />
            <Text size="sm" c="dimmed">
              {data.readyCount} ready · {data.archivedCount} archived · {data.draftCount} draft
            </Text>
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Stack align="center" gap="md">
            <Text fw={500}>Average Practice Score</Text>
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: data.practiceStats.avgRating * 10, color: "blue" }]}
              label={<Text ta="center" size="xl" fw={700}>{data.practiceStats.avgRating.toFixed(1)}</Text>}
            />
            <Text size="sm" c="dimmed">
              Confidence: {data.practiceStats.avgConfidence.toFixed(1)} · Voice: {data.practiceStats.avgVoiceQuality.toFixed(1)} · Eye Contact: {data.practiceStats.avgEyeContact.toFixed(1)}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
