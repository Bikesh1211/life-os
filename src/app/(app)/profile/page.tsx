"use client";

import { motion } from "framer-motion";
import { Stack, Button, SimpleGrid, Skeleton } from "@mantine/core";
import { IconRefresh, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";
import { useGamificationSync } from "@/hooks/use-gamification";
import { ProfileHero } from "./_components/ProfileHero";
import { XPLevelSection } from "./_components/XPLevelSection";
import { StatisticsGrid } from "./_components/StatisticsGrid";
import { StreakSection } from "./_components/StreakSection";
import { AchievementGallery } from "./_components/AchievementGallery";
import { BadgeCollection } from "./_components/BadgeCollection";
import { ActivityTimeline } from "./_components/ActivityTimeline";
import { InsightCards } from "./_components/InsightCards";

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <Skeleton height={140} radius="lg" mb="lg" />
      <Skeleton height={120} radius="lg" mb="lg" />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Skeleton height={200} radius="lg" />
        <Skeleton height={200} radius="lg" />
      </SimpleGrid>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, isLoading } = useProfile();
  const sync = useGamificationSync();

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-2xl border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] p-12 text-center">
          <p className="text-[var(--mantine-color-dimmed)]">
            Unable to load profile. Please try syncing.
          </p>
          <Button
            mt="md"
            onClick={() => sync.mutate()}
            loading={sync.isPending}
            leftSection={<IconRefresh size={16} />}
          >
            Sync Progress
          </Button>
        </div>
      </div>
    );
  }

  const { user, gamification, habits, routines, tasks, goals } = profile;
  if (!gamification) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
            Profile
          </h1>
          <div className="flex gap-2">
            <Button
              variant="light"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={() => sync.mutate()}
              loading={sync.isPending}
            >
              Sync
            </Button>
            <Button
              variant="subtle"
              size="sm"
              component={Link}
              href="/settings"
              leftSection={<IconSettings size={16} />}
            >
              Settings
            </Button>
          </div>
        </div>

        <Stack gap="lg">
          <ProfileHero
            fullName={user.fullName}
            email={user.email}
            imageUrl={user.imageUrl}
            level={gamification.levelInfo.level}
            totalXp={gamification.levelInfo.totalXp}
            progress={gamification.levelInfo.progress}
            createdAt={user.createdAt}
          />

          <XPLevelSection
            levelInfo={gamification.levelInfo}
            currentStreak={gamification.metrics?.currentStreak ?? 0}
            longestStreak={gamification.metrics?.longestStreak ?? 0}
            consistencyScore={gamification.metrics?.consistencyScore ?? 0}
          />

          <StatisticsGrid
            habits={
              habits
                ? {
                    totalHabits: habits.totalHabits,
                    completionRate: habits.completionRate,
                    totalCompletions: habits.totalCompletions,
                    currentStreak: habits.currentStreak,
                  }
                : null
            }
            routines={
              routines
                ? {
                    routineCount: routines.routineCount,
                    completionRate: routines.completionRate,
                    totalCompleted: routines.totalCompleted,
                    consistencyScore: routines.consistencyScore,
                  }
                : null
            }
            tasks={
              tasks
                ? {
                    total: tasks.total,
                    done: tasks.done,
                    todo: tasks.todo,
                    inProgress: tasks.inProgress,
                  }
                : null
            }
            goals={goals}
          />

          <StreakSection
            currentStreak={gamification.metrics?.currentStreak ?? 0}
            longestStreak={gamification.metrics?.longestStreak ?? 0}
            consistencyScore={gamification.metrics?.consistencyScore ?? 0}
            habitsCurrentStreak={habits?.currentStreak}
            habitsLongestStreak={habits?.longestStreak}
          />

          <InsightCards />

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <AchievementGallery
              achievements={gamification.achievements.all.map((a: any) => ({
                id: a.id,
                name: a.name,
                description: a.description,
                icon: a.icon,
                xpReward: a.xpReward,
                unlocked: gamification.achievements.unlocked.some(
                  (u: any) => u.achievementId === a.id,
                ),
              }))}
            />
            <BadgeCollection
              badges={gamification.badges.all.map((b: any) => ({
                id: b.id,
                name: b.name,
                description: b.description,
                icon: b.icon,
                category: b.category,
                xpReward: b.xpReward,
                unlocked: gamification.badges.unlocked.some(
                  (u: any) => u.badgeId === b.id,
                ),
              }))}
            />
          </SimpleGrid>

          <ActivityTimeline />
        </Stack>
      </motion.div>
    </div>
  );
}
