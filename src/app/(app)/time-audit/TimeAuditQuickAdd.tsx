"use client";

import { useState, useRef, useCallback } from "react";
import {
  Paper,
  TextInput,
  ActionIcon,
  Group,
  Text,
  Collapse,
  Stack,
  Select,
  Switch,
  Box,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconArrowRight, IconPlus, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";

type TimeCategory = { id: string; name: string; icon: string; color: string };

type QuickAddProps = {
  categories: TimeCategory[];
  onCreated: () => void;
};

export function TimeAuditQuickAdd({ categories, onCreated }: QuickAddProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(dayjs().format("HH:mm"));
  const [endTime, setEndTime] = useState("");
  const [isBillable, setIsBillable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const now = dayjs();
      const startDateTime = dayjs(`${now.format("YYYY-MM-DD")}T${startTime}`).toISOString();
      const endDateTime = endTime.trim()
        ? dayjs(`${now.format("YYYY-MM-DD")}T${endTime}`).toISOString()
        : undefined;

      const res = await fetch("/api/time-audit/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          categoryId: categoryId || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          isBillable,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        const conflict = data.conflicts?.[0];
        setError(conflict
          ? `Conflicts with "${conflict.title}" (${dayjs(conflict.startTime).format("HH:mm")}${conflict.endTime ? ` – ${dayjs(conflict.endTime).format("HH:mm")}` : " – running"})`
          : "Time overlaps with an existing entry");
        return;
      }
      if (res.ok) {
        setTitle("");
        setCategoryId(null);
        setStartTime(dayjs().format("HH:mm"));
        setEndTime("");
        setIsBillable(false);
        setExpanded(false);
        setError(null);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }, [title, categoryId, startTime, endTime, isBillable, onCreated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  if (!expanded) {
    return (
      <Paper
        p="sm"
        radius="md"
        style={{ border: "1px dashed var(--mantine-color-gray-4)", cursor: "pointer" }}
        onClick={() => {
          setExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <Group gap="sm">
          <IconPlus size={18} />
          <Text size="sm" c="dimmed">
            What are you working on?
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group gap="sm" align="flex-start">
          <Box style={{ flex: 1 }}>
            <TextInput
              ref={inputRef}
              placeholder="e.g. Building dashboard, Code review, Design sprint..."
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              variant="unstyled"
              size="xl"
              styles={{ input: { fontWeight: 500 } }}
              autoFocus
            />
          </Box>
          <Group gap={4}>
            <ActionIcon
              variant="filled"
              color={title.trim() ? "blue" : "gray"}
              size="lg"
              radius="md"
              onClick={handleCreate}
              loading={loading}
            >
              <IconArrowRight size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="lg" onClick={() => setExpanded(false)}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>

        <Collapse in={!!title}>
          <Stack gap="xs">
            {error && (
              <Text size="xs" c="red">
                {error}
              </Text>
            )}
            <Group gap="sm">
              <Select
                placeholder="Category"
                data={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={setCategoryId}
                size="xs"
                variant="filled"
                clearable
                style={{ width: 160 }}
              />

              <Group gap={4}>
                <TimeInput
                  label="Start"
                  value={startTime}
                  onChange={(e) => setStartTime(e.currentTarget.value)}
                  size="xs"
                  variant="filled"
                  style={{ width: 100 }}
                />
              </Group>

              <Group gap={4}>
                <TimeInput
                  label="End"
                  value={endTime}
                  onChange={(e) => setEndTime(e.currentTarget.value)}
                  size="xs"
                  variant="filled"
                  style={{ width: 100 }}
                />
              </Group>

              <Switch
                label="Billable"
                size="xs"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.currentTarget.checked)}
                mt={20}
              />
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}
