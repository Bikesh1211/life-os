"use client";

import { useState } from "react";
import { TextInput, ActionIcon, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCreateTask } from "../hooks";

type TaskQuickAddProps = {
  placeholder?: string;
  defaultProjectId?: string;
  onCreated?: () => void;
};

export function TaskQuickAdd({
  placeholder = "Add a task...",
  defaultProjectId,
  onCreated,
}: TaskQuickAddProps) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    await createTask.mutateAsync({
      title: trimmed,
      projectId: defaultProjectId || null,
    });
    setTitle("");
    onCreated?.();
  };

  return (
    <Group gap="xs">
      <TextInput
        placeholder={placeholder}
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        style={{ flex: 1 }}
        radius="md"
        size="md"
      />
      <ActionIcon
        variant="filled"
        color="blue"
        size="lg"
        radius="md"
        onClick={handleSubmit}
        loading={createTask.isPending}
      >
        <IconPlus size={18} />
      </ActionIcon>
    </Group>
  );
}
