"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  TextInput,
  Paper,
  Text,
  Group,
  Stack,
  Button,
  ActionIcon,
  Tabs,
  Badge,
  Tooltip,
} from "@mantine/core";
import { IconSearch, IconPlus, IconTrash, IconHeart, IconHeartFilled, IconStar, IconCheck, IconX } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SearchWord = {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  partOfSpeech: string;
};

type VocabularyItem = {
  id: string;
  wordId: string;
  word: string;
  pronunciation: string;
  definition: string;
  partOfSpeech: string;
  mastery: "learning" | "known" | "mastered";
  isFavorite: boolean;
  addedAt: string;
};

const masteryTabs = [
  { value: "all", label: "All" },
  { value: "learning", label: "Learning" },
  { value: "known", label: "Known" },
  { value: "mastered", label: "Mastered" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function VocabularyPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchWord[]>({
    queryKey: ["english", "search", debouncedSearch],
    queryFn: () =>
      fetch(`/api/english/words?q=${encodeURIComponent(debouncedSearch)}`).then((r) => r.json()),
    enabled: debouncedSearch.length > 0,
  });

  const { data: vocabulary, isLoading: vocabLoading } = useQuery<VocabularyItem[]>({
    queryKey: ["english", "vocabulary", activeTab],
    queryFn: () => fetch("/api/english/vocabulary").then((r) => r.json()),
  });

  const addMutation = useMutation({
    mutationFn: async (wordId: string) => {
      const res = await fetch("/api/english/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add word");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "vocabulary"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/english/vocabulary/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "vocabulary"] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await fetch(`/api/english/vocabulary/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "vocabulary"] });
    },
  });

  const masteryMutation = useMutation({
    mutationFn: async ({ id, mastery }: { id: string; mastery: string }) => {
      await fetch(`/api/english/vocabulary/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mastery }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "vocabulary"] });
    },
  });

  const filteredWords = useMemo(() => {
    if (!vocabulary) return [];
    if (activeTab === "all") return vocabulary;
    return vocabulary.filter((w) => w.mastery === activeTab);
  }, [vocabulary, activeTab]);

  const masteryColor = (level: string) => {
    switch (level) {
      case "mastered": return "green";
      case "known": return "blue";
      default: return "yellow";
    }
  };

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search words..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      {debouncedSearch && searchResults && searchResults.length > 0 && (
        <Stack gap="sm">
          <Text size="sm" fw={500} c="dimmed">Search Results</Text>
          {searchResults.map((word) => (
            <Paper key={word.id} withBorder p="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="xs" mb={2}>
                    <Text fw={600}>{word.word}</Text>
                    <Text size="sm" c="dimmed">{word.pronunciation}</Text>
                    <Badge size="xs" variant="light">{word.partOfSpeech}</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">{word.definition}</Text>
                </div>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  loading={addMutation.isPending}
                  onClick={() => addMutation.mutate(word.id)}
                >
                  Add
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Tabs value={activeTab} onChange={(v) => setActiveTab(v ?? "all")}>
        <Tabs.List mb="sm">
          {masteryTabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>{tab.label}</Tabs.Tab>
          ))}
        </Tabs.List>

        <Stack gap="sm">
          {filteredWords.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              {activeTab === "all" ? "No words in your vocabulary yet" : `No ${activeTab} words`}
            </Text>
          )}
          {filteredWords.map((item) => (
            <Paper key={item.id} withBorder p="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="xs" mb={2}>
                    <Text fw={600}>{item.word}</Text>
                    <Text size="sm" c="dimmed">{item.pronunciation}</Text>
                    <Badge variant="light" size="xs">{item.partOfSpeech}</Badge>
                    <Badge color={masteryColor(item.mastery)} variant="light" size="xs">
                      {item.mastery}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">{item.definition}</Text>
                </div>
                <Group gap="xs">
                  <Tooltip label={item.isFavorite ? "Remove favorite" : "Add favorite"}>
                    <ActionIcon
                      variant="subtle"
                      color={item.isFavorite ? "red" : "gray"}
                      onClick={() =>
                        favoriteMutation.mutate({ id: item.id, isFavorite: item.isFavorite })
                      }
                    >
                      {item.isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Mark as Learning">
                    <ActionIcon
                      variant={item.mastery === "learning" ? "filled" : "subtle"}
                      color="yellow"
                      size="sm"
                      onClick={() => masteryMutation.mutate({ id: item.id, mastery: "learning" })}
                    >
                      <IconStar size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Mark as Known">
                    <ActionIcon
                      variant={item.mastery === "known" ? "filled" : "subtle"}
                      color="blue"
                      size="sm"
                      onClick={() => masteryMutation.mutate({ id: item.id, mastery: "known" })}
                    >
                      <IconCheck size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Mark as Mastered">
                    <ActionIcon
                      variant={item.mastery === "mastered" ? "filled" : "subtle"}
                      color="green"
                      size="sm"
                      onClick={() => masteryMutation.mutate({ id: item.id, mastery: "mastered" })}
                    >
                      <IconStar size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Remove">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => removeMutation.mutate(item.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Tabs>
    </Stack>
  );
}
