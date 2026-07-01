"use client";

import { useState, useCallback } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import { TaskFilters, type FilterValues } from "@/modules/tasks/components/TaskFilters";
import { BulkActionBar } from "@/modules/tasks/components/BulkActionBar";
import { useTaskKeyboardShortcuts } from "@/modules/tasks/hooks/useTaskKeyboardShortcuts";
import type { Task } from "@/modules/tasks/repository";

type InboxContentProps = {
  hideHeader?: boolean;
};

export function InboxContent({ hideHeader = false }: InboxContentProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "", status: "active", priority: "", labelIds: [],
  });
  const queryFilters: Record<string, unknown> = { noProject: true, sortBy: "createdAt" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.priority) queryFilters.priority = filters.priority;
  if (filters.labelIds.length > 0) queryFilters.labelIds = filters.labelIds;

  const { data: tasks, isLoading } = useTasks(queryFilters);
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

  return (
    <Stack gap="lg">
      {!hideHeader && (
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
      )}

      <TaskQuickAdd placeholder="Capture a task..." />

      <TaskFilters filters={filters} onChange={setFilters} />

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => { setSelectedIds([]); setSelectionMode(false); }}
      />

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

      {editTask && (
        <TaskFormModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </Stack>
  );
}