"use client";

import { Paper, Group, Text, ThemeIcon, Badge } from "@mantine/core";
import {
  IconStar,
  IconCheck,
  IconRepeat,
  IconTrendingUp,
  IconTarget,
  IconClipboardCheck,
  IconFlame,
  IconAward,
} from "@tabler/icons-react";

const iconMap: Record<string, React.ElementType> = {
  star: IconStar,
  check: IconCheck,
  repeat: IconRepeat,
  "trending-up": IconTrendingUp,
  target: IconTarget,
  "clipboard-check": IconClipboardCheck,
  flame: IconFlame,
  award: IconAward,
};

type AchievementCardProps = {
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
};

export function AchievementCard({
  name,
  description,
  icon,
  xpReward,
  unlocked,
}: AchievementCardProps) {
  const Icon = iconMap[icon] ?? IconStar;

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      opacity={unlocked ? 1 : 0.4}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          variant={unlocked ? "filled" : "light"}
          color={unlocked ? "yellow" : "gray"}
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

        <Badge size="sm" variant={unlocked ? "filled" : "outline"} color="yellow">
          +{xpReward} XP
        </Badge>
      </Group>
    </Paper>
  );
}
