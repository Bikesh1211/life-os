"use client";

import { Paper, Text, SimpleGrid, RingProgress, Group, Stack } from "@mantine/core";
import {
  IconBriefcase, IconHeart, IconCoin, IconBook, IconFlame,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

const areas = [
  {
    label: "Career",
    icon: IconBriefcase,
    color: "blue",
    value: 35,
    detail: "2 active projects",
  },
  {
    label: "Health",
    icon: IconHeart,
    color: "red",
    value: 72,
    detail: "85% exercise · 6h sleep",
  },
  {
    label: "Finance",
    icon: IconCoin,
    color: "green",
    value: 55,
    detail: "60% budget · $2.4k saved",
  },
  {
    label: "Learning",
    icon: IconBook,
    color: "violet",
    value: 40,
    detail: "3 courses · 12 books",
  },
  {
    label: "Habits",
    icon: IconFlame,
    color: "orange",
    value: 88,
    detail: "14d streak · 85% completion",
  },
];

export function LifeProgress() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <Text size="sm" fw={600} mb="sm" tt="uppercase"  c="dimmed">
        Life Progress
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="sm">
        {areas.map((area, i) => (
          <motion.div
            key={area.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.05, duration: 0.3 }}
          >
            <Paper withBorder p="md" radius="xl" className="h-full">
              <Stack align="center" gap="xs">
                <RingProgress
                  size={70}
                  thickness={5}
                  sections={[{ value: area.value, color: area.color }]}
                  label={
                    <Text ta="center" size="xs" fw={700}>
                      {area.value}%
                    </Text>
                  }
                />
                <Group gap={4}>
                  <area.icon size={14} style={{ color: `var(--mantine-color-${area.color}-filled)` }} />
                  <Text size="sm" fw={600}>{area.label}</Text>
                </Group>
                <Text size="xs" c="dimmed" ta="center">
                  {area.detail}
                </Text>
              </Stack>
            </Paper>
          </motion.div>
        ))}
      </SimpleGrid>
    </motion.div>
  );
}