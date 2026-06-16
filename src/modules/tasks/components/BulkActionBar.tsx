"use client";

import { Paper, Group, Text, Button, ActionIcon, Tooltip } from "@mantine/core";
import { IconX, IconCheck, IconTrash, IconArrowsLeftRight } from "@tabler/icons-react";
import { useUpdateTask, useDeleteTask } from "../hooks";

type BulkActionBarProps = {
  selectedIds: string[];
  onClear: () => void;
  onComplete?: () => void;
};

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  if (selectedIds.length === 0) return null;

  const handleBulkComplete = () => {
    for (const id of selectedIds) {
      updateTask.mutate({ id, status: "done" });
    }
    onClear();
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) {
      deleteTask.mutate(id);
    }
    onClear();
  };

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      bg="var(--mantine-color-blue-0)"
      style={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <Text size="sm" fw={500}>
            {selectedIds.length} selected
          </Text>
          <Tooltip label="Clear selection">
            <ActionIcon variant="subtle" size="sm" onClick={onClear}>
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            color="green"
            leftSection={<IconCheck size={14} />}
            onClick={handleBulkComplete}
            loading={updateTask.isPending}
          >
            Complete
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={handleBulkDelete}
            loading={deleteTask.isPending}
          >
            Delete
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}