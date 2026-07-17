"use client";

import { useState, useEffect } from "react";
import { Stack, Textarea, Title, Button, Paper, SimpleGrid } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const visionFields = [
  { key: "career", label: "Career" },
  { key: "health", label: "Health" },
  { key: "finance", label: "Finance" },
  { key: "relationships", label: "Relationships" },
  { key: "learning", label: "Learning" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "personalGrowth", label: "Personal Growth" },
  { key: "legacy", label: "Legacy" },
];

const defaults = Object.fromEntries(visionFields.map((f) => [f.key, ""])) as Record<string, string>;

export function LongTermVisionEditor({ initial }: Props) {
  const existing = initial[0];
  const [form, setForm] = useState(existing ? (existing.content as Record<string, string>) : { ...defaults });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial[0]) setForm(initial[0].content as Record<string, string>);
  }, [initial]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/strategy/sections/long_term_vision", {
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
      <Title order={3}>Long-Term Vision</Title>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {visionFields.map((f) => (
              <Textarea
                key={f.key}
                label={f.label}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.currentTarget.value)}
                minRows={3}
                autosize
              />
            ))}
          </SimpleGrid>
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} loading={saving} mt="sm">
            Save
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
