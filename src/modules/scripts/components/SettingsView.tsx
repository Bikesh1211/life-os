"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Paper, Card, Title, Badge, TextInput,
  Textarea, Select, SimpleGrid, Switch, ActionIcon, MultiSelect, TagsInput,
  Divider, Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconTrash, IconHistory, IconStar, IconStarFilled } from "@tabler/icons-react";

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
  const [opened, { open, close }] = useDisclosure(false);
  const [versionNote, setVersionNote] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const loadScript = useCallback(async () => {
    const res = await fetch(`/api/scripts/${scriptId}`);
    const { sections: _, ...scr } = await res.json();
    setScript(scr);
  }, [scriptId]);

  useEffect(() => {
    loadScript();
    fetch("/api/scripts/categories").then((r) => r.json()).then(setCategories);
  }, [loadScript]);

  const handleSave = useCallback(async (updates: Partial<Script>) => {
    setSaving(true);
    try {
      await fetch(`/api/scripts/${scriptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      await loadScript();
    } finally {
      setSaving(false);
    }
  }, [scriptId, loadScript]);

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
    await handleSave({ isFavorite: !script?.isFavorite });
  }, [script, handleSave]);

  if (!script) return null;

  return (
    <Stack gap="md" p="md">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.push(`/studio/scripts/${scriptId}/write`)}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Title order={4}>Settings — {script.title}</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Basic Info */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">Basic Info</Title>
          <Stack gap="sm">
            <TextInput
              label="Title"
              value={script.title}
              onChange={(e) => setScript({ ...script, title: e.currentTarget.value })}
              onBlur={() => handleSave({ title: script.title })}
            />
            <TextInput
              label="Subtitle"
              value={script.subtitle ?? ""}
              onChange={(e) => setScript({ ...script, subtitle: e.currentTarget.value })}
              onBlur={() => handleSave({ subtitle: script.subtitle })}
            />
            <Select
              label="Category"
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={script.categoryId}
              onChange={(v) => handleSave({ categoryId: v ?? null })}
              clearable
            />
            <TextInput
              label="Purpose"
              value={script.purpose ?? ""}
              onChange={(e) => setScript({ ...script, purpose: e.currentTarget.value })}
              onBlur={() => handleSave({ purpose: script.purpose })}
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
              onChange={(v) => handleSave({ status: v ?? "draft" })}
            />
            <Select
              label="Priority"
              data={["low", "medium", "high", "critical"]}
              value={script.priority}
              onChange={(v) => handleSave({ priority: v ?? "medium" })}
            />
            <Select
              label="Difficulty"
              data={["easy", "medium", "hard"]}
              value={script.difficulty}
              onChange={(v) => handleSave({ difficulty: v ?? "medium" })}
            />
            <Select
              label="Visibility"
              data={["private", "public"]}
              value={script.visibility}
              onChange={(v) => handleSave({ visibility: v ?? "private" })}
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
              onChange={(e) => setScript({ ...script, speaker: e.currentTarget.value })}
              onBlur={() => handleSave({ speaker: script.speaker })}
            />
            <TextInput
              label="Venue"
              value={script.venue ?? ""}
              onChange={(e) => setScript({ ...script, venue: e.currentTarget.value })}
              onBlur={() => handleSave({ venue: script.venue })}
            />
            <TextInput
              label="Audience"
              value={script.audience ?? ""}
              onChange={(e) => setScript({ ...script, audience: e.currentTarget.value })}
              onBlur={() => handleSave({ audience: script.audience })}
            />
            <TextInput
              label="Organization"
              value={script.organization ?? ""}
              onChange={(e) => setScript({ ...script, organization: e.currentTarget.value })}
              onBlur={() => handleSave({ organization: script.organization })}
            />
            <TextInput
              label="Language"
              value={script.language}
              onChange={(e) => setScript({ ...script, language: e.currentTarget.value })}
              onBlur={() => handleSave({ language: script.language })}
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
              onChange={(e) => handleSave({ eventDate: e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null })}
            />
            <TextInput
              label="Expected Duration (minutes)"
              type="number"
              value={script.expectedDuration ?? ""}
              onChange={(e) => handleSave({ expectedDuration: e.currentTarget.value ? parseInt(e.currentTarget.value) : null })}
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
              onChange={(v) => handleSave({ tags: v })}
            />
            <Textarea
              label="Notes"
              value={script.notes ?? ""}
              onChange={(e) => setScript({ ...script, notes: e.currentTarget.value })}
              onBlur={() => handleSave({ notes: script.notes })}
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
