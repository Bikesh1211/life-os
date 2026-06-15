"use client";

import { Paper, Group, Text, Badge, SimpleGrid } from "@mantine/core";
import { BadgeCard } from "@/modules/gamification/components/BadgeCard";

type BadgeItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
};

type BadgeCollectionProps = {
  badges: BadgeItem[];
};

const categories = ["streaks", "habits", "tasks", "routines", "general"] as const;

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="apart" mb="md">
        <Text fw={600} size="sm">
          Badge Collection
        </Text>
        <Badge variant="light" color="blue" size="lg">
          {unlockedCount}/{totalCount} ({pct}%)
        </Badge>
      </Group>

      {categories.map((category) => {
        const filtered = badges.filter((b) => b.category === category);
        if (filtered.length === 0) return null;
        return (
          <div key={category} className="mb-3">
            <Text size="xs" c="dimmed" tt="capitalize" fw={600} mb="xs">
              {category}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              {filtered.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon}
                  category={badge.category}
                  xpReward={badge.xpReward}
                  unlocked={badge.unlocked}
                />
              ))}
            </SimpleGrid>
          </div>
        );
      })}
    </Paper>
  );
}
