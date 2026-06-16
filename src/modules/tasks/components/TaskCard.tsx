"use client";

import { useState } from "react";
import {
  Checkbox, Text, Group, Badge, Paper, ActionIcon, Tooltip, Collapse, Stack,
} from "@mantine/core";
import { IconEdit, IconTrash, IconChevronDown, IconChevronRight, IconSubtask } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Task } from "../repository";
import { useUpdateTask, useDeleteTask, useTasks } from "../hooks";

const priorityColors: Record<string, string> = {
  p1: "red",
  p2: "orange",
  p3: "blue",
  p4: "gray",
  p5: "gray",
};

type TaskCardProps = {
  task: Task & { labels?: Array<{ id: string; name: string; color: string }>; subtasks?: Task[] };
  onEdit?: (task: any) => void;
  showProject?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  selectionMode?: boolean;
};

export function TaskCard({ task, onEdit, showProject, selected, onSelect, selectionMode }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [subtasksOpen, setSubtasksOpen] = useState(false);

  const isDone = task.status === "done";

  const handleToggle = () => {
    updateTask.mutate({
      id: task.id,
      status: isDone ? "todo" : "done",
    });
  };

  const isOverdue = task.dueDate && !isDone && dayjs(task.dueDate).isBefore(dayjs(), "day");

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      style={{
        opacity: isDone ? 0.6 : 1,
        transition: "opacity 0.15s",
        borderLeft: selected ? "3px solid var(--mantine-color-blue-6)" : undefined,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        {selectionMode ? (
          <Checkbox
            checked={!!selected}
            onChange={() => onSelect?.(task.id)}
            mt={3}
            size="sm"
          />
        ) : (
          <Checkbox
            checked={isDone}
            onChange={handleToggle}
            mt={3}
            size="sm"
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" mb={2} wrap="nowrap">
            {hasSubtasks && (
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={() => setSubtasksOpen(!subtasksOpen)}
              >
                {subtasksOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              </ActionIcon>
            )}
            <Text
              size="sm"
              fw={500}
              style={{
                textDecoration: isDone ? "line-through" : "none",
                wordBreak: "break-word",
              }}
            >
              {task.title}
            </Text>
            <Badge size="xs" color={priorityColors[task.priority] ?? "gray"} variant="light">
              {task.priority?.toUpperCase()}
            </Badge>
            {task.recurrence !== "none" && (
              <Badge size="xs" variant="outline" color="gray">
                {task.recurrence}
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            {task.dueDate && (
              <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
                {isOverdue ? "Overdue: " : ""}
                {dayjs(task.dueDate).format("MMM D")}
              </Text>
            )}
            {task.estimatedMinutes && (
              <Text size="xs" c="dimmed">
                {task.estimatedMinutes}m
              </Text>
            )}
            {showProject && task.projectId && (
              <Text size="xs" c="dimmed">
                Project: {task.projectId}
              </Text>
            )}
          </Group>

          {task.labels && task.labels.length > 0 && (
            <Group gap={4} mt={4}>
              {task.labels.map((label) => (
                <Badge key={label.id} size="xs" color={label.color} variant="light">
                  {label.name}
                </Badge>
              ))}
            </Group>
          )}

          {hasSubtasks && (
            <Collapse in={subtasksOpen}>
              <Stack gap={4} mt="xs">
                {task.subtasks?.map((sub: any) => (
                  <Group key={sub.id} gap="xs">
                    <Checkbox
                      size="xs"
                      checked={sub.status === "done"}
                      onChange={() =>
                        updateTask.mutate({
                          id: sub.id,
                          status: sub.status === "done" ? "todo" : "done",
                        })
                      }
                    />
                    <Text
                      size="xs"
                      style={{
                        textDecoration: sub.status === "done" ? "line-through" : "none",
                      }}
                    >
                      {sub.title}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Collapse>
          )}
        </div>

        <Group gap={4} wrap="nowrap">
          {onEdit && (
            <Tooltip label="Edit">
              <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(task)}>
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="red"
              onClick={() => deleteTask.mutate(task.id)}
              loading={deleteTask.isPending}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}