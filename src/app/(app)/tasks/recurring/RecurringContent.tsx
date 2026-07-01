"use client";

import { useState, useCallback } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon, Badge } from "@mantine/core";
import { IconRepeat } from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskFilters, type FilterValues } from "@/modules/tasks/components/TaskFilters";
import { BulkActionBar } from "@/modules/tasks/components/BulkActionBar";
import { useTaskKeyboardShortcuts } from "@/modules/tasks/hooks/useTaskKeyboardShortcuts";
import type { Task } from "@/modules/tasks/repository";

type RecurringContentProps = {
  hideHeader?: boolean;
};

export function RecurringContent({ hideHeader = false }: RecurringContentProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "", status: "active", priority: "", labelIds: [],
  });
  const queryFilters: Record<string, unknown> = { sortBy: "createdAt" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.priority) queryFilters.priority = filters.priority;
  if (filters.labelIds.length > 0) queryFilters.labelIds = filters.labelIds;

  const { data: tasks, isLoading } = useTasks(queryFilters);
  const recurring = tasks?.filter((t: Task) => t.recurrence !== "none") ?? [];
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  useTaskKeyboardShortcuts({
    onNewTask: () => setEditTask(null),
    onToggleSelection: () => setSelectionMode((p) => !p),
    onEscape: () => { setSelectedIds([]); setSelectionMode(false); },
  });

  const grouped = recurring.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.recurrence;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <Stack gap="lg">
      {!hideHeader && (
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md" color="cyan">
            <IconRepeat size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Recurring Tasks</Title>
            <Text size="sm" c="dimmed">{recurring.length} recurring tasks</Text>
          </div>
        </Group>
      )}

      <TaskFilters filters={filters} onChange={setFilters} />

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => { setSelectedIds([]); setSelectionMode(false); }}
      />

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