"use client";

import { Checkbox, Text, Group, Badge, Paper, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash, IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Task } from "../repository";
import { useUpdateTask, useDeleteTask } from "../hooks";

const priorityColors: Record<string, string> = {
  p1: "red",
  p2: "orange",
  p3: "blue",
  p4: "gray",
  p5: "gray",
};

const statusColors: Record<string, string> = {
  todo: "gray",
  in_progress: "blue",
  done: "green",
  cancelled: "red",
  archived: "yellow",
};

type TaskCardProps = {
  task: Task;
  onEdit?: (task: Task) => void;
  showProject?: boolean;
};

export function TaskCard({ task, onEdit, showProject }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isDone = task.status === "done";

  const handleToggle = () => {
    updateTask.mutate({
      id: task.id,
      status: isDone ? "todo" : "done",
    });
  };

  const isOverdue = task.dueDate && !isDone && dayjs(task.dueDate).isBefore(dayjs(), "day");

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      style={{ opacity: isDone ? 0.6 : 1, transition: "opacity 0.15s" }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Checkbox
          checked={isDone}
          onChange={handleToggle}
          mt={3}
          size="sm"
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" mb={2}>
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
          </Group>
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
