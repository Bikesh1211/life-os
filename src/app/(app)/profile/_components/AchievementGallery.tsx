"use client";

import { Paper, Group, Text, Badge, SimpleGrid, Stack } from "@mantine/core";
import { AchievementCard } from "@/modules/gamification/components/AchievementCard";

type AchievementItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
};

type AchievementGalleryProps = {
  achievements: AchievementItem[];
};

export function AchievementGallery({ achievements }: AchievementGalleryProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="apart" mb="md">
        <Text fw={600} size="sm">
          Achievements
        </Text>
        <Badge variant="light" color="yellow" size="lg">
          {unlockedCount}/{totalCount} ({pct}%)
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {achievements.slice(0, 6).map((achievement) => (
          <AchievementCard
            key={achievement.id}
            name={achievement.name}
            description={achievement.description}
            icon={achievement.icon}
            xpReward={achievement.xpReward}
            unlocked={achievement.unlocked}
          />
        ))}
      </SimpleGrid>

      {totalCount > 6 && (
        <Text size="xs" c="dimmed" ta="center" mt="sm">
          +{totalCount - 6} more achievements
        </Text>
      )}
    </Paper>
  );
}
