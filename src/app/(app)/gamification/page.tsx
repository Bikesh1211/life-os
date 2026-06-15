"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Paper,
  Button,
  SimpleGrid,
  Tabs,
  RingProgress,
  Badge,
  Timeline,
} from "@mantine/core";
import {
  IconTrophy,
  IconRefresh,
  IconAward,
  IconTarget,
  IconFlame,
  IconHistory,
  IconStar,
  IconCheck,
  IconRepeat,
  IconTrendingUp,
  IconClipboardCheck,
  IconCrown,
  IconSunrise,
  IconMoon,
  IconWind,
} from "@tabler/icons-react";
import {
  useGamificationProfile,
  useGamificationSync,
  useXpHistory,
  useAchievements,
  useBadges,
  useChallenges,
} from "@/hooks/use-gamification";
import { LevelCard } from "@/modules/gamification/components/LevelCard";
import { AchievementCard } from "@/modules/gamification/components/AchievementCard";
import { BadgeCard } from "@/modules/gamification/components/BadgeCard";
import { ChallengeCard } from "@/modules/gamification/components/ChallengeCard";

const badgeCategoryColors: Record<string, string> = {
  habits: "green",
  tasks: "blue",
  routines: "violet",
  streaks: "orange",
  general: "gray",
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
  <Paper withBorder p="md" radius="md">
      <Group gap="sm">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `var(--mantine-color-${color}-light)` }}
        >
          <Icon size={22} style={{ color: `var(--mantine-color-${color}-filled)` }} />
        </div>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

