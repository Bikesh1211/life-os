"use client";

import { useState, useEffect } from "react";
import { Stack, TextInput, Textarea, Title, Button, Paper, SimpleGrid } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const fields = [
  { key: "bestWorkingHours", label: "Best Working Hours" },
  { key: "deepWorkDuration", label: "Deep Work Duration" },
  { key: "preferredMeetingLength", label: "Preferred Meeting Length" },
  { key: "communicationStyle", label: "Communication Style" },
  { key: "learningStyle", label: "Learning Style" },
  { key: "planningStyle", label: "Planning Style" },
  { key: "focusEnvironment", label: "Focus Environment" },
  { key: "collaborationPreference", label: "Collaboration Preference" },
  { key: "remoteOfficePreference", label: "Remote / Office Preference" },
];

const defaults = Object.fromEntries(fields.map((f) => [f.key, ""])) as Record<string, string>;

export function WorkStyleEditor({ initial }: Props) {
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
      await fetch("/api/strategy/sections/work_style", {
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
      <Title order={3}>Work Style</Title>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {fields.map((f) => (
              <TextInput
                key={f.key}
                label={f.label}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.currentTarget.value)}
              />
            ))}
          </SimpleGrid>
          <Textarea
            label="Notes"
            value={form.notes ?? ""}
            onChange={(e) => handleChange("notes", e.currentTarget.value)}
            minRows={2}
          />
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} loading={saving} mt="sm">
            Save
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
