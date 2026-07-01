"use client";

import { useState, useCallback } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import { TaskFilters, type FilterValues } from "@/modules/tasks/components/TaskFilters";
import { BulkActionBar } from "@/modules/tasks/components/BulkActionBar";
import { useTaskKeyboardShortcuts } from "@/modules/tasks/hooks/useTaskKeyboardShortcuts";
import type { Task } from "@/modules/tasks/repository";

type TodayContentProps = {
  hideHeader?: boolean;
};

export function TodayContent({ hideHeader = false }: TodayContentProps) {
  const today = dayjs().format("YYYY-MM-DD");
  const dueDateFrom = dayjs().startOf("day").toISOString();
  const dueDateTo = dayjs().endOf("day").toISOString();

  const [filters, setFilters] = useState<FilterValues>({
    search: "", status: "active", priority: "", labelIds: [],
  });
  const queryFilters: Record<string, unknown> = { dueDateFrom, dueDateTo, sortBy: "priority" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.priority) queryFilters.priority = filters.priority;
  if (filters.labelIds.length > 0) queryFilters.labelIds = filters.labelIds;

  const { data: tasksDueToday, isLoading } = useTasks(queryFilters);
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
          <ThemeIcon variant="light" size="lg" radius="md" color="blue">
            <IconCalendarDue size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Today</Title>
            <Text size="sm" c="dimmed">{dayjs().format("dddd, MMMM D")}</Text>
          </div>
        </Group>
      )}

      <TaskQuickAdd placeholder="Add a task for today..." />

      <TaskFilters filters={filters} onChange={setFilters} />

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => { setSelectedIds([]); setSelectionMode(false); }}
      />

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