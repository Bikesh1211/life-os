"use client";

import { Paper, Group, Text, RingProgress, Stack, Button, SimpleGrid } from "@mantine/core";
import { IconTrophy, IconFlame, IconTarget, IconAward } from "@tabler/icons-react";
import Link from "next/link";
import { useGamificationProfile, useGamificationSync } from "@/hooks/use-gamification";
import { LevelCard } from "./LevelCard";
import { ChallengeCard } from "./ChallengeCard";

export function GamificationWidget() {
  const { data: profile, isLoading } = useGamificationProfile();
  const sync = useGamificationSync();

  if (isLoading) {
    return (
      <Paper withBorder p="lg" radius="md">
        <div className="h-24 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
      </Paper>
    );
  }

  if (!profile) {
    return (
      <Paper withBorder p="lg" radius="md" ta="center">
        <Stack align="center" gap="sm">
          <IconTrophy size={32} className="text-[var(--mantine-color-dimmed)]" />
          <Text size="sm" c="dimmed">
            Gamification not loaded
          </Text>
          <Button
            size="xs"
            onClick={() => sync.mutate()}
            loading={sync.isPending}
          >
            Load Progress
          </Button>
        </Stack>
      </Paper>
    );
  }

  const { levelInfo, metrics, challenges } = profile;

  return (
    <Stack gap="md">
      <LevelCard
        level={levelInfo.level}
        totalXp={levelInfo.totalXp}
        currentXp={levelInfo.currentXp}
        xpForNext={levelInfo.xpForNext}
        progress={levelInfo.progress}
        currentStreak={metrics?.currentStreak}
      />

      <SimpleGrid cols={{ base: 2 }} spacing="sm">
        <Paper withBorder p="sm" radius="md" ta="center">
          <Group justify="center" gap="xs" mb={4}>
            <IconAward size={16} className="text-yellow-500" />
            <Text size="xs" c="dimmed">
              Achievements
            </Text>
          </Group>
          <Text fw={700}>
            {profile.achievements.unlocked.length}/{profile.achievements.all.length}
          </Text>
        </Paper>

        <Paper withBorder p="sm" radius="md" ta="center">
          <Group justify="center" gap="xs" mb={4}>
            <IconTarget size={16} className="text-blue-500" />
            <Text size="xs" c="dimmed">
              Badges
            </Text>
          </Group>
          <Text fw={700}>
            {profile.badges.unlocked.length}/{profile.badges.all.length}
          </Text>
        </Paper>
      </SimpleGrid>

      {challenges.length > 0 && (
        <>
          <Group justify="apart">
            <Text fw={600} size="sm">
              Active Challenges
            </Text>
            <Button
              component={Link}
              href="/gamification"
              variant="subtle"
              size="compact-sm"
            >
              View All
            </Button>
          </Group>

          <Stack gap="sm">
            {challenges.slice(0, 3).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                name={challenge.name}
                description={challenge.description}
                challengeType={challenge.challengeType}
                xpReward={challenge.xpReward}
                progress={challenge.progress}
                criteriaValue={challenge.criteriaValue}
                isCompleted={challenge.isCompleted}
              />
            ))}
          </Stack>
        </>
      )}

      <Button
        component={Link}
        href="/gamification"
        fullWidth
        variant="light"
        leftSection={<IconTrophy size={16} />}
      >
        View Full Profile
      </Button>
    </Stack>
  );
}
