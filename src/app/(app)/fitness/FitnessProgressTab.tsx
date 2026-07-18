"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Stack, Group, Text, SimpleGrid, Paper, Badge, Skeleton, RingProgress,
  Box,
} from "@mantine/core";
import { IconChartLine, IconFlame, IconBarbell, IconTrophy } from "@tabler/icons-react";
import { PremiumCard } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

async function fetchStats() {
  const res = await fetch("/api/fitness/stats?includePRs=true");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export function FitnessProgressTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["fitness", "stats"],
    queryFn: fetchStats,
  });

  const personalRecords = data?.personalRecords ?? [];
  const profile = data?.profile;
  const streak = data?.streak ?? 0;
  const weeklyMinutes = data?.weeklyWorkoutMinutes ?? 0;

  if (isLoading) {
    return <Skeleton height={400} radius="md" />;
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title="Progress & Analytics"
        subtitle="Track your improvements and personal records"
      />

      {/* Streak Ring */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <PremiumCard variant="default" padding="lg" className="flex items-center justify-center">
          <Box style={{ textAlign: "center" }}>
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: Math.min(100, (streak / 30) * 100), color: "green" }]}
              label={
                <Box style={{ textAlign: "center" }}>
                  <Text fw={700} size="xl">{streak}</Text>
                  <Text size="xs" c="dimmed">day streak</Text>
                </Box>
              }
            />
            <Text size="xs" c="dimmed" mt="sm">Target: 30 days</Text>
          </Box>
        </PremiumCard>

        <PremiumCard variant="default" padding="lg" className="flex items-center justify-center">
          <Box style={{ textAlign: "center" }}>
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: profile?.weeklyWorkoutGoal ? Math.min(100, (weeklyMinutes / (profile.weeklyWorkoutGoal * 45)) * 100) : 0, color: "blue" }]}
              label={
                <Box style={{ textAlign: "center" }}>
                  <Text fw={700} size="xl">{weeklyMinutes}</Text>
                  <Text size="xs" c="dimmed">min/week</Text>
                </Box>
              }
            />
            <Text size="xs" c="dimmed" mt="sm">Weekly Volume</Text>
          </Box>
        </PremiumCard>

        <PremiumCard variant="default" padding="lg" className="flex items-center justify-center">
          <Box style={{ textAlign: "center" }}>
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: personalRecords.length > 0 ? 100 : 0, color: "yellow" }]}
              label={
                <Box style={{ textAlign: "center" }}>
                  <Text fw={700} size="xl">{personalRecords.length}</Text>
                  <Text size="xs" c="dimmed">PRs</Text>
                </Box>
              }
            />
            <IconTrophy size={20} style={{ marginTop: 4 }} />
          </Box>
        </PremiumCard>
      </SimpleGrid>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <PremiumCard variant="default" padding="lg">
          <Text fw={600} size="sm" mb="md">Personal Records</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {personalRecords.map((pr: {
              id: string; exerciseId: string; recordType: string;
              value: string; reps?: number | null; achievedAt: string;
            }) => (
              <Paper key={pr.id} withBorder p="sm">
                <Group gap="xs" mb={4}>
                  <IconTrophy size={14} className="text-yellow-500" />
                  <Text size="xs" c="dimmed" tt="capitalize">{pr.recordType.replace(/_/g, " ")}</Text>
                </Group>
                <Text fw={700} size="lg">
                  {Number(pr.value).toFixed(1)}
                  {pr.reps ? <Text span size="sm" c="dimmed"> × {pr.reps}</Text> : null}
                </Text>
                <Text size="xs" c="dimmed">{new Date(pr.achievedAt).toLocaleDateString()}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </PremiumCard>
      )}

      {/* Body Stats Summary */}
      {data?.latestMeasurement && (
        <PremiumCard variant="default" padding="lg">
          <Text fw={600} size="sm" mb="md">Latest Body Stats</Text>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            {data.latestMeasurement.weightKg && (
              <Box>
                <Text size="xs" c="dimmed">Weight</Text>
                <Text fw={700} size="lg">{Number(data.latestMeasurement.weightKg).toFixed(1)} kg</Text>
              </Box>
            )}
            {data.latestMeasurement.bodyFatPercentage && (
              <Box>
                <Text size="xs" c="dimmed">Body Fat</Text>
                <Text fw={700} size="lg">{Number(data.latestMeasurement.bodyFatPercentage).toFixed(1)}%</Text>
              </Box>
            )}
            {data.latestMeasurement.muscleMassKg && (
              <Box>
                <Text size="xs" c="dimmed">Muscle Mass</Text>
                <Text fw={700} size="lg">{Number(data.latestMeasurement.muscleMassKg).toFixed(1)} kg</Text>
              </Box>
            )}
            {data.latestMeasurement.waistCm && (
              <Box>
                <Text size="xs" c="dimmed">Waist</Text>
                <Text fw={700} size="lg">{Number(data.latestMeasurement.waistCm).toFixed(1)} cm</Text>
              </Box>
            )}
          </SimpleGrid>
        </PremiumCard>
      )}

      {!data?.latestMeasurement && personalRecords.length === 0 && (
        <PremiumCard variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a" }} padding="lg">
          <Text fw={600} size="lg" c="white">Start Tracking Your Progress</Text>
          <Text size="sm" c="white" opacity={0.8}>
            Log workouts and body measurements to see your progress here.
          </Text>
        </PremiumCard>
      )}
    </Stack>
  );
}
