"use client";

import { useState, useRef } from "react";
import { TextInput, Paper, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconPencil, IconMoodSmile } from "@tabler/icons-react";
import type { JournalEntry } from "@/modules/journal";

type Props = {
  onCreated: (entry: JournalEntry) => void;
};

export function QuickJournalInput({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        const entry = await res.json();
        onCreated(entry);
        setTitle("");
        inputRef.current?.focus();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="sm" wrap="nowrap">
        <ActionIcon variant="light" color="violet" size="md">
          <IconPencil size={16} />
        </ActionIcon>
        <TextInput
          ref={inputRef}
          placeholder="What's on your mind? Type a title and press Enter..."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          disabled={submitting}
          style={{ flex: 1 }}
          size="sm"
        />
        <Tooltip label="Quick entry">
          <ActionIcon
            variant="light"
            color="gray"
            size="md"
            onClick={handleSubmit}
            loading={submitting}
          >
            <IconMoodSmile size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}
