"use client";

import { useState, useEffect } from "react";
import { Stack, Textarea, Title, Button, Paper, Group } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const boundaryGroups = [
  {
    label: "Work",
    fields: [
      { key: "workingHours", label: "Working Hours" },
      { key: "communicationRules", label: "Communication Rules" },
      { key: "availability", label: "Availability" },
    ],
  },
  {
    label: "Personal",
    fields: [
      { key: "privacy", label: "Privacy" },
      { key: "familyTime", label: "Family Time" },
      { key: "restTime", label: "Rest Time" },
    ],
  },
  {
    label: "Digital",
    fields: [
      { key: "socialMediaLimits", label: "Social Media Limits" },
      { key: "phoneUsage", label: "Phone Usage" },
      { key: "notificationRules", label: "Notification Rules" },
    ],
  },
];

const defaults = Object.fromEntries(
  boundaryGroups.flatMap((g) => g.fields.map((f) => [f.key, ""])),
) as Record<string, string>;

export function BoundariesEditor({ initial }: Props) {
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
      await fetch("/api/strategy/sections/boundaries", {
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
      <Title order={3}>Personal Boundaries</Title>
      {boundaryGroups.map((group) => (
        <Paper key={group.label} p="md" radius="md" withBorder>
          <Title order={5} mb="sm">{group.label}</Title>
          <Stack gap="sm">
            {group.fields.map((f) => (
              <Textarea
                key={f.key}
                label={f.label}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.currentTarget.value)}
                minRows={2}
                autosize
              />
            ))}
          </Stack>
        </Paper>
      ))}
      <Group>
        <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} loading={saving}>
          Save
        </Button>
      </Group>
    </Stack>
  );
}
