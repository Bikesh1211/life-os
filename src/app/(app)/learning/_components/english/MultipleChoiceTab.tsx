"use client";

import { useState, useCallback, useRef } from "react";
import { Paper, Text, Group, Button, Stack, Center, Badge } from "@mantine/core";
import { IconRefresh, IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type QuizQuestion = {
  wordId: string;
  word: string;
  correctDefinition: string;
  options: string[];
};

type QuizResult = {
  correct: boolean;
  correctDefinition: string;
};

export default function MultipleChoiceTab() {
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startTimeRef = useRef(Date.now());

  const { data: question, isLoading, refetch } = useQuery<QuizQuestion>({
    queryKey: ["english", "quiz"],
    queryFn: async () => {
      const res = await fetch("/api/english/quiz");
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to load question");
      return {
        wordId: data.wordId,
        word: data.word,
        correctDefinition: data.definition,
        options: data.options,
      };
    },
    staleTime: 0,
    retry: false,
  });

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
        body: JSON.stringify({ wordId, quizType: "multiple_choice", correct, responseTimeMs }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "stats"] });
    },
  });

  const handleSelect = useCallback(
    (index: number) => {
      if (isAnswered || !question) return;
      setSelectedIndex(index);
      setIsAnswered(true);

      const correct = question.options[index] === question.correctDefinition;
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

      const elapsed = Date.now() - startTimeRef.current;
      submitMutation.mutate({ wordId: question.wordId, correct, responseTimeMs: elapsed });
    },
    [isAnswered, question, submitMutation],
  );

  const handleNext = useCallback(() => {
    setSelectedIndex(null);
    setIsAnswered(false);
    startTimeRef.current = Date.now();
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading question...</Text>
      </Center>
    );
  }

  if (!question) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>No questions available</Text>
          <Text c="dimmed" ta="center">
            Add words to your vocabulary to start practicing.
          </Text>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md" align="center">
      <Group gap="lg">
        <Text size="sm" c="dimmed">
          Score: {score.correct}/{score.total}
        </Text>
        {isAnswered && (
          <Badge color={selectedIndex !== null && question.options[selectedIndex] === question.correctDefinition ? "green" : "red"}>
            {selectedIndex !== null && question.options[selectedIndex] === question.correctDefinition ? "Correct!" : "Incorrect"}
          </Badge>
        )}
      </Group>

      <Paper withBorder p="xl" radius="md" style={{ width: "100%", maxWidth: 560 }}>
        <Stack gap="lg" align="center">
          <Badge variant="light" size="lg">What does this word mean?</Badge>
          <Text size="28px" fw={700}>{question.word}</Text>

          <Stack gap="sm" style={{ width: "100%" }}>
            {question.options.map((option, index) => {
              const isCorrectOption = option === question.correctDefinition;
              let buttonColor: string | undefined;
              if (isAnswered) {
                if (isCorrectOption) buttonColor = "green";
                else if (index === selectedIndex) buttonColor = "red";
              }

              return (
                <Button
                  key={index}
                  variant={isAnswered && isCorrectOption ? "filled" : index === selectedIndex ? "filled" : "outline"}
                  color={buttonColor}
                  fullWidth
                  size="md"
                  radius="md"
                  onClick={() => handleSelect(index)}
                  disabled={isAnswered}
                  styles={{
                    root: {
                      height: "auto",
                      padding: "12px 16px",
                      textAlign: "left",
                      whiteSpace: "normal",
                    },
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    {isAnswered && isCorrectOption && <IconCheck size={18} />}
                    {isAnswered && index === selectedIndex && !isCorrectOption && <IconX size={18} />}
                    <Text style={{ flex: 1 }}>{option}</Text>
                  </Group>
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {isAnswered && (
        <Button onClick={handleNext} rightSection={<IconArrowRight size={16} />}>
          Next Question
        </Button>
      )}
    </Stack>
  );
}
