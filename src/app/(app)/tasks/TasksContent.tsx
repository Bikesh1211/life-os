"use client";

import { useState } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon, SimpleGrid, Button } from "@mantine/core";
import {
  IconChecklist,
  IconPlus,
  IconCalendarDue,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import type { Task } from "@/modules/tasks/repository";

export function TasksContent({ taskSummary: initial }: { taskSummary: any }) {
  const { data: tasks, isLoading } = useTasks({ sortBy: "priority", status: "active", parentId: "null" });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const counts = {
    total: initial?.total ?? 0,
    todo: initial?.todo ?? 0,
    inProgress: initial?.in_progress ?? 0,
    done: initial?.done ?? 0,
    overdue: initial?.overdue ?? 0,
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md">
            <IconChecklist size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>My Tasks</Title>
            <Text size="sm" c="dimmed">{counts.total} tasks</Text>
          </div>
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setShowCreate(true)}
          radius="xl"
        >
          New Task
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
        <Paper withBorder p="sm" radius="md">
          <Group>
            <ThemeIcon variant="light" color="blue" size="md" radius="md">
              <IconChecklist size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">To Do</Text>
              <Text fw={700}>{counts.todo}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group>
            <ThemeIcon variant="light" color="violet" size="md" radius="md">
              <IconPlus size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">In Progress</Text>
              <Text fw={700}>{counts.inProgress}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group>
            <ThemeIcon variant="light" color="green" size="md" radius="md">
              <IconChecklist size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Done</Text>
              <Text fw={700}>{counts.done}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Group>
            <ThemeIcon variant="light" color="red" size="md" radius="md">
              <IconAlertCircle size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Overdue</Text>
              <Text fw={700}>{counts.overdue}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      <TaskQuickAdd />

      {isLoading ? (
        <Text c="dimmed">Loading tasks...</Text>
      ) : !tasks || tasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">No tasks yet. Create your first task above.</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={setEditTask} />
          ))}
        </Stack>
      )}

      {showCreate && (
        <TaskFormModal onClose={() => setShowCreate(false)} />
      )}
      {editTask && (
        <TaskFormModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </Stack>
  );
}
