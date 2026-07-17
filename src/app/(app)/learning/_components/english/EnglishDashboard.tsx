"use client";

import { useState, useEffect } from "react";
import { SimpleGrid, Paper, Text, Group, Button, Skeleton, Stack } from "@mantine/core";
import { IconBooks, IconBrain, IconStar, IconTarget, IconVocabulary } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Stats = {
  totalWords: number;
  quizAccuracy: number;
  weeklyAttempts: number;
  dailyStreak: number;
};

type DailyWord = {
  id: string;
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  exampleSentence: string;
};

export default function EnglishDashboard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["english", "stats"],
    queryFn: () => fetch("/api/english/stats").then((r) => r.json()),
    staleTime: 30 * 1000,
  });

  const { data: dailyWord, isLoading: wordLoading } = useQuery<DailyWord>({
    queryKey: ["english", "daily-word"],
    queryFn: async () => {
      const res = await fetch("/api/english/daily-word");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (wordId: string) => {
      await fetch("/api/english/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "vocabulary"] });
    },
  });

  if (statsLoading || wordLoading) {
    return (
      <Stack gap="md">
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} radius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  const scoreColor = stats && stats.quizAccuracy >= 80 ? "green"
    : stats && stats.quizAccuracy >= 50 ? "yellow" : "red";

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb={4}>
            <IconVocabulary size={20} style={{ color: "var(--mantine-color-blue-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Words Learned</Text>
          </Group>
          <Text size="xl" fw={700}>{stats?.totalWords ?? 0}</Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb={4}>
            <IconBrain size={20} style={{ color: `var(--mantine-color-${scoreColor}-6)` }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Quiz Accuracy</Text>
          </Group>
          <Text size="xl" fw={700}>{stats?.quizAccuracy ?? 0}%</Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb={4}>
            <IconTarget size={20} style={{ color: "var(--mantine-color-violet-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Weekly Attempts</Text>
          </Group>
          <Text size="xl" fw={700}>{stats?.weeklyAttempts ?? 0}</Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb={4}>
            <IconStar size={20} style={{ color: "var(--mantine-color-yellow-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Daily Streak</Text>
          </Group>
          <Text size="xl" fw={700}>{stats?.dailyStreak ?? 0}d</Text>
        </Paper>
      </SimpleGrid>

      {dailyWord && (
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="sm" tt="uppercase" c="dimmed">Word of the Day</Text>
          </Group>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xl" fw={700}>{dailyWord.word}</Text>
              <Text size="sm" c="dimmed" mb="xs">
                {dailyWord.pronunciation} &middot; {dailyWord.partOfSpeech}
              </Text>
              <Text size="md" mb="md">{dailyWord.definition}</Text>
              {dailyWord.exampleSentence && (
                <Text size="sm" fs="italic" c="dimmed">"{dailyWord.exampleSentence}"</Text>
              )}
            </div>
            <Button
              variant="light"
              size="sm"
              loading={addMutation.isPending}
              onClick={() => addMutation.mutate(dailyWord.id)}
            >
              Add to Vocabulary
            </Button>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
