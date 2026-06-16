"use client";

import { useState } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon, Badge } from "@mantine/core";
import { IconRepeat } from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import type { Task } from "@/modules/tasks/repository";

export function RecurringContent() {
  const { data: tasks, isLoading } = useTasks({
    status: "active",
    sortBy: "createdAt",
  });

  const recurring = tasks?.filter((t) => t.recurrence !== "none") ?? [];
  const [editTask, setEditTask] = useState<Task | null>(null);

  const grouped = recurring.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.recurrence;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="cyan">
          <IconRepeat size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Recurring Tasks</Title>
          <Text size="sm" c="dimmed">{recurring.length} recurring tasks</Text>
        </div>
      </Group>

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : recurring.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No recurring tasks. Set a recurrence when creating a task.
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {Object.entries(grouped).map(([recurrence, recTasks]) => (
            <div key={recurrence}>
              <Group gap="xs" mb="xs">
                <Badge size="lg" variant="dot" color="cyan">
                  {recurrence.charAt(0).toUpperCase() + recurrence.slice(1)}
                </Badge>
                <Text size="xs" c="dimmed">{recTasks.length} tasks</Text>
              </Group>
              <Stack gap="sm">
                {recTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={setEditTask} />
                ))}
              </Stack>
            </div>
          ))}
        </Stack>
      )}

      {editTask && (
        <TaskFormModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </Stack>
  );
}
