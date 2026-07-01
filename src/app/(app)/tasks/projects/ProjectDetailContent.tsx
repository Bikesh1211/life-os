"use client";

import { useState } from "react";
import {
  Stack, Title, Text, Paper, Group, ThemeIcon, ActionIcon, Tooltip,
} from "@mantine/core";
import { IconFolder, IconEdit, IconTrash, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useTasks, useProject, useDeleteProject } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/TaskCard";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";
import { TaskQuickAdd } from "@/modules/tasks/components/TaskQuickAdd";
import type { Task } from "@/modules/tasks/repository";

type ProjectDetailContentProps = {
  projectId: string;
  hideHeader?: boolean;
  onBack?: () => void;
};

export function ProjectDetailContent({ projectId, hideHeader = false, onBack }: ProjectDetailContentProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    projectId,
    sortBy: "priority",
  });
  const deleteProject = useDeleteProject();

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (projectLoading) return <Text c="dimmed">Loading project...</Text>;
  if (!project) return <Text c="dimmed">Project not found</Text>;

  const activeTasks = tasks?.filter((t) => t.status !== "done" && t.status !== "cancelled") ?? [];
  const doneTasks = tasks?.filter((t) => t.status === "done") ?? [];

  return (
    <Stack gap="lg">
      {!hideHeader && (
        <Group>
          {onBack ? (
            <ActionIcon variant="subtle" onClick={onBack} size="md">
              <IconArrowLeft size={18} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="subtle" component={Link} href="/tasks/projects" size="md">
              <IconArrowLeft size={18} />
            </ActionIcon>
          )}
          <ThemeIcon variant="light" size="lg" radius="md" color={project.color}>
            <IconFolder size={20} />
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Title order={2}>{project.title}</Title>
            <Text size="sm" c="dimmed">
              {tasks?.length ?? 0} tasks
            </Text>
          </div>
          <Tooltip label="Delete project">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                if (confirm("Delete this project? Tasks will be unassigned.")) {
                  deleteProject.mutate(project.id);
                }
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}

      <TaskQuickAdd
        placeholder="Add a task to this project..."
        defaultProjectId={projectId}
      />

      {tasksLoading ? (
        <Text c="dimmed">Loading tasks...</Text>
      ) : activeTasks.length === 0 && doneTasks.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No tasks in this project yet.
          </Text>
        </Paper>
      ) : (
        <>
          {activeTasks.length > 0 && (
            <div>
              <Text fw={600} size="sm" mb="xs">Active</Text>
              <Stack gap="sm">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={setEditTask} />
                ))}
              </Stack>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div>
              <Text fw={600} size="sm" mb="xs" c="dimmed">Completed ({doneTasks.length})</Text>
              <Stack gap="sm">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={setEditTask} />
                ))}
              </Stack>
            </div>
          )}
        </>
      )}

      {editTask && (
        <TaskFormModal task={editTask} onClose={() => setEditTask(null)} />
      )}
      {showCreate && (
        <TaskFormModal
          defaultProjectId={projectId}
          onClose={() => setShowCreate(false)}
        />
      )}
    </Stack>
  );
}
