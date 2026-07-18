"use client";

import { useState } from "react";
import { Paper, Group, Text, TextInput, Button, Badge, ActionIcon, Stack } from "@mantine/core";
import { IconStars, IconPlus, IconGripVertical, IconCheck, IconTrash } from "@tabler/icons-react";

type Priority = {
  id: string;
  title: string;
  estimatedDuration: number | null;
  status: string;
  sortOrder: number;
};

type Props = {
  priorities: Priority[];
  onAdd: (title: string) => void;
  onToggle: (id: string, status: string) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "gray",
  in_progress: "blue",
  completed: "green",
  skipped: "yellow",
};

export function DailyPrioritiesSection({ priorities, onAdd, onToggle, onRemove, isLoading }: Props) {
  const [title, setTitle] = useState("");

  function handleAdd() {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
    }
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm" mb="sm">
        <IconStars size={18} />
        <Text fw={600} size="sm">Top Priorities</Text>
        <Badge size="sm" variant="light">{priorities.length}/3</Badge>
      </Group>

      <Stack gap={6}>
        {priorities.map((p) => (
          <Group key={p.id} gap="xs" wrap="nowrap">
            <IconGripVertical size={14} style={{ opacity: 0.3, cursor: "grab" }} />
            <ActionIcon
              size="sm"
              variant={p.status === "completed" ? "filled" : "subtle"}
              color={p.status === "completed" ? "green" : "gray"}
              onClick={() => onToggle(p.id, p.status === "completed" ? "pending" : "completed")}
            >
              <IconCheck size={12} />
            </ActionIcon>
            <Text
              size="sm"
              style={{
                flex: 1,
                textDecoration: p.status === "completed" ? "line-through" : "none",
              }}
              c={p.status === "completed" ? "dimmed" : undefined}
            >
              {p.title}
            </Text>
            {p.estimatedDuration && (
              <Text size="xs" c="dimmed">{p.estimatedDuration}m</Text>
            )}
            <Badge
              size="xs"
              color={STATUS_COLORS[p.status] ?? "gray"}
              variant="light"
              tt="capitalize"
            >
              {p.status.replace("_", " ")}
            </Badge>
            <ActionIcon size="xs" variant="subtle" color="red" onClick={() => onRemove(p.id)}>
              <IconTrash size={12} />
            </ActionIcon>
          </Group>
        ))}

        {priorities.length < 3 && (
          <Group gap="sm" mt={4}>
            <TextInput
              placeholder="Add a priority..."
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ flex: 1 }}
              size="xs"
            />
            <ActionIcon size="sm" onClick={handleAdd} loading={isLoading}>
              <IconPlus size={14} />
            </ActionIcon>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
