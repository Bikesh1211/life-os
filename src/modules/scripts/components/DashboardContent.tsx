"use client";

import { useEffect, useState } from "react";
import { SimpleGrid, Card, Text, Group, RingProgress, Stack, Title, Badge, Anchor } from "@mantine/core";
import { IconFileText, IconClock, IconStar, IconTrendingUp, IconCalendarEvent, IconMicrophone2 } from "@tabler/icons-react";
import Link from "next/link";

type DashboardData = {
  totalScripts: number;
  draftCount: number;
  practicingCount: number;
  readyCount: number;
  archivedCount: number;
  favoriteCount: number;
  totalWordCount: number;
  totalDuration: number;
  upcoming: Array<{ id: string; title: string; eventDate: string; status: string }>;
  recent: Array<{ id: string; title: string; updatedAt: string; status: string }>;
  favorites: Array<{ id: string; title: string; updatedAt: string; status: string }>;
  practiceStats: { totalSessions: number; totalDuration: number; avgConfidence: number; avgRating: number };
  categories: Array<{ id: string; name: string; icon: string; color: string }>;
};

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scripts/dashboard")
      .then(async (r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>Loading dashboard...</Text>;
  if (!data) return <Text>Failed to load dashboard</Text>;

  const totalMinutes = Math.round(data.totalDuration / 60);

  return (
    <Stack gap="lg" mt="md">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
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
              <Text size="xs" c="dimmed">Speaking Time</Text>
              <Text size="xl" fw={700}>{totalMinutes}m</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group>
            <IconMicrophone2 size={32} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Practice Sessions</Text>
              <Text size="xl" fw={700}>{data.practiceStats.totalSessions}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group>
            <IconTrendingUp size={32} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Avg Confidence</Text>
              <Text size="xl" fw={700}>{data.practiceStats.avgConfidence.toFixed(1)}</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="sm">
            <Group gap="xs">
              <IconCalendarEvent size={18} />
              <span>Upcoming</span>
            </Group>
          </Title>
          <Stack gap="xs">
            {data.upcoming.length === 0 && <Text size="sm" c="dimmed">No upcoming scripts</Text>}
            {data.upcoming.map((s) => (
              <Anchor key={s.id} component={Link} href={`/studio/scripts/${s.id}/write`} size="sm">
                <Group gap="xs">
                  <Text size="sm">{s.title}</Text>
                  <Badge size="sm" variant="light">{s.status}</Badge>
                </Group>
              </Anchor>
            ))}
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="sm">
            <Group gap="xs">
              <IconStar size={18} />
              <span>Favorites</span>
            </Group>
          </Title>
          <Stack gap="xs">
            {data.favorites.length === 0 && <Text size="sm" c="dimmed">No favorite scripts</Text>}
            {data.favorites.map((s) => (
              <Anchor key={s.id} component={Link} href={`/studio/scripts/${s.id}/write`} size="sm">
                <Text size="sm">{s.title}</Text>
              </Anchor>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="sm">Recently Edited</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {data.recent.map((s) => (
            <Anchor key={s.id} component={Link} href={`/studio/scripts/${s.id}/write`}>
              <Card withBorder padding="sm" radius="sm">
                <Text size="sm" fw={500}>{s.title}</Text>
                <Group gap="xs" mt="xs">
                  <Badge size="sm" variant="light">{s.status}</Badge>
                </Group>
              </Card>
            </Anchor>
          ))}
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
