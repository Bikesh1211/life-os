"use client";

import {
  Stack,
  Title,
  Group,
  Button,
  SimpleGrid,
  Paper,
  Text,
  Badge,
  RingProgress,
} from "@mantine/core";
import {
  IconPlus,
  IconBooks,
  IconCalendarWeek,
  IconCalendarMonth,
  IconClock,
  IconStar,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import type { KnowledgeEntry } from "@/modules/knowledge";

type DashboardStats = {
  total: number;
  learnedToday: number;
  learnedThisWeek: number;
  learnedThisMonth: number;
  totalHours: number;
  mostActiveSubject: string | null;
  entriesBySubject: Record<string, number>;
};

type Props = {
  entries: KnowledgeEntry[];
  stats: DashboardStats;
};

export function KnowledgeDashboard({ entries, stats }: Props) {
  const todayEntries = entries.filter((e) =>
    dayjs(e.dateLearned).isAfter(dayjs().startOf("day")),
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Knowledge Vault</Title>
        <Button
          component={Link}
          href="/knowledge/new"
          leftSection={<IconPlus size={18} />}
        >
          New Entry
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }}>
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconBooks size={28} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Total Entries</Text>
              <Text size="xl" fw={700}>{stats.total}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconSun size={28} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Today</Text>
              <Text size="xl" fw={700}>{stats.learnedToday}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconCalendarWeek size={28} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">This Week</Text>
              <Text size="xl" fw={700}>{stats.learnedThisWeek}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconCalendarMonth size={28} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">This Month</Text>
              <Text size="xl" fw={700}>{stats.learnedThisMonth}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconClock size={28} stroke={1.5} />
            <div>
              <Text size="xs" c="dimmed">Hours Spent</Text>
              <Text size="xl" fw={700}>{stats.totalHours}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {todayEntries.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>
              <Group gap="xs">
                <IconSun size={20} />
                <span>Today's Learning</span>
              </Group>
            </Title>
            <Button
              component={Link}
              href="/knowledge/timeline"
              variant="subtle"
              size="sm"
            >
              View Timeline
            </Button>
          </Group>
          <Stack gap="xs">
            {todayEntries.map((entry) => (
              <Paper
                key={entry.id}
                component={Link}
                href={`/knowledge/${entry.id}`}
                p="sm"
                withBorder
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text fw={500}>{entry.title}</Text>
                    <Badge size="sm" variant="light">{entry.subject}</Badge>
                    <Badge size="sm" color="gray" variant="outline">M:{entry.masteryLevel}/10</Badge>
                  </Group>
                  {entry.summary && (
                    <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 300 }}>
                      {entry.summary}
                    </Text>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Subjects</Title>
          {Object.keys(stats.entriesBySubject).length === 0 ? (
            <Text c="dimmed" size="sm">No entries yet</Text>
          ) : (
            <Stack gap="xs">
              {Object.entries(stats.entriesBySubject)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([subject, count]) => (
                  <Group key={subject} justify="space-between">
                    <Text size="sm">{subject}</Text>
                    <Text size="sm" c="dimmed">{count}</Text>
                  </Group>
                ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Most Active Subject</Title>
          {stats.mostActiveSubject ? (
            <Group>
              <RingProgress
                size={80}
                thickness={8}
                sections={[
                  { value: 100, color: "blue" },
                ]}
                label={
                  <Text size="xs" ta="center">
                    <IconStar size={16} />
                  </Text>
                }
              />
              <div>
                <Text fw={500}>{stats.mostActiveSubject}</Text>
                <Text size="sm" c="dimmed">
                  {stats.entriesBySubject[stats.mostActiveSubject]} entries
                </Text>
              </div>
            </Group>
          ) : (
            <Text c="dimmed" size="sm">No entries yet</Text>
          )}
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Recent Entries</Title>
          <Button
            component={Link}
            href="/knowledge/library"
            variant="subtle"
            size="sm"
          >
            View All
          </Button>
        </Group>
        <Stack gap="xs">
          {entries.slice(0, 5).map((entry) => (
            <Paper
              key={entry.id}
              component={Link}
              href={`/knowledge/${entry.id}`}
              p="sm"
              withBorder
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{entry.title}</Text>
                  <Text size="xs" c="dimmed">
                    {entry.subject}{entry.subcategory ? ` / ${entry.subcategory}` : ""}
                  </Text>
                </div>
                <Text size="xs" c="dimmed">
                  {new Date(entry.dateLearned).toLocaleDateString()}
                </Text>
              </Group>
            </Paper>
          ))}
          {entries.length === 0 && (
            <Text c="dimmed" size="sm" py="xl" ta="center">
              No entries yet. Start learning and capture your first entry!
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
