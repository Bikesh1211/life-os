"use client";

import { useState } from "react";
import { Paper, Group, Text, TextInput, Button, Checkbox, ActionIcon } from "@mantine/core";
import { IconTarget, IconCheck, IconPlus, IconX } from "@tabler/icons-react";

type Props = {
  goal: { id: string; title: string; isCompleted: boolean } | null;
  onSetGoal: (title: string) => void;
  onToggleGoal: (isCompleted: boolean) => void;
  isLoading: boolean;
};

export function DailyGoalSection({ goal, onSetGoal, onToggleGoal, isLoading }: Props) {
  const [editing, setEditing] = useState(!goal);
  const [title, setTitle] = useState(goal?.title ?? "");

  function handleSave() {
    if (title.trim()) {
      onSetGoal(title.trim());
      setEditing(false);
    }
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm" mb="xs">
        <IconTarget size={18} />
        <Text fw={600} size="sm">Today's Main Goal</Text>
      </Group>

      {goal && !editing ? (
        <Group gap="sm">
          <Checkbox
            checked={goal.isCompleted}
            onChange={(e) => onToggleGoal(e.currentTarget.checked)}
            color="green"
          />
          <Text
            style={{ flex: 1, textDecoration: goal.isCompleted ? "line-through" : "none" }}
            c={goal.isCompleted ? "dimmed" : undefined}
          >
            {goal.title}
          </Text>
          <ActionIcon variant="subtle" size="sm" onClick={() => setEditing(true)}>
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      ) : (
        <Group gap="sm">
          <TextInput
            placeholder="What is your main objective today?"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{ flex: 1 }}
            size="sm"
          />
          <Button size="sm" onClick={handleSave} loading={isLoading}>
            <IconCheck size={14} />
          </Button>
          {goal && (
            <ActionIcon size="sm" variant="subtle" onClick={() => { setEditing(false); setTitle(goal.title); }}>
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      )}
    </Paper>
  );
}
