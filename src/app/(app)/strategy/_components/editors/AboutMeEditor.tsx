"use client";

import { useState, useEffect } from "react";
import { Stack, TextInput, Textarea, Title, Button, Paper } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type Props = { initial: StrategySection[] };

const defaults = {
  fullName: "",
  personalMission: "",
  lifeMotto: "",
  biography: "",
  currentFocus: "",
  personalIdentityStatement: "",
};

export function AboutMeEditor({ initial }: Props) {
  const existing = initial[0];
  const [form, setForm] = useState(
    existing ? (existing.content as Record<string, string>) : { ...defaults },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial[0]) {
      setForm(initial[0].content as Record<string, string>);
    }
  }, [initial]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/strategy/sections/about_me", {
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
      <Title order={3}>About Me</Title>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <TextInput
            label="Full Name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.currentTarget.value)}
          />
          <Textarea
            label="Personal Mission"
            value={form.personalMission}
            onChange={(e) => handleChange("personalMission", e.currentTarget.value)}
            minRows={2}
          />
          <TextInput
            label="Life Motto"
            value={form.lifeMotto}
            onChange={(e) => handleChange("lifeMotto", e.currentTarget.value)}
          />
          <Textarea
            label="Biography"
            value={form.biography}
            onChange={(e) => handleChange("biography", e.currentTarget.value)}
            minRows={3}
          />
          <TextInput
            label="Current Focus"
            value={form.currentFocus}
            onChange={(e) => handleChange("currentFocus", e.currentTarget.value)}
          />
          <Textarea
            label="Personal Identity Statement"
            value={form.personalIdentityStatement}
            onChange={(e) => handleChange("personalIdentityStatement", e.currentTarget.value)}
            minRows={2}
          />
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            loading={saving}
            mt="sm"
          >
            Save
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
