"use client";

import {
  SimpleGrid,
  Paper,
  Text,
  Title,
  Group,
  ThemeIcon,
  Stack,
  Button,
} from "@mantine/core";
import {
  IconChecklist,
  IconTarget,
  IconFlame,
  IconCalendarEvent,
  IconBooks,
  IconBook,
  IconTimelineEvent,
  IconNotes,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import type { KnowledgeEntry } from "@/modules/knowledge";

type DashboardContentProps = {
  userId: string;
  taskSummary: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  knowledgeEntries: KnowledgeEntry[];
};

export function DashboardContent({
  userId,
  taskSummary,
  knowledgeEntries,
}: DashboardContentProps) {
  const todayEntries = knowledgeEntries.filter((e) =>
    dayjs(e.dateLearned).isAfter(dayjs().startOf("day")),
  );
  const latestEntries = knowledgeEntries.slice(0, 3);

  const quickLinks = [
    { label: "Knowledge Vault", route: "/knowledge", icon: IconBooks, color: "blue" },
    { label: "Tasks", route: "/tasks", icon: IconChecklist, color: "cyan" },
    { label: "Journal", route: "/journal", icon: IconBook, color: "grape" },
    { label: "Timeline", route: "/timeline", icon: IconTimelineEvent, color: "orange" },
    { label: "Notes", route: "/notes", icon: IconNotes, color: "teal" },
    { label: "Goals", route: "/goals", icon: IconTarget, color: "green" },
  ];

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed" size="sm">
          Welcome to Focus Linq
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              <IconChecklist size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                Tasks
              </Text>
              <Text fw={700} size="xl">
                {taskSummary.total}
              </Text>
            </div>
          </Group>
          <Text size="xs" c="dimmed" mt="sm">
            {taskSummary.todo} todo · {taskSummary.inProgress} in progress · {taskSummary.done} done
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon variant="light" color="green" size="lg" radius="md">
              <IconFlame size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                Habits
              </Text>
              <Text fw={700} size="xl">
                —
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon variant="light" color="violet" size="lg" radius="md">
              <IconTarget size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                Goals
              </Text>
              <Text fw={700} size="xl">
                —
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon variant="light" color="orange" size="lg" radius="md">
              <IconCalendarEvent size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                Events
              </Text>
              <Text fw={700} size="xl">
                —
              </Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              <IconBooks size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Knowledge Today</Text>
              <Text fw={700} size="xl">{todayEntries.length}</Text>
            </div>
          </Group>
          <Button
            component={Link}
            href="/knowledge"
            variant="subtle"
            size="xs"
            fullWidth
            mt="sm"
            rightSection={<IconArrowRight size={14} />}
          >
            Go to Knowledge Vault
          </Button>
        </Paper>

        {latestEntries.length > 0 && (
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" mb="xs">Latest Learning</Text>
            <Stack gap={4}>
              {latestEntries.map((entry) => (
                <Text
                  key={entry.id}
                  component={Link}
                  href={`/knowledge/${entry.id}`}
                  size="sm"
                  truncate
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {entry.title}
                </Text>
              ))}
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">Quick Navigation</Title>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
          {quickLinks.map((link) => (
            <Button
              key={link.route}
              component={Link}
              href={link.route}
              variant="light"
              color={link.color}
              leftSection={<link.icon size={18} />}
              fullWidth
              styles={{ inner: { justifyContent: "flex-start" } }}
            >
              {link.label}
            </Button>
          ))}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
