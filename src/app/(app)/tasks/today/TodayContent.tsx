"use client";

import { useState } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import type { Task } from "@/modules/tasks/repository";

export function TodayContent() {
  const today = dayjs().format("YYYY-MM-DD");
  const dueDateFrom = dayjs().startOf("day").toISOString();
  const dueDateTo = dayjs().endOf("day").toISOString();

  const { data: tasksDueToday, isLoading } = useTasks({
    dueDateFrom,
    dueDateTo,
    status: "active",
    sortBy: "priority",
  });

  const [editTask, setEditTask] = useState<Task | null>(null);

  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="blue">
          <IconCalendarDue size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Today</Title>
          <Text size="sm" c="dimmed">{dayjs().format("dddd, MMMM D")}</Text>
        </div>
      </Group>

      <TaskQuickAdd placeholder="Add a task for today..." />

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !tasksDueToday || tasksDueToday.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            Nothing due today. Add a task or check your inbox.
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tasksDueToday.map((task) => (
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
