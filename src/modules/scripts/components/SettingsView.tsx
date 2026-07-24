"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Paper, Card, Title, Badge, TextInput,
  Textarea, Select, SimpleGrid, Switch, ActionIcon, MultiSelect, TagsInput,
  Divider, Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconTrash, IconHistory, IconStar, IconStarFilled, IconDeviceFloppy } from "@tabler/icons-react";

type Script = {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  priority: string;
  difficulty: string;
  visibility: string;
  wordCount: number;
  sectionCount: number;
  totalDurationSeconds: number;
  eventDate: string | null;
  eventTime: string | null;
  expectedDuration: number | null;
  language: string;
  speaker: string | null;
  venue: string | null;
  audience: string | null;
  purpose: string | null;
  organization: string | null;
  tags: string[];
  notes: string | null;
  categoryId: string | null;
  isFavorite: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Props = {
  scriptId: string;
};

export function SettingsView({ scriptId }: Props) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [versionNote, setVersionNote] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const pendingRef = useRef<Partial<Script>>({});
  const savingRef = useRef(false);

  const handleSave = useCallback(async () => {
    const updates = pendingRef.current;
    if (Object.keys(updates).length === 0) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      pendingRef.current = {};
      await fetch(`/api/scripts/${scriptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setIsDirty(false);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [scriptId]);

  const loadScript = useCallback(async () => {
    const res = await fetch(`/api/scripts/${scriptId}`);
    const { sections: _, ...scr } = await res.json();
    setScript(scr);
  }, [scriptId]);

  useEffect(() => {
    loadScript();
    fetch("/api/scripts/categories").then((r) => r.json()).then(setCategories);
  }, [loadScript]);

  const setField = useCallback(<K extends keyof Script>(key: K, value: Script[K]) => {
    setScript((prev) => prev ? { ...prev, [key]: value } : prev);
    (pendingRef.current as Record<string, unknown>)[key] = value;
    setIsDirty(true);
  }, []);

  const handleSaveVersion = useCallback(async () => {
    await fetch(`/api/scripts/${scriptId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: versionNote }),
    });
    setVersionNote("");
    close();
  }, [scriptId, versionNote, close]);

  const handleToggleFavorite = useCallback(async () => {
    const next = !script?.isFavorite;
    setScript((prev) => prev ? { ...prev, isFavorite: next } : prev);
    pendingRef.current = { isFavorite: next };
    await handleSave();
  }, [script, handleSave]);

  if (!script) return null;

  const saveBadge = saving
    ? <Badge variant="dot" color="yellow" size="sm">Saving...</Badge>
    : isDirty
      ? <Badge variant="dot" color="orange" size="sm">Unsaved</Badge>
      : <Badge variant="dot" color="green" size="sm">Saved</Badge>;

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="subtle" onClick={() => router.push(`/studio/scripts/${scriptId}/write`)}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={4}>Settings — {script.title}</Title>
        </Group>
        <Group>
          {saveBadge}
          <Button
            size="compact-sm"
            variant="light"
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            Save
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Basic Info */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Basic Info</Title>
          <Stack gap="sm">
            <TextInput
              label="Title"
              value={script.title}
              onChange={(e) => setField("title", e.currentTarget.value)}
            />
            <TextInput
              label="Subtitle"
              value={script.subtitle ?? ""}
              onChange={(e) => setField("subtitle", e.currentTarget.value || null)}
            />
            <Select
              label="Category"
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={script.categoryId}
              onChange={(v) => setField("categoryId", v ?? null)}
              clearable
            />
            <TextInput
              label="Purpose"
              value={script.purpose ?? ""}
              onChange={(e) => setField("purpose", e.currentTarget.value || null)}
            />
          </Stack>
        </Paper>

        {/* Status & Priority */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Status & Priority</Title>
          <Stack gap="sm">
            <Select
              label="Status"
              data={["draft", "practicing", "ready", "archived"]}
              value={script.status}
              onChange={(v) => setField("status", v ?? "draft")}
            />
            <Select
              label="Priority"
              data={["low", "medium", "high", "critical"]}
              value={script.priority}
              onChange={(v) => setField("priority", v ?? "medium")}
            />
            <Select
              label="Difficulty"
              data={["easy", "medium", "hard"]}
              value={script.difficulty}
              onChange={(v) => setField("difficulty", v ?? "medium")}
            />
            <Select
              label="Visibility"
              data={["private", "public"]}
              value={script.visibility}
              onChange={(v) => setField("visibility", v ?? "private")}
            />
          </Stack>
        </Paper>

        {/* Event Details */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Event Details</Title>
          <Stack gap="sm">
            <TextInput
              label="Speaker"
              value={script.speaker ?? ""}
              onChange={(e) => setField("speaker", e.currentTarget.value || null)}
            />
            <TextInput
              label="Venue"
              value={script.venue ?? ""}
              onChange={(e) => setField("venue", e.currentTarget.value || null)}
            />
            <TextInput
              label="Audience"
              value={script.audience ?? ""}
              onChange={(e) => setField("audience", e.currentTarget.value || null)}
            />
            <TextInput
              label="Organization"
              value={script.organization ?? ""}
              onChange={(e) => setField("organization", e.currentTarget.value || null)}
            />
            <TextInput
              label="Language"
              value={script.language}
              onChange={(e) => setField("language", e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        {/* Date & Time */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Date & Time</Title>
          <Stack gap="sm">
            <TextInput
              label="Event Date"
              type="datetime-local"
              value={script.eventDate ? new Date(script.eventDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => setField("eventDate", e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
            />
            <TextInput
              label="Expected Duration (minutes)"
              type="number"
              value={script.expectedDuration ?? ""}
              onChange={(e) => setField("expectedDuration", e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
            />
          </Stack>
        </Paper>

        {/* Tags & Notes */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Tags & Notes</Title>
          <Stack gap="sm">
            <TagsInput
              label="Tags"
              value={script.tags}
              onChange={(v) => setField("tags", v)}
            />
            <Textarea
              label="Notes"
              value={script.notes ?? ""}
              onChange={(e) => setField("notes", e.currentTarget.value || null)}
              minRows={3}
            />
          </Stack>
        </Paper>

        {/* Actions */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Actions</Title>
          <Stack gap="sm">
            <Button
              variant="light"
              leftSection={script.isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
              onClick={handleToggleFavorite}
            >
              {script.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
            <Button
              variant="light"
              leftSection={<IconHistory size={16} />}
              onClick={() => {
                fetch(`/api/scripts/${scriptId}/versions`).then((r) => r.json()).then(setVersions);
                setShowVersions(!showVersions);
              }}
            >
              Version History ({versions.length})
            </Button>
            <Button
              variant="light"
              leftSection={<IconHistory size={16} />}
              onClick={open}
            >
              Save Version
            </Button>
            <Divider />
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={async () => {
                await fetch(`/api/scripts/${scriptId}`, { method: "DELETE" });
                router.push("/studio");
              }}
            >
              Delete Script
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Version History */}
      {showVersions && (
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Version History</Title>
          <Stack gap="xs">
            {versions.length === 0 && <Text size="sm" c="dimmed">No versions saved</Text>}
            {versions.map((v: any) => (
              <Paper key={v.id} withBorder p="sm" radius="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm">{v.note ?? "No note"}</Text>
                    <Text size="xs" c="dimmed">{new Date(v.createdAt).toLocaleString()} · {v.wordCount} words</Text>
                  </div>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={async () => {
                      await fetch(`/api/scripts/${scriptId}/versions/${v.id}/restore`, { method: "POST" });
                      await loadScript();
                    }}
                  >
                    Restore
                  </Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Save Version Modal */}
      <Modal opened={opened} onClose={close} title="Save Version">
        <Stack>
          <TextInput
            label="Version note"
            placeholder="e.g., After first practice edit"
            value={versionNote}
            onChange={(e) => setVersionNote(e.currentTarget.value)}
          />
          <Button onClick={handleSaveVersion}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
