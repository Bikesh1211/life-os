"use client";

import { useEffect, useState } from "react";
import { SimpleGrid, Card, Text, Group, Badge, Stack, Title, Button, Anchor, TextInput, Select, ActionIcon } from "@mantine/core";
import { IconPlus, IconSearch, IconStar, IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";

type ScriptItem = {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  priority: string;
  difficulty: string;
  categoryId: string | null;
  isFavorite: boolean;
  wordCount: number;
  sectionCount: number;
  eventDate: string | null;
  updatedAt: string;
};

const statusColors: Record<string, string> = {
  draft: "gray",
  practicing: "blue",
  ready: "green",
  archived: "orange",
};

export function ScriptsListContent() {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/scripts?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then(setScripts)
      .catch(() => setScripts([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <Stack gap="md" mt="md">
      <Group justify="space-between">
        <Title order={3}>Scripts</Title>
        <Button component={Link} href="/studio/scripts/new" leftSection={<IconPlus size={16} />}>
          New Script
        </Button>
      </Group>

      <Group>
        <TextInput
          placeholder="Search scripts..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: "", label: "All" },
            { value: "draft", label: "Draft" },
            { value: "practicing", label: "Practicing" },
            { value: "ready", label: "Ready" },
            { value: "archived", label: "Archived" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
        />
      </Group>

      {loading ? (
        <Text>Loading...</Text>
      ) : scripts.length === 0 ? (
        <Text c="dimmed">No scripts yet. Create your first one!</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {scripts.map((s) => (
            <Anchor key={s.id} component={Link} href={`/studio/scripts/${s.id}/write`} underline="never">
              <Card withBorder padding="lg" radius="md">
                <Group justify="space-between" mb="xs">
                  <Badge color={statusColors[s.status]} variant="light">{s.status}</Badge>
                  <ActionIcon variant="subtle" size="sm">
                    {s.isFavorite ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                  </ActionIcon>
                </Group>
                <Text fw={600} size="md" lineClamp={1}>{s.title}</Text>
                {s.subtitle && <Text size="sm" c="dimmed" lineClamp={1}>{s.subtitle}</Text>}
                <Group gap="xs" mt="sm">
                  <Badge size="sm" variant="dot" color={s.priority === "critical" ? "red" : s.priority === "high" ? "orange" : "blue"}>
                    {s.priority}
                  </Badge>
                  <Text size="xs" c="dimmed">{s.wordCount} words</Text>
                  <Text size="xs" c="dimmed">{s.sectionCount} sections</Text>
                </Group>
                {s.eventDate && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Event: {new Date(s.eventDate).toLocaleDateString()}
                  </Text>
                )}
              </Card>
            </Anchor>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
