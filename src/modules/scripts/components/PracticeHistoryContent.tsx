"use client";

import { useEffect, useState } from "react";
import { Card, Text, Group, Stack, Title, SimpleGrid, RingProgress, Badge } from "@mantine/core";
import { IconMicrophone2, IconClock, IconTrendingUp, IconStar } from "@tabler/icons-react";

type PracticeStats = {
  totalSessions: number;
  totalDuration: number;
  avgConfidence: number;
  avgRating: number;
  avgVoiceQuality: number;
  avgEyeContact: number;
};

type PracticeSession = {
  id: string;
  scriptId: string;
  practicedAt: string;
  durationSeconds: number;
  confidence: number;
  rating: number;
  voiceQuality: number;
  eyeContact: number;
  mistakes: string[];
  improvements: string | null;
};

export function PracticeHistoryContent() {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/scripts/practice/stats").then(async (r) => (r.ok ? r.json() : null)),
      fetch("/api/scripts/practice").then(async (r) => (r.ok ? r.json() : [])),
    ])
      .then(([s, sess]) => {
        setStats(s);
        setSessions(sess);
      })
      .catch(() => { setStats(null); setSessions([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>Loading practice data...</Text>;

  const avgScore = stats
    ? ((stats.avgConfidence + stats.avgRating + stats.avgVoiceQuality + stats.avgEyeContact) / 4).toFixed(1)
    : "0";

  return (
    <Stack gap="md" mt="md">
      <Title order={3}>Practice History</Title>

      {stats && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Group>
              <IconMicrophone2 size={32} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">Total Sessions</Text>
                <Text size="xl" fw={700}>{stats.totalSessions}</Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md">
            <Group>
              <IconClock size={32} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">Total Practice Time</Text>
                <Text size="xl" fw={700}>{Math.round(stats.totalDuration / 60)}m</Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md">
            <Group>
              <IconStar size={32} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">Avg Score</Text>
                <Text size="xl" fw={700}>{avgScore}/10</Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md">
            <Group>
              <IconTrendingUp size={32} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">Avg Confidence</Text>
                <Text size="xl" fw={700}>{stats.avgConfidence.toFixed(1)}</Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>
      )}

      {sessions.length === 0 ? (
        <Text c="dimmed">No practice sessions yet. Start practicing your scripts!</Text>
      ) : (
        <Stack gap="sm">
          {sessions.map((s) => (
            <Card key={s.id} withBorder padding="md" radius="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm">
                    {new Date(s.practicedAt).toLocaleDateString()} at {new Date(s.practicedAt).toLocaleTimeString()}
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge size="sm">Confidence: {s.confidence}/10</Badge>
                    <Badge size="sm" color="green">Rating: {s.rating}/10</Badge>
                    <Badge size="sm" color="blue">Voice: {s.voiceQuality}/10</Badge>
                    <Badge size="sm" color="violet">Eye Contact: {s.eyeContact}/10</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt="xs">
                    Duration: {Math.round(s.durationSeconds / 60)}m
                  </Text>
                  {s.mistakes.length > 0 && (
                    <Group gap="xs" mt="xs">
                      {s.mistakes.map((m, i) => (
                        <Badge key={i} size="sm" color="red" variant="light">{m}</Badge>
                      ))}
                    </Group>
                  )}
                  {s.improvements && (
                    <Text size="sm" mt="xs">{s.improvements}</Text>
                  )}
                </div>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
