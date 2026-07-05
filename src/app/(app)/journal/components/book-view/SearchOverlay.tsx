"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Modal, TextInput, Stack, Text, Group, Chip, Badge, ScrollArea, Box } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import type { JournalEntry } from "@/modules/journal";
import type { BookPage } from "./useBookData";

const MOODS = ["happy", "sad", "neutral", "anxious", "stressed", "motivated", "excited"] as const;

type SearchOverlayProps = {
  opened: boolean;
  onClose: () => void;
  pages: BookPage[];
  onJumpToDate: (date: string) => void;
};

export function SearchOverlay({ opened, onClose, pages, onJumpToDate }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedMood(null);
      setSelectedTag(null);
    }
  }, [opened]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const page of pages) {
      if (page.type === "entry") {
        for (const entry of page.entries) {
          for (const tag of entry.tags ?? []) tags.add(tag);
        }
      }
    }
    return Array.from(tags).sort();
  }, [pages]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const entryPages = pages.filter((p): p is Extract<BookPage, { type: "entry" }> => p.type === "entry");

    return entryPages
      .map((page) => {
        const matching = page.entries.filter((entry: JournalEntry) => {
          if (selectedMood && entry.mood !== selectedMood) return false;
          if (selectedTag && !(entry.tags ?? []).includes(selectedTag)) return false;
          if (q && !entry.title.toLowerCase().includes(q) && !(entry.content ?? "").toLowerCase().includes(q)) return false;
          return true;
        });
        return matching.length > 0 ? { date: page.date, dateLabel: page.dateLabel, entries: matching } : null;
      })
      .filter(Boolean);
  }, [query, selectedMood, selectedTag, pages]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Search & Filter"
      size="lg"
      closeButtonProps={{ icon: <IconX size={16} /> }}
      scrollAreaComponent={ScrollArea}
    >
      <Stack gap="md">
        <TextInput
          ref={inputRef}
          placeholder="Search entries..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={query ? <IconX size={14} className="cursor-pointer" onClick={() => setQuery("")} /> : undefined}
        />

        <Text size="xs" fw={600} c="dimmed">Mood</Text>
        <Group gap={4}>
          {MOODS.map((mood) => (
            <Chip
              key={mood}
              checked={selectedMood === mood}
              onChange={() => setSelectedMood(selectedMood === mood ? null : mood)}
              size="xs"
              variant="outline"
            >
              {mood}
            </Chip>
          ))}
        </Group>

        {allTags.length > 0 && (
          <>
            <Text size="xs" fw={600} c="dimmed">Tags</Text>
            <Group gap={4}>
              {allTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "filled" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </Group>
          </>
        )}

        <ScrollArea h={300}>
          {results.length === 0 && (query || selectedMood || selectedTag) && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No matching entries found
            </Text>
          )}
          {results.length === 0 && !query && !selectedMood && !selectedTag && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              Start typing to search or select filters
            </Text>
          )}
          <Stack gap="xs">
            {results.map((group) => (
              <Box
                key={(group as { date: string }).date}
                className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => {
                  onJumpToDate((group as { date: string }).date);
                  onClose();
                }}
              >
                <Text size="sm" fw={600}>
                  {(group as { dateLabel: string }).dateLabel}
                </Text>
                {(group as { entries: JournalEntry[] }).entries.slice(0, 3).map((entry: JournalEntry) => (
                  <Text key={entry.id} size="xs" c="dimmed" lineClamp={1}>
                    {entry.title}
                  </Text>
                ))}
                {(group as { entries: JournalEntry[] }).entries.length > 3 && (
                  <Text size="xs" c="dimmed">
                    +{(group as { entries: JournalEntry[] }).entries.length - 3} more
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
}
