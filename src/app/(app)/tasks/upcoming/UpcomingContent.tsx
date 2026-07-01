"use client";

import { useState, useCallback } from "react";
import { Stack, Title, Text, Paper, Group, ThemeIcon } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTasks } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskFilters, type FilterValues } from "@/modules/tasks/components/TaskFilters";
import { BulkActionBar } from "@/modules/tasks/components/BulkActionBar";
import { useTaskKeyboardShortcuts } from "@/modules/tasks/hooks/useTaskKeyboardShortcuts";
import type { Task } from "@/modules/tasks/repository";

type UpcomingContentProps = {
  hideHeader?: boolean;
};

export function UpcomingContent({ hideHeader = false }: UpcomingContentProps) {
  const dueDateFrom = dayjs().add(1, "day").startOf("day").toISOString();
  const dueDateTo = dayjs().add(30, "day").endOf("day").toISOString();

  const [filters, setFilters] = useState<FilterValues>({
    search: "", status: "active", priority: "", labelIds: [],
  });
  const queryFilters: Record<string, unknown> = {
    dueDateFrom, dueDateTo, sortBy: "dueDate", sortOrder: "asc",
  };
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

  const grouped = tasks?.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : "unscheduled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {}) ?? {};

  return (
    <Stack gap="lg">
      {!hideHeader && (
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md" color="teal">
            <IconCalendarDue size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Upcoming</Title>
            <Text size="sm" c="dimmed">Tasks due in the next 30 days</Text>
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