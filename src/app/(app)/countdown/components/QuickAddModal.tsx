"use client";

import { useState } from "react";
import { Modal, TextInput, Select, Button, Group, Stack, Text } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useRouter } from "next/navigation";
import { CATEGORY_CONFIG } from "./categoryConfig";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function QuickAddModal({ opened, onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!eventDate) { setError("Event date is required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/countdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          eventDate: eventDate.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTitle("");
        setCategory("personal");
        setEventDate(null);
        setError("");
        onClose();
        router.refresh();
      } else {
        const err = await res.json();
        setError(err.error ?? "Failed to create");
      }
    } catch {
      setError("Failed to create");
    }
    setSaving(false);
  }

  return (
    <Modal opened={opened} onClose={onClose} title="New Countdown" size="md" radius="lg" closeOnClickOutside={false}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Portugal vs Spain, Spider-Man release..."
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            autoFocus
            data-autofocus
          />

          <Select
            label="Category"
            data={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v ?? "personal")}
            required
          />

          <DateTimePicker
            label="Event Date & Time"
            placeholder="Pick event date"
            value={eventDate}
            onChange={(v) => setEventDate(v ? new Date(v) : null)}
            required
            clearable
          />

          {error && <Text c="red" size="sm">{error}</Text>}

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
