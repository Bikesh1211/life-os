"use client";

import { useState, useEffect, useRef } from "react";
import { Paper, Group, Text, Textarea } from "@mantine/core";
import { IconNotes } from "@tabler/icons-react";

type Props = {
  content: string | null;
  onSave: (content: string) => void;
  isLoading: boolean;
};

export function DailyNotesSection({ content, onSave, isLoading }: Props) {
  const [value, setValue] = useState(content ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(content ?? "");
  }, [content]);

  function handleChange(newValue: string) {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (newValue !== content) {
        onSave(newValue);
      }
    }, 1500);
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm" mb="xs">
        <IconNotes size={18} />
        <Text fw={600} size="sm">Notes & Ideas</Text>
      </Group>
      <Textarea
        placeholder="Quick scratchpad for today's ideas..."
        value={value}
        onChange={(e) => handleChange(e.currentTarget.value)}
        minRows={3}
        maxRows={8}
        autosize
        variant="filled"
      />
    </Paper>
  );
}
