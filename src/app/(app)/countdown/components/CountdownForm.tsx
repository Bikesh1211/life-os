"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, TextInput, Textarea, Select, Group, Button, Text, Title,
  ActionIcon, Switch,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconArrowLeft } from "@tabler/icons-react";
import { CATEGORY_CONFIG } from "./categoryConfig";
import type { EnrichedCountdownEvent } from "@/modules/countdown";

type Props = {
  eventId?: string;
};

export function CountdownForm({ eventId }: Props) {
  const router = useRouter();
  const isEdit = !!eventId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [createTimelineEvent, setCreateTimelineEvent] = useState(true);
  const [error, setError] = useState("");

  const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const recurrenceOptions = [
    { value: "none", label: "No recurrence" },
    { value: "yearly", label: "Yearly (birthdays, holidays)" },
  ];

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/countdown/${eventId}`);
      if (res.ok) {
        const data: EnrichedCountdownEvent = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? "");
        setCategory(data.category);
        setEventDate(new Date(data.eventDate));
        setEventTime(data.eventTime ?? "");
        setLocation(data.location ?? "");
        setOrganizer(data.organizer ?? "");
        setCoverImage(data.coverImage ?? "");
        setBannerImage(data.bannerImage ?? "");
        setColor(data.color ?? "");
        setNotes(data.notes ?? "");
        setIsFavorited(data.isFavorited ?? false);
        setRecurrence(data.recurrence ?? "none");
        setCreateTimelineEvent(data.createTimelineEvent ?? true);
      }
    } catch {}
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!eventDate) { setError("Event date is required"); return; }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        eventDate: eventDate.toISOString(),
        eventTime: eventTime || undefined,
        location: location.trim() || undefined,
        organizer: organizer.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        bannerImage: bannerImage.trim() || undefined,
        color: color || undefined,
        notes: notes.trim() || undefined,
        isFavorited,
        recurrence,
        createTimelineEvent,
      };

      const url = isEdit ? `/api/countdown/${eventId}` : "/api/countdown";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        router.push(`/countdown/${data.id}`);
      } else {
        const err = await res.json();
        setError(err.error ?? "Failed to save");
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  if (loading) return <Text c="dimmed">Loading...</Text>;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Group justify="space-between">
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.back()}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{isEdit ? "Edit Event" : "New Countdown"}</Title>
          <div />
        </Group>

        <TextInput
          label="Title"
          placeholder="Portugal vs Spain, Spider-Man release, etc."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
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

        <Group grow>
          <TextInput label="Time (optional)" placeholder="HH:mm" value={eventTime} onChange={(e) => setEventTime(e.currentTarget.value)} />
          <TextInput label="Timezone (optional)" placeholder="America/New_York" />
        </Group>

        <Group grow>
          <TextInput label="Location" placeholder="Where?" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
          <TextInput label="Organizer" placeholder="Who?" value={organizer} onChange={(e) => setOrganizer(e.currentTarget.value)} />
        </Group>

        <TextInput
          label="Cover Image URL"
          placeholder="https://example.com/cover.jpg"
          value={coverImage}
          onChange={(e) => setCoverImage(e.currentTarget.value)}
        />

        <TextInput
          label="Banner Image URL"
          placeholder="https://example.com/banner.jpg"
          value={bannerImage}
          onChange={(e) => setBannerImage(e.currentTarget.value)}
        />

        <TextInput
          label="Accent Color"
          placeholder="#22c55e"
          value={color}
          onChange={(e) => setColor(e.currentTarget.value)}
        />

        <Textarea
          label="Notes"
          placeholder="Match predictions, travel plans, packing list..."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          autosize
          minRows={3}
          maxRows={8}
        />

        <Select
          label="Recurrence"
          data={recurrenceOptions}
          value={recurrence}
          onChange={(v) => setRecurrence(v ?? "none")}
        />

        <Switch
          label="Create Timeline Event"
          description="Show this countdown in your Life Timeline"
          checked={createTimelineEvent}
          onChange={(e) => setCreateTimelineEvent(e.currentTarget.checked)}
        />

        <Switch
          label="Add to favorites"
          checked={isFavorited}
          onChange={(e) => setIsFavorited(e.currentTarget.checked)}
        />

        {error && <Text c="red" size="sm">{error}</Text>}

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Create Event"}</Button>
        </Group>
      </Stack>
    </form>
  );
}
