"use client";

import { useState, useCallback, useRef } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Center,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconRefresh, IconArrowRight } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FlashcardWord = {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  exampleSentence: string | null;
  partOfSpeech: string;
};

export default function FlashcardsTab() {
  const queryClient = useQueryClient();
  const [isFlipped, setIsFlipped] = useState(false);
  const [responseTimeMs, setResponseTimeMs] = useState(0);
  const startTimeRef = useRef(Date.now());

  const { data: words, isLoading, refetch } = useQuery<FlashcardWord[]>({
    queryKey: ["english", "review"],
    queryFn: async () => {
      const res = await fetch("/api/english/review");
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to load review words");
      return data;
    },
    staleTime: 0,
    retry: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const submitMutation = useMutation({
    mutationFn: async ({
      wordId,
      correct,
      responseTimeMs,
    }: {
      wordId: string;
      correct: boolean;
      responseTimeMs: number;
    }) => {
      await fetch("/api/english/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, quizType: "flashcard", correct, responseTimeMs }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "stats"] });
    },
  });

  const currentWord = words?.[currentIndex];

  const handleNext = useCallback(() => {
    if (!words) return;
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      refetch().then(() => setCurrentIndex(0));
    }
    setIsFlipped(false);
    startTimeRef.current = Date.now();
  }, [words, currentIndex, refetch]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentWord) return;
      const elapsed = Date.now() - startTimeRef.current;
      submitMutation.mutate({ wordId: currentWord.id, correct, responseTimeMs: elapsed });
      handleNext();
    },
    [currentWord, submitMutation, handleNext],
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading flashcards...</Text>
      </Center>
    );
  }

  if (!words || words.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>No words to review</Text>
          <Text c="dimmed" ta="center">
            Add words to your vocabulary or complete more lessons to get flashcards.
          </Text>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
          >
            Check Again
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md" align="center">
      <Text size="sm" c="dimmed">
        {currentIndex + 1} / {words.length}
      </Text>

      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{
          width: "100%",
          maxWidth: 480,
          minHeight: 260,
          cursor: "pointer",
          perspective: "1000px",
        }}
        onClick={() => setIsFlipped((f) => !f)}
      >
        {!isFlipped ? (
          <Stack align="center" gap="sm" py="lg">
            <Text size="32px" fw={700} ta="center">
              {currentWord?.word}
            </Text>
            <Text size="lg" c="dimmed">
              {currentWord?.pronunciation}
            </Text>
            <Badge variant="light" size="sm">{currentWord?.partOfSpeech}</Badge>
            <Text size="sm" c="dimmed" mt="md">Tap to flip</Text>
          </Stack>
        ) : (
          <Stack align="center" gap="md" py="lg">
            <Text size="xl" fw={600} ta="center">
              {currentWord?.definition}
            </Text>
            {currentWord?.exampleSentence && (
              <Text size="sm" fs="italic" c="dimmed" ta="center">
                "{currentWord.exampleSentence}"
              </Text>
            )}
            <Text size="sm" c="dimmed" mt="md">Tap to flip back</Text>
          </Stack>
        )}
      </Paper>

      <Group gap="md">
        <Button
          variant="light"
          color="red"
          onClick={() => handleAnswer(false)}
          loading={submitMutation.isPending}
        >
          Study Again
        </Button>
        <Button
          variant="light"
          color="green"
          onClick={() => handleAnswer(true)}
          loading={submitMutation.isPending}
        >
          Got it
        </Button>
      </Group>
    </Stack>
  );
}
