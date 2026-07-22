"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Card, TextInput, ActionIcon, Title, Badge,
  ScrollArea, Modal, Tooltip, Divider, Textarea, Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft, IconSettings, IconPlayerPlay, IconDeviceFloppy,
  IconPlus, IconGripVertical, IconTrash, IconEye, IconNotes,
  IconClock, IconLanguage, IconTag, IconMicrophone2,
} from "@tabler/icons-react";
import Link from "next/link";
import { Editor } from "@/components/editor";
import { reorderSectionsSchema } from "../service";

type Script = {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  priority: string;
  difficulty: string;
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

type Section = {
  id: string;
  title: string;
  content: any;
  sortOrder: number;
  wordCount: number;
  estimatedDurationSeconds: number;
  speakerNotes: any;
};

type Props = {
  scriptId: string;
};

export function WritingView({ scriptId }: Props) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);

  const loadScript = useCallback(async () => {
    const res = await fetch(`/api/scripts/${scriptId}`);
    const data = await res.json();
    const { sections: scts, ...scr } = data;
    setScript(scr);
    setSections(scts ?? []);
    if (scts?.length > 0 && !selectedSection) {
      setSelectedSection(scts[0]);
    }
    setLoading(false);
  }, [scriptId, selectedSection]);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  const handleContentChange = useCallback(async (sectionId: string, content: any) => {
    setSaving(true);
    try {
      await fetch(`/api/scripts/${scriptId}/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await loadScript();
    } finally {
      setSaving(false);
    }
  }, [scriptId, loadScript]);

  const handleSectionTitleChange = useCallback(async (sectionId: string, title: string) => {
    await fetch(`/api/scripts/${scriptId}/sections/${sectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    await loadScript();
  }, [scriptId, loadScript]);

  if (loading) return <Text>Loading...</Text>;
  if (!script) return <Text>Script not found</Text>;

  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const totalEstDuration = sections.reduce((sum, s) => sum + s.estimatedDurationSeconds, 0);

  return (
    <Stack gap="md" h="calc(100vh - 100px)">
      {/* Header */}
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" onClick={() => router.push("/studio")}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <div>
              <Text fw={600} size="lg">{script.title}</Text>
              {script.subtitle && <Text size="sm" c="dimmed">{script.subtitle}</Text>}
            </div>
          </Group>
          <Group>
            {saving && <Badge variant="dot" color="yellow" size="sm">Saving...</Badge>}
            <Badge variant="light" color={script.status === "ready" ? "green" : script.status === "practicing" ? "blue" : "gray"}>
              {script.status}
            </Badge>
            <Tooltip label="Presentation Mode">
              <ActionIcon variant="light" component={Link} href={`/studio/scripts/${scriptId}/present`}>
                <IconPlayerPlay size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Practice">
              <ActionIcon variant="light" component={Link} href={`/studio/scripts/${scriptId}/practice`}>
                <IconMicrophone2 size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Settings">
              <ActionIcon variant="light" component={Link} href={`/studio/scripts/${scriptId}/settings`}>
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Group gap="lg" mt="xs">
          <Text size="xs" c="dimmed">{totalWords} words</Text>
          <Text size="xs" c="dimmed">{sections.length} sections</Text>
          <Text size="xs" c="dimmed">Est. {Math.round(totalEstDuration / 60)} min</Text>
          {script.eventDate && (
            <Text size="xs" c="dimmed">Event: {new Date(script.eventDate).toLocaleDateString()}</Text>
          )}
        </Group>
      </Paper>

      {/* Editor + Sidebar */}
      <Group gap="md" align="flex-start" style={{ flex: 1, overflow: "hidden" }}>
        {/* Section Sidebar */}
        <Paper withBorder p="sm" radius="md" w={260} style={{ flexShrink: 0 }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm">Sections</Text>
            <ActionIcon size="sm" variant="light" onClick={async () => {
              await fetch(`/api/scripts/${scriptId}/sections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Section", sortOrder: sections.length }),
              });
              await loadScript();
            }}>
              <IconPlus size={14} />
            </ActionIcon>
          </Group>
          <ScrollArea h="calc(100vh - 280px)">
            <Stack gap={4}>
              {sections.map((s, i) => (
                <Paper
                  key={s.id}
                  p="xs"
                  withBorder={selectedSection?.id === s.id}
                  style={{ cursor: "pointer", background: selectedSection?.id === s.id ? "var(--mantine-color-blue-light)" : undefined }}
                  onClick={() => setSelectedSection(s)}
                >
                  <Group gap="xs">
                    <IconGripVertical size={12} style={{ opacity: 0.3 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" lineClamp={1}>{s.title}</Text>
                      <Text size="xs" c="dimmed">{s.wordCount} words · {Math.round(s.estimatedDurationSeconds / 60)}m</Text>
                    </div>
                    <ActionIcon size="xs" variant="subtle" color="red" onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/scripts/${scriptId}/sections/${s.id}`, { method: "DELETE" });
                      if (selectedSection?.id === s.id) setSelectedSection(null);
                      await loadScript();
                    }}>
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Paper>

        {/* Editor */}
        <Paper withBorder p="md" radius="md" style={{ flex: 1, overflow: "auto" }}>
          {selectedSection ? (
            <Stack gap="sm">
              <TextInput
                value={selectedSection.title}
                onChange={(e) => {
                  setSelectedSection({ ...selectedSection, title: e.currentTarget.value });
                  handleSectionTitleChange(selectedSection.id, e.currentTarget.value);
                }}
                variant="unstyled"
                size="xl"
                fw={600}
                placeholder="Section title"
              />
              <Divider />
              <Editor
                content={selectedSection.content}
                onChange={(json: any) => {
                  handleContentChange(selectedSection.id, json);
                }}
              />
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              {sections.length === 0 ? "Add a section to start writing" : "Select a section to edit"}
            </Text>
          )}
        </Paper>

        {/* Speaker Notes Panel */}
        {showNotes && selectedSection && (
          <Paper withBorder p="sm" radius="md" w={280} style={{ flexShrink: 0 }}>
            <Group justify="space-between" mb="sm">
              <Text fw={500} size="sm">Speaker Notes</Text>
              <ActionIcon size="sm" variant="subtle" onClick={() => setShowNotes(false)}>
                <IconNotes size={14} />
              </ActionIcon>
            </Group>
            <ScrollArea h="calc(100vh - 280px)">
              <Stack gap="sm">
                <Text size="xs" fw={500} c="dimmed">Pause Point</Text>
                <Paper withBorder p="xs" radius="sm" style={{ cursor: "pointer" }}>
                  <Text size="xs" c="dimmed">Click to mark pause</Text>
                </Paper>
                <Text size="xs" fw={500} c="dimmed">Reminders</Text>
                <Paper withBorder p="xs" radius="sm" style={{ cursor: "pointer" }}>
                  <Text size="xs" c="dimmed">+ Smile reminder</Text>
                </Paper>
                <Paper withBorder p="xs" radius="sm" style={{ cursor: "pointer" }}>
                  <Text size="xs" c="dimmed">+ Eye contact</Text>
                </Paper>
                <Paper withBorder p="xs" radius="sm" style={{ cursor: "pointer" }}>
                  <Text size="xs" c="dimmed">+ Gesture</Text>
                </Paper>
                <Divider />
                <Textarea
                  label="Private Notes"
                  placeholder="Confidence tip, timing note..."
                  minRows={4}
                  size="xs"
                />
              </Stack>
            </ScrollArea>
          </Paper>
        )}
      </Group>
    </Stack>
  );
}
