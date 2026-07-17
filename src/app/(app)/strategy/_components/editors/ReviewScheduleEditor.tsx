"use client";

import { useState, useEffect } from "react";
import { Stack, Title, Button, Paper, Group, Text } from "@mantine/core";
import { IconDeviceFloppy, IconCalendarTime } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const defaults = {
  frequency: "monthly",
  lastReviewDate: "",
  nextReviewDate: "",
};

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function ReviewScheduleEditor({ initial }: Props) {
  const existing = initial[0];
  const [form, setForm] = useState(existing ? (existing.content as Record<string, string>) : { ...defaults });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial[0]) setForm(initial[0].content as Record<string, string>);
  }, [initial]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/strategy/sections/review_schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={3}>Review Schedule</Title>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Current Frequency: <strong>{frequencies.find((f) => f.value === form.frequency)?.label ?? "Monthly"}</strong>
          </Text>
          <Group>
            {frequencies.map((f) => (
              <Button
                key={f.value}
                variant={form.frequency === f.value ? "filled" : "outline"}
                size="sm"
                onClick={() => setForm((prev) => ({ ...prev, frequency: f.value }))}
              >
                {f.label}
              </Button>
            ))}
          </Group>
          {form.lastReviewDate && (
            <Text size="sm" c="dimmed">Last Review: {new Date(form.lastReviewDate).toLocaleDateString()}</Text>
          )}
          {form.nextReviewDate && (
            <Text size="sm" c="dimmed">Next Review: {new Date(form.nextReviewDate).toLocaleDateString()}</Text>
          )}
          {!form.lastReviewDate && (
            <Group>
              <IconCalendarTime size={20} color="var(--mantine-color-dimmed)" />
              <Text size="sm" c="dimmed">No reviews recorded yet</Text>
            </Group>
          )}
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} loading={saving} mt="sm">
            Save
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
