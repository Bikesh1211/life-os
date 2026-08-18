"use client";

import { useState, useCallback, useRef } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Center,
  TextInput,
  Badge,
} from "@mantine/core";
import { IconRefresh, IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toSearchParams } from "@/core/api/http";

type FillBlankQuestion = {
  wordId: string;
  word: string;
  sentence: string;
  hint: string | null;
};

export default function FillBlankTab() {
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startTimeRef = useRef(Date.now());

  const { data: question, isLoading, refetch } = useQuery<FillBlankQuestion>({
    queryKey: ["english", "fill-blank"],
    queryFn: () => apiFetch<FillBlankQuestion>(`/api/english/quiz${toSearchParams({ type: "fill_blank" })}`),
    staleTime: 0,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: ({
      wordId,
      correct,
      responseTimeMs,
    }: {
      wordId: string;
      correct: boolean;
      responseTimeMs: number;
    }) =>
      apiFetch("/api/english/quiz", {
        method: "POST",
        body: JSON.stringify({ wordId, quizType: "fill_blank", correct, responseTimeMs }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["english", "stats"] });
    },
  });

  const handleCheck = useCallback(() => {
    if (!question || !answer.trim()) return;
    const correct = answer.trim().toLowerCase() === question.word.toLowerCase();
    setIsCorrect(correct);
    setIsChecked(true);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    const elapsed = Date.now() - startTimeRef.current;
    submitMutation.mutate({ wordId: question.wordId, correct, responseTimeMs: elapsed });
  }, [question, answer, submitMutation]);

  const handleNext = useCallback(() => {
    setAnswer("");
    setIsChecked(false);
    setIsCorrect(false);
    startTimeRef.current = Date.now();
    refetch();
  }, [refetch]);

  const renderSentence = () => {
    if (!question) return "";
    return question.sentence.replace("______", "______");
  };

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
        {isChecked && (
          <Badge color={isCorrect ? "green" : "red"}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </Badge>
        )}
      </Group>

      <Paper withBorder p="xl" radius="md" style={{ width: "100%", maxWidth: 560 }}>
        <Stack gap="lg" align="center">
          <Badge variant="light" size="lg">Fill in the blank</Badge>

          <Text size="xl" ta="center" lh={1.6}>
            {question.sentence.split("______").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <Text
                    span
                    fw={700}
                    size="xl"
                    td={isChecked ? (isCorrect ? "none" : "line-through") : "none"}
                    c={isChecked ? (isCorrect ? "green" : "red") : undefined}
                    style={{
                      borderBottom: "2px solid var(--mantine-color-dimmed)",
                      padding: "0 8px",
                      minWidth: 120,
                      display: "inline-block",
                    }}
                  >
                    {isChecked ? answer : "______"}
                  </Text>
                )}
              </span>
            ))}
          </Text>

          {isChecked && !isCorrect && (
            <Text size="md" c="green" fw={500}>
              Correct answer: {question.word}
            </Text>
          )}

          {!isChecked && (
            <TextInput
              placeholder="Type the missing word..."
              value={answer}
              onChange={(e) => setAnswer(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheck();
              }}
              size="lg"
              style={{ width: "100%" }}
              rightSection={
                <Button
                  size="sm"
                  onClick={handleCheck}
                  disabled={!answer.trim()}
                  variant="light"
                >
                  <IconCheck size={16} />
                </Button>
              }
              autoFocus
            />
          )}

          {question.hint && !isChecked && (
            <Text size="sm" c="dimmed" fs="italic">
              Hint: {question.hint}
            </Text>
          )}
        </Stack>
      </Paper>

      {isChecked && (
        <Button onClick={handleNext} rightSection={<IconArrowRight size={16} />}>
          Next Question
        </Button>
      )}
    </Stack>
  );
}
