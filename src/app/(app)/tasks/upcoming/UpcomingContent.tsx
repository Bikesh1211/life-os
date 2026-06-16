"use client";

import { useState } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import type { Task } from "@/modules/tasks/repository";

export function UpcomingContent() {
  const dueDateFrom = dayjs().add(1, "day").startOf("day").toISOString();
  const dueDateTo = dayjs().add(30, "day").endOf("day").toISOString();

  const { data: tasks, isLoading } = useTasks({
    dueDateFrom,
    dueDateTo,
    status: "active",
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  const [editTask, setEditTask] = useState<Task | null>(null);

  const grouped = tasks?.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : "unscheduled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {}) ?? {};

  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="teal">
          <IconCalendarDue size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Upcoming</Title>
          <Text size="sm" c="dimmed">Tasks due in the next 30 days</Text>
        </div>
      </Group>

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !tasks || tasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No upcoming tasks. Check your inbox or today&apos;s view.
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {Object.entries(grouped).map(([date, dateTasks]) => (
            <div key={date}>
              <Text fw={600} size="sm" mb="xs">
                {date === "unscheduled"
                  ? "No date"
                  : dayjs(date).format("dddd, MMMM D")}
              </Text>
              <Stack gap="sm">
                {dateTasks.map((task) => (
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
