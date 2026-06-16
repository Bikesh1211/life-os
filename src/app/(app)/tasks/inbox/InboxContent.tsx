"use client";

import { useState } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import type { Task } from "@/modules/tasks/repository";

export function InboxContent() {
  const { data: tasks, isLoading } = useTasks({
    noProject: true,
    status: "active",
    sortBy: "createdAt",
  });

  const [editTask, setEditTask] = useState<Task | null>(null);

  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="grape">
          <IconInbox size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Inbox</Title>
          <Text size="sm" c="dimmed">
            Tasks without a project — capture and organize later
          </Text>
        </div>
      </Group>

      <TaskQuickAdd placeholder="Capture a task..." />

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !tasks || tasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            Inbox is empty. All tasks are organized into projects.
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={setEditTask} />
          ))}
        </Stack>
      )}

      {editTask && (
        <TaskFormModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </Stack>
  );
}
