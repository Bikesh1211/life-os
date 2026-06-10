"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Title,
  Group,
  TextInput,
  Select,
  SimpleGrid,
  Paper,
  Text,
  Badge,
  ActionIcon,
  Grid,
  Tabs,
  rem,
} from "@mantine/core";
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconCalendar,
} from "@tabler/icons-react";
import Link from "next/link";
import type { KnowledgeEntry } from "@/modules/knowledge";

type Props = {
  entries: KnowledgeEntry[];
  subjects: string[];
};

export function KnowledgeLibrary({ entries, subjects }: Props) {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (subjectFilter && e.subject !== subjectFilter) return false;
      return true;
    });
  }, [entries, query, subjectFilter]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Library</Title>
        <Group gap="xs">
          <ActionIcon
            variant={viewMode === "grid" ? "filled" : "subtle"}
            onClick={() => setViewMode("grid")}
          >
            <IconLayoutGrid size={18} />
          </ActionIcon>
          <ActionIcon
            variant={viewMode === "list" ? "filled" : "subtle"}
            onClick={() => setViewMode("list")}
          >
            <IconList size={18} />
          </ActionIcon>
          <ActionIcon
            variant={viewMode === "timeline" ? "filled" : "subtle"}
            onClick={() => setViewMode("timeline")}
          >
            <IconCalendar size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Group>
        <TextInput
          placeholder="Search entries..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by subject"
          data={subjects}
          value={subjectFilter}
          onChange={setSubjectFilter}
          clearable
          style={{ width: 200 }}
        />
      </Group>

      {viewMode === "grid" && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
          {filtered.length === 0 && (
            <Text c="dimmed" py="xl">No entries found</Text>
          )}
        </SimpleGrid>
      )}

      {viewMode === "list" && (
        <Stack gap="xs">
          {filtered.map((entry) => (
            <EntryListItem key={entry.id} entry={entry} />
          ))}
          {filtered.length === 0 && (
            <Text c="dimmed" py="xl">No entries found</Text>
          )}
        </Stack>
      )}

      {viewMode === "timeline" && (
        <TimelineView entries={filtered} />
      )}
    </Stack>
  );
}

function EntryCard({ entry }: { entry: KnowledgeEntry }) {
  const difficultyColor: Record<string, string> = {
    beginner: "green",
    intermediate: "yellow",
    advanced: "red",
  };

  return (
    <Paper
      component={Link}
      href={`/knowledge/${entry.id}`}
      withBorder
      p="md"
      radius="md"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Stack gap="xs">
        <Text fw={600} lineClamp={2}>{entry.title}</Text>
        <Group gap="xs">
          <Badge size="sm" variant="light">{entry.subject}</Badge>
          <Badge
            size="sm"
            color={difficultyColor[entry.difficultyLevel] ?? "gray"}
            variant="dot"
          >
            {entry.difficultyLevel}
          </Badge>
        </Group>
        {entry.summary && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {entry.summary}
          </Text>
        )}
        {entry.tags.length > 0 && (
          <Group gap={4}>
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="xs" color="gray" variant="outline">
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge size="xs" color="gray" variant="outline">
                +{entry.tags.length - 3}
              </Badge>
            )}
          </Group>
        )}
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {new Date(entry.dateLearned).toLocaleDateString()}
          </Text>
          <Text size="xs" c="dimmed">
            {entry.masteryLevel}/10
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

function EntryListItem({ entry }: { entry: KnowledgeEntry }) {
  const difficultyColor: Record<string, string> = {
    beginner: "green",
    intermediate: "yellow",
    advanced: "red",
  };

  return (
    <Paper
      component={Link}
      href={`/knowledge/${entry.id}`}
      withBorder
      p="sm"
      radius="md"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Group justify="space-between" wrap="nowrap">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text fw={500} truncate>{entry.title}</Text>
          <Group gap="xs">
            <Badge size="sm" variant="light">{entry.subject}</Badge>
            <Badge
              size="sm"
              color={difficultyColor[entry.difficultyLevel] ?? "gray"}
              variant="dot"
            >
              {entry.difficultyLevel}
            </Badge>
            <Text size="xs" c="dimmed">
              Mastery: {entry.masteryLevel}/10
            </Text>
          </Group>
        </div>
        <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
          {new Date(entry.dateLearned).toLocaleDateString()}
        </Text>
      </Group>
    </Paper>
  );
}

function TimelineView({ entries }: { entries: KnowledgeEntry[] }) {
  const grouped = useMemo(() => {
    const groups: Record<string, KnowledgeEntry[]> = {};
    for (const entry of entries) {
      const key = new Date(entry.dateLearned).toISOString().split("T")[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  return (
    <Stack gap="md">
      {grouped.map(([date, dayEntries]) => (
        <div key={date}>
          <Text fw={600} size="sm" c="dimmed" mb="xs">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Stack gap={4}>
            {dayEntries.map((entry) => (
              <Paper
                key={entry.id}
                component={Link}
                href={`/knowledge/${entry.id}`}
                p="xs"
                withBorder
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge size="sm" variant="light">{entry.subject}</Badge>
                    <Text size="sm">{entry.title}</Text>
                  </Group>
                  <Badge size="sm" color="gray" variant="outline">
                    {entry.masteryLevel}/10
                  </Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      ))}
      {grouped.length === 0 && (
        <Text c="dimmed" py="xl" ta="center">No entries found</Text>
      )}
    </Stack>
  );
}
