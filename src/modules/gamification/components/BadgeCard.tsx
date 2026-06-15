"use client";

import { Paper, Group, Text, ThemeIcon, Badge } from "@mantine/core";
import {
  IconStar,
  IconFlame,
  IconTarget,
  IconSunrise,
  IconMoon,
  IconRepeat,
  IconCrown,
  IconWind,
} from "@tabler/icons-react";

const iconMap: Record<string, React.ElementType> = {
  star: IconStar,
  flame: IconFlame,
  target: IconTarget,
  sunrise: IconSunrise,
  moon: IconMoon,
  repeat: IconRepeat,
  crown: IconCrown,
  wind: IconWind,
};

const categoryColors: Record<string, string> = {
  habits: "green",
  tasks: "blue",
  routines: "violet",
  streaks: "orange",
  general: "gray",
};

type BadgeCardProps = {
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
};

export function BadgeCard({
  name,
  description,
  icon,
  category,
  xpReward,
  unlocked,
}: BadgeCardProps) {
  const Icon = iconMap[icon] ?? IconStar;
  const color = categoryColors[category] ?? "gray";

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      opacity={unlocked ? 1 : 0.4}
      className={unlocked ? "" : "grayscale"}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          variant={unlocked ? "filled" : "light"}
          color={unlocked ? color : "gray"}
          size="lg"
          radius="md"
        >
          <Icon size={18} />
        </ThemeIcon>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} lineClamp={1}>
            {name}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {description}
          </Text>
        </div>

        {unlocked && (
          <Badge size="sm" variant="light" color={color}>
            +{xpReward} XP
          </Badge>
        )}
      </Group>
    </Paper>
  );
}
