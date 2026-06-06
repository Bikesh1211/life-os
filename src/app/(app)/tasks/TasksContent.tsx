"use client";

import { Stack, Title, Text, Paper, Group, Badge, ThemeIcon } from "@mantine/core";
import { IconChecklist } from "@tabler/icons-react";
import type { Task } from "@/modules/tasks/repository";

type TasksContentProps = {
  tasks: Task[];
};

export function TasksContent({ tasks }: TasksContentProps) {
  const statusColor: Record<string, string> = {
    todo: "gray",
    in_progress: "blue",
    done: "green",
    archived: "yellow",
  };

  const priorityColor: Record<string, string> = {
    low: "gray",
    medium: "blue",
    high: "orange",
    urgent: "red",
  };

  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md">
          <IconChecklist size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Tasks</Title>
          <Text c="dimmed" size="sm">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </Text>
        </div>
      </Group>

      {tasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No tasks yet. Create your first task to get started.
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tasks.map((task) => (
            <Paper key={task.id} withBorder p="sm" radius="md">
              <Group justify="space-between">
                <Text>{task.title}</Text>
                <Group gap="xs">
                  <Badge size="sm" color={statusColor[task.status]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                  <Badge size="sm" color={priorityColor[task.priority]}>
                    {task.priority}
                  </Badge>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