function XPHistorySection() {
  const { data: history, isLoading } = useXpHistory(20);

  if (isLoading) {
    return (
      <Paper withBorder p="md" radius="md">
        <div className="h-32 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb="md">
        Recent XP History
      </Text>
      {history && history.length > 0 ? (
        <Timeline active={-1} bulletSize={20} lineWidth={2}>
          {history.slice(0, 15).map((tx) => (
            <Timeline.Item
              key={tx.id}
              title={
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {tx.description}
                  </Text>
                  <Badge size="sm" color="yellow" variant="light">
                    +{tx.xpAmount} XP
                  </Badge>
                </Group>
              }
            >
              <Text size="xs" c="dimmed">
                {new Date(tx.createdAt).toLocaleDateString()}{" "}
                {new Date(tx.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No XP history yet. Start completing habits, tasks, and routines to earn XP.
        </Text>
      )}
    </Paper>
  );
}

export default function GamificationPage() {
  const { data: profile, isLoading: profileLoading } = useGamificationProfile();
  const sync = useGamificationSync();
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  if (profileLoading) {
    return (
      <Stack gap="lg">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <div className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]"
            />
          ))}
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <Group justify="apart">
            <div>
              <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
                Gamification
              </h1>
              <p className="mt-1 text-[var(--mantine-color-dimmed)]">
                Track your XP, levels, achievements, and badges
              </p>
            </div>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={() => sync.mutate()}
              loading={sync.isPending}
              variant="light"
            >
              Sync Progress
            </Button>
          </Group>
        </div>

        {profile && (
          <LevelCard
            level={profile.levelInfo.level}
            totalXp={profile.levelInfo.totalXp}
            currentXp={profile.levelInfo.currentXp}
            xpForNext={profile.levelInfo.xpForNext}
            progress={profile.levelInfo.progress}
            currentStreak={profile.metrics?.currentStreak}
          />
        )}

        {profile && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} my="lg">
            <StatCard
              label="Total XP"
              value={profile.levelInfo.totalXp.toLocaleString()}
              icon={IconTrophy}
              color="yellow"
            />
            <StatCard
              label="Level"
              value={profile.levelInfo.level}
              icon={IconTrendingUp}
              color="blue"
            />
            <StatCard
              label="Current Streak"
              value={`${profile.metrics?.currentStreak ?? 0} days`}
              icon={IconFlame}
              color="orange"
            />
            <StatCard
              label="Consistency"
              value={`${profile.metrics?.consistencyScore ?? 0}%`}
              icon={IconStar}
              color="teal"
            />
          </SimpleGrid>
        )}

        <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconTrophy size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="achievements" leftSection={<IconAward size={16} />}>
              Achievements
            </Tabs.Tab>
            <Tabs.Tab value="badges" leftSection={<IconTarget size={16} />}>
              Badges
            </Tabs.Tab>
            <Tabs.Tab value="challenges" leftSection={<IconRepeat size={16} />}>
              Challenges
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
              History
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {profile && (
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                <Paper withBorder p="md" radius="md">
                  <Group justify="apart" mb="md">
                    <Text fw={600} size="sm">
                      Recent Achievements
                    </Text>
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      onClick={() => setActiveTab("achievements")}
                    >
                      View All
                    </Button>
                  </Group>
                  <Stack gap="sm">
                    {profile.achievements.unlocked.length > 0 ? (
                      profile.achievements.all
                        .filter((a) =>
                          profile.achievements.unlocked.some((u: any) => u.achievementId === a.id),
                        )
                        .slice(-4)
                        .reverse()
                        .map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            name={achievement.name}
                            description={achievement.description}
                            icon={achievement.icon}
                            xpReward={achievement.xpReward}
                            unlocked
                          />
                        ))
                    ) : (
                      <Text size="sm" c="dimmed" ta="center" py="lg">
                        No achievements yet. Sync your progress to check for unlockable achievements.
                      </Text>
                    )}
                  </Stack>
                </Paper>

                <Paper withBorder p="md" radius="md">
                  <Group justify="apart" mb="md">
                    <Text fw={600} size="sm">
                      Active Challenges
                    </Text>
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      onClick={() => setActiveTab("challenges")}
                    >
                      View All
                    </Button>
                  </Group>
                  <Stack gap="sm">
                    {profile.challenges.length > 0 ? (
                      profile.challenges.slice(0, 4).map((challenge) => (
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
                      ))
                    ) : (
                      <Text size="sm" c="dimmed" ta="center" py="lg">
                        No active challenges right now.
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="achievements" pt="md">
            <Paper withBorder p="md" radius="md">
              <Text fw={600} size="sm" mb="md">
                All Achievements
                {profile && (
                  <Badge ml="sm" variant="light" color="yellow">
                    {profile.achievements.unlocked.length}/{profile.achievements.all.length} unlocked
                  </Badge>
                )}
              </Text>
              {profile ? (
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  {profile.achievements.all.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      name={achievement.name}
                      description={achievement.description}
                      icon={achievement.icon}
                      xpReward={achievement.xpReward}
                      unlocked={
                                !!profile.achievements.unlocked.find(
                                  (u: any) => u.achievementId === achievement.id,
                                )
                              }
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No achievements available.
                </Text>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="badges" pt="md">
            <Paper withBorder p="md" radius="md">
              <Text fw={600} size="sm" mb="md">
                All Badges
                {profile && (
                  <Badge ml="sm" variant="light" color="blue">
                    {profile.badges.unlocked.length}/{profile.badges.all.length} unlocked
                  </Badge>
                )}
              </Text>
              {profile ? (
                <Stack gap="xs">
                  {(["streaks", "habits", "tasks", "routines", "general"] as const).map(
                    (category) => {
                      const badges = profile.badges.all.filter((b) => b.category === category);
                      if (badges.length === 0) return null;
                      return (
                        <div key={category}>
                          <Text size="xs" c="dimmed" tt="capitalize" mb="xs">
                            {category}
                          </Text>
                          <SimpleGrid cols={{ base: 1, sm: 2 }}>
                            {badges.map((badge) => (
                              <BadgeCard
                                key={badge.id}
                                name={badge.name}
                                description={badge.description}
                                icon={badge.icon}
                                category={badge.category}
                                xpReward={badge.xpReward}
                                unlocked={
                                  !!profile.badges.unlocked.find(
                                    (u: any) => u.badgeId === badge.id,
                                  )
                                }
                              />
                            ))}
                          </SimpleGrid>
                        </div>
                      );
                    },
                  )}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No badges available.
                </Text>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="challenges" pt="md">
            <Stack gap="md">
              {profile ? (
                profile.challenges.length > 0 ? (
                  profile.challenges.map((challenge) => (
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
                  ))
                ) : (
                  <Paper withBorder p="xl" radius="md" ta="center">
                    <Text c="dimmed">No active challenges right now.</Text>
                  </Paper>
                )
              ) : (
                <Paper withBorder p="xl" radius="md" ta="center">
                  <Text c="dimmed">Loading challenges...</Text>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <XPHistorySection />
          </Tabs.Panel>
        </Tabs>
      </motion.div>
    </Stack>
  );
}
