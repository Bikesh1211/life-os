"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Stack, Group, Text, SimpleGrid, Button, Paper, Badge, Skeleton, Box,
  Progress, RingProgress,
} from "@mantine/core";
import { IconRun, IconFlame, IconCalendarBolt, IconBarbell, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/stat-card";
import { PremiumCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { apiFetch, toSearchParams } from "@/core/api/http";

async function fetchStats() {
  return apiFetch<any>(`/api/fitness/stats${toSearchParams({ includePRs: true })}`);
}

export function FitnessOverviewTab() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["fitness", "stats"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={120} radius="md" />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={100} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  const profile = data?.profile;
  const weeklyMinutes = data?.weeklyWorkoutMinutes ?? 0;
  const streak = data?.streak ?? 0;
  const weeklyGoal = data?.weeklyGoal ?? 4;
  const recentSessions = data?.recentSessions ?? [];
  const latestMeasurement = data?.latestMeasurement;
  const personalRecords = data?.personalRecords ?? [];

  const goalCompletion = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyMinutes / (weeklyGoal * 45)) * 100)) : 0;
  const thisWeekWorkouts = recentSessions.filter(
    (s: { date: string }) => {
      const d = new Date(s.date);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek;
    },
  ).length;

  return (
    <Stack gap="lg">
      {/* Header */}
      <PageHeader
        title="Fitness & Body Transformation OS"
        subtitle={profile?.fitnessGoal
          ? `Goal: ${profile.fitnessGoal.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`
          : "Transform your body, track your progress"}
      >
        <Group>
          <Button
            leftSection={<IconBarbell size={18} />}
            variant="gradient"
            gradient={{ from: "green", to: "teal" }}
            onClick={() => router.push("/fitness/workout")}
          >
            Start Workout
          </Button>
          <Button
            leftSection={<IconPlus size={18} />}
            variant="light"
            onClick={() => router.push("/fitness?tab=measurements")}
          >
            Log Measurements
          </Button>
        </Group>
      </PageHeader>

      {/* Stat Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <StatCard
          label="Weekly Minutes"
          value={weeklyMinutes}
          icon={IconRun}
          color="green"
          subtitle={`Goal: ${weeklyGoal} workouts/week`}
          delay={0}
        />
        <StatCard
          label="Current Streak"
          value={`${streak} days`}
          icon={IconCalendarBolt}
          color="orange"
          subtitle={streak === 1 ? "Yesterday" : "Keep going!"}
          delay={1}
        />
        <StatCard
          label="This Week"
          value={`${thisWeekWorkouts}/${weeklyGoal}`}
          icon={IconBarbell}
          color="blue"
          subtitle="Workouts completed"
          delay={2}
        />
        <StatCard
          label="Volume"
          value={recentSessions.length > 0 ? `${weeklyMinutes * 5} kg` : "—"}
          icon={IconFlame}
          color="red"
          subtitle="Estimated weekly"
          delay={3}
        />
      </SimpleGrid>

      {/* Weekly Goal Progress */}
      <PremiumCard variant="default" padding="lg">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">Weekly Workout Goal</Text>
          <Text size="sm" c="dimmed">{thisWeekWorkouts} / {weeklyGoal} workouts</Text>
        </Group>
        <Progress
          value={Math.min(100, (thisWeekWorkouts / weeklyGoal) * 100)}
          color="green"
          size="lg"
          radius="md"
          animated
        />
      </PremiumCard>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Recent Workouts */}
        <PremiumCard variant="default" padding="lg">
          <Text fw={600} size="sm" mb="md">Recent Workouts</Text>
          {recentSessions.length === 0 ? (
            <Text c="dimmed" size="sm">No workouts yet. Start your fitness journey today!</Text>
          ) : (
            <Stack gap="xs">
              {recentSessions.map((session: { id: string; date: string; name?: string; durationMinutes?: number; isCompleted: boolean }, i: number) => (
                <Paper
                  key={session.id}
                  withBorder
                  p="sm"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => router.push(`/fitness/workout/${session.id}`)}
                >
                  <Group justify="space-between">
                    <Group>
                      <Text size="sm" fw={500}>{session.name ?? "Workout"}</Text>
                      <Text size="xs" c="dimmed">{session.date}</Text>
                    </Group>
                    <Group gap="xs">
                      {session.durationMinutes && (
                        <Text size="xs" c="dimmed">{session.durationMinutes} min</Text>
                      )}
                      {session.isCompleted ? (
                        <Badge size="sm" color="green" variant="light">Done</Badge>
                      ) : (
                        <Badge size="sm" color="yellow" variant="light">In Progress</Badge>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </PremiumCard>

        {/* Latest Measurements */}
        <PremiumCard variant="default" padding="lg">
          <Text fw={600} size="sm" mb="md">Latest Body Measurements</Text>
          {!latestMeasurement ? (
            <Text c="dimmed" size="sm">No measurements logged yet.</Text>
          ) : (
            <SimpleGrid cols={2} spacing="sm">
              {latestMeasurement.weightKg && (
                <Box>
                  <Text size="xs" c="dimmed">Weight</Text>
                  <Text fw={600}>{Number(latestMeasurement.weightKg).toFixed(1)} kg</Text>
                </Box>
              )}
              {latestMeasurement.bodyFatPercentage && (
                <Box>
                  <Text size="xs" c="dimmed">Body Fat</Text>
                  <Text fw={600}>{Number(latestMeasurement.bodyFatPercentage).toFixed(1)}%</Text>
                </Box>
              )}
              {latestMeasurement.muscleMassKg && (
                <Box>
                  <Text size="xs" c="dimmed">Muscle Mass</Text>
                  <Text fw={600}>{Number(latestMeasurement.muscleMassKg).toFixed(1)} kg</Text>
                </Box>
              )}
              {latestMeasurement.waistCm && (
                <Box>
                  <Text size="xs" c="dimmed">Waist</Text>
                  <Text fw={600}>{Number(latestMeasurement.waistCm).toFixed(1)} cm</Text>
                </Box>
              )}
            </SimpleGrid>
          )}
        </PremiumCard>
      </SimpleGrid>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <PremiumCard variant="default" padding="lg">
          <Text fw={600} size="sm" mb="md">Recent Personal Records</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {personalRecords.slice(0, 6).map((pr: { id: string; exerciseId: string; recordType: string; value: string; reps?: number | null; achievedAt: string }) => (
              <Paper key={pr.id} withBorder p="sm">
                <Text size="xs" c="dimmed" tt="capitalize">{pr.recordType.replace(/_/g, " ")}</Text>
                <Text fw={600}>{Number(pr.value).toFixed(1)} {pr.reps ? `× ${pr.reps}` : ""}</Text>
                <Text size="xs" c="dimmed">{new Date(pr.achievedAt).toLocaleDateString()}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </PremiumCard>
      )}

      {/* Profile Setup CTA */}
      {!profile && (
        <PremiumCard variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a" }} padding="lg">
          <Group justify="space-between">
            <Box>
              <Text fw={600} size="lg" c="white">Set Up Your Fitness Profile</Text>
              <Text size="sm" c="white" opacity={0.8}>
                Configure your goals, body metrics, and weekly targets to get the most out of Fitness OS.
              </Text>
            </Box>
            <Button
              variant="white"
              onClick={() => router.push("/fitness?tab=measurements")}
            >
              Get Started
            </Button>
          </Group>
        </PremiumCard>
      )}
    </Stack>
  );
}
