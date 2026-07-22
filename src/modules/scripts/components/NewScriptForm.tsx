"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Paper, Title, TextInput, Textarea,
  Select, SimpleGrid, TagsInput,
} from "@mantine/core";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Template = {
  id: string;
  name: string;
  sections: string[];
  categoryId: string | null;
};

export function NewScriptForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [venue, setVenue] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<string>("medium");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/scripts/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/scripts/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  const filteredTemplates = templates.filter(
    (t) => !categoryId || t.categoryId === categoryId,
  );

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: subtitle || undefined,
          categoryId: categoryId || undefined,
          purpose: purpose || undefined,
          audience: audience || undefined,
          venue: venue || undefined,
          speaker: speaker || undefined,
          language,
          tags,
          priority,
          difficulty,
        }),
      });
      const script = await res.json();

      // Apply template sections if a matching template exists
      const template = filteredTemplates[0];
      if (template && template.sections) {
        for (let i = 0; i < template.sections.length; i++) {
          await fetch(`/api/scripts/${script.id}/sections`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: template.sections[i],
              sortOrder: i,
            }),
          });
        }
      } else {
        // Add a default section
        await fetch(`/api/scripts/${script.id}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Content",
            sortOrder: 0,
          }),
        });
      }

      router.push(`/studio/scripts/${script.id}/write`);
    } finally {
      setSaving(false);
    }
  }, [title, subtitle, categoryId, purpose, audience, venue, speaker, language, tags, priority, difficulty, filteredTemplates, router]);

  return (
    <Stack gap="md" p="md" maw={700} mx="auto">
      <Title order={3}>New Script</Title>

      {/* Templates quick pick */}
      {filteredTemplates.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" fw={500} mb="sm">Structure Templates</Text>
          <Group gap="xs">
            {filteredTemplates.map((t) => (
              <Button
                key={t.id}
                variant="light"
                size="sm"
                onClick={() => {
                  // Template is applied after creation
                }}
              >
                {t.name}
              </Button>
            ))}
          </Group>
          {filteredTemplates[0] && (
            <Text size="xs" c="dimmed" mt="xs">
              Sections: {filteredTemplates[0].sections.join(" · ")}
            </Text>
          )}
        </Paper>
      )}

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <TextInput
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="e.g., Q3 Team Presentation"
          />
          <TextInput
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.currentTarget.value)}
            placeholder="Optional subtitle"
          />
          <SimpleGrid cols={2}>
            <Select
              label="Category"
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Select category"
              clearable
            />
            <Select
              label="Priority"
              data={["low", "medium", "high", "critical"]}
              value={priority}
              onChange={(v) => setPriority(v ?? "medium")}
            />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <Select
              label="Difficulty"
              data={["easy", "medium", "hard"]}
              value={difficulty}
              onChange={(v) => setDifficulty(v ?? "medium")}
            />
            <TextInput
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.currentTarget.value)}
            />
          </SimpleGrid>
          <TextInput
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.currentTarget.value)}
            placeholder="e.g., Pitch new product feature to stakeholders"
          />
          <SimpleGrid cols={2}>
            <TextInput
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.currentTarget.value)}
              placeholder="e.g., Engineering team"
            />
            <TextInput
              label="Venue"
              value={venue}
              onChange={(e) => setVenue(e.currentTarget.value)}
              placeholder="e.g., Conference Room A"
            />
          </SimpleGrid>
          <TextInput
            label="Speaker"
            value={speaker}
            onChange={(e) => setSpeaker(e.currentTarget.value)}
            placeholder="Your name"
          />
          <TagsInput
            label="Tags"
            value={tags}
            onChange={setTags}
            placeholder="Add tags"
          />
        </Stack>
      </Paper>

      <Group justify="flex-end">
        <Button variant="light" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleCreate} loading={saving} disabled={!title.trim()}>
          Create Script
        </Button>
      </Group>
    </Stack>
  );
}
