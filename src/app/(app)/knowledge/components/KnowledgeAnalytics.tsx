"use client";

import { useMemo } from "react";
import {
  Stack,
  Title,
  SimpleGrid,
  Paper,
  Text,
  Group,
  Badge,
} from "@mantine/core";
import type { KnowledgeEntry } from "@/modules/knowledge";

type DashboardStats = {
  total: number;
  learnedThisWeek: number;
  learnedThisMonth: number;
  totalHours: number;
  mostActiveSubject: string | null;
  entriesBySubject: Record<string, number>;
};

type Props = {
  entries: KnowledgeEntry[];
  stats: DashboardStats;
};

export function KnowledgeAnalytics({ entries, stats }: Props) {
  const avgMastery = useMemo(() => {
    if (entries.length === 0) return 0;
    return (
      entries.reduce((sum, e) => sum + e.masteryLevel, 0) / entries.length
    );
  }, [entries]);

  const avgConfidence = useMemo(() => {
    if (entries.length === 0) return 0;
    return (
      entries.reduce((sum, e) => sum + e.confidenceScore, 0) / entries.length
    );
  }, [entries]);

  const reviewedCount = useMemo(
    () => entries.filter((e) => e.reviewStatus !== "not_reviewed").length,
    [entries],
  );

  const masteredCount = useMemo(
    () => entries.filter((e) => e.reviewStatus === "mastered").length,
    [entries],
  );

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      if (e.learningSource) {
        counts[e.learningSource] = (counts[e.learningSource] ?? 0) + 1;
      }
    }
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [entries]);

  return (
    <Stack gap="lg">
      <Title order={2}>Analytics</Title>

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed">Avg Mastery</Text>
          <Text size="xl" fw={700}>{avgMastery.toFixed(1)}</Text>
          <Text size="xs" c="dimmed">/ 10</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed">Avg Confidence</Text>
          <Text size="xl" fw={700}>{avgConfidence.toFixed(1)}</Text>
          <Text size="xs" c="dimmed">/ 10</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed">Reviewed</Text>
          <Text size="xl" fw={700}>{reviewedCount}</Text>
          <Text size="xs" c="dimmed">of {stats.total}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed">Mastered</Text>
          <Text size="xl" fw={700}>{masteredCount}</Text>
          <Text size="xs" c="dimmed">of {stats.total}</Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">Subjects Distribution</Text>
          {Object.keys(stats.entriesBySubject).length === 0 ? (
            <Text c="dimmed" size="sm">No entries yet</Text>
          ) : (
            <Stack gap="xs">
              {Object.entries(stats.entriesBySubject)
                .sort(([, a], [, b]) => b - a)
                .map(([subject, count]) => {
                  const total = stats.total || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={subject}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm">{subject}</Text>
                        <Text size="sm" c="dimmed">
                          {count} ({pct}%)
                        </Text>
                      </Group>
                      <div
                        style={{
                          height: 4,
                          background: "var(--mantine-color-gray-2)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: "var(--mantine-color-blue-5)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">Learning Sources</Text>
          {sourceBreakdown.length === 0 ? (
            <Text c="dimmed" size="sm">No sources recorded</Text>
          ) : (
            <Stack gap="xs">
              {sourceBreakdown.map(([source, count]) => (
                <Group key={source} justify="space-between">
                  <Text size="sm">{source}</Text>
                  <Badge>{count}</Badge>
                </Group>
              ))}
            </Stack>
          )}
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Text fw={500} mb="sm">Difficulty Breakdown</Text>
        <SimpleGrid cols={{ base: 3 }}>
          {(["beginner", "intermediate", "advanced"] as const).map(
            (level) => {
              const count = entries.filter(
                (e) => e.difficultyLevel === level,
              ).length;
              const pct = stats.total > 0
                ? Math.round((count / stats.total) * 100)
                : 0;
              return (
                <Paper key={level} withBorder p="sm" ta="center">
                  <Text size="lg" fw={700}>
                    {count}
                  </Text>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {level}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {pct}%
                  </Text>
                </Paper>
              );
            },
          )}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
