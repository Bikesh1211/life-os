"use client";

import { SimpleGrid, Paper, Text, Title, Group, ThemeIcon, Stack } from "@mantine/core";
import {
  IconChecklist,
  IconTarget,
  IconFlame,
  IconCalendarEvent,
} from "@tabler/icons-react";

type DashboardContentProps = {
  userId: string;
  taskSummary: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
};

export function DashboardContent({ userId, taskSummary }: DashboardContentProps) {
  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed" size="sm">
          Welcome to Life OS
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
    </Stack>
  );
}
