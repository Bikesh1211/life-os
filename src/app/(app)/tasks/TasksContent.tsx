"use client";

import { useState, useCallback, useRef } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon, SimpleGrid, Button } from "@mantine/core";
import {
  IconChecklist,
  IconPlus,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import { TaskFilters, type FilterValues } from "@/modules/tasks/components/TaskFilters";
import { BulkActionBar } from "@/modules/tasks/components/BulkActionBar";
import { useTaskKeyboardShortcuts } from "@/modules/tasks/hooks/useTaskKeyboardShortcuts";
import type { Task } from "@/modules/tasks/repository";

export function TasksContent({ taskSummary: initial }: { taskSummary: any }) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "", status: "active", priority: "", labelIds: [],
  });
  const queryFilters: Record<string, unknown> = { sortBy: "priority", parentId: "null" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.priority) queryFilters.priority = filters.priority;
  if (filters.labelIds.length > 0) queryFilters.labelIds = filters.labelIds;

  const { data: tasks, isLoading } = useTasks(queryFilters);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  useTaskKeyboardShortcuts({
    onNewTask: () => setShowCreate(true),
    onSearch: () => searchRef.current?.focus(),
    onToggleSelection: () => setSelectionMode((p) => !p),
    onEscape: () => { setSelectedIds([]); setSelectionMode(false); },
  });

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

      <TaskFilters filters={filters} onChange={setFilters} />

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => { setSelectedIds([]); setSelectionMode(false); }}
      />

      {isLoading ? (
        <Text c="dimmed">Loading tasks...</Text>
      ) : !tasks || tasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">No tasks yet. Create your first task above.</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditTask}
              selected={selectedIds.includes(task.id)}
              onSelect={toggleSelect}
              selectionMode={selectionMode}
            />
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