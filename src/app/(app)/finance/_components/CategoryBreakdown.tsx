"use client";

import { Group, Stack, Text, Progress, ThemeIcon } from "@mantine/core";
import { motion } from "framer-motion";
import {
  IconDots,
  IconToolsKitchen2,
  IconCar,
  IconShoppingBag,
  IconDeviceGamepad2,
  IconHeart,
  IconBook,
  IconReceipt,
  IconPlane,
  IconHome,
  IconTrendingUp,
  IconGift,
  type TablerIcon,
} from "@tabler/icons-react";
import type { CategoryItem, CategoryBreakdownProps } from "@/modules/expenses";
import { PremiumCard } from "@/components/ui/card";

const ICON_MAP: Record<string, TablerIcon> = {
  IconToolsKitchen2,
  IconCar,
  IconShoppingBag,
  IconDeviceGamepad2,
  IconHeart,
  IconBook,
  IconReceipt,
  IconPlane,
  IconHome,
  IconTrendingUp,
  IconGift,
  IconDots,
};

function getIcon(iconName: string | null): TablerIcon {
  if (!iconName) return IconDots;
  return ICON_MAP[iconName] ?? IconDots;
}

const COLOR_MAP: Record<string, string> = {
  food: "orange",
  transport: "blue",
  shopping: "violet",
  entertainment: "grape",
  health: "red",
  education: "cyan",
  bills: "yellow",
  travel: "teal",
  housing: "pink",
  income: "green",
  gifts: "indigo",
};

function getColor(name: string): string {
  return COLOR_MAP[name.toLowerCase()] ?? "gray";
}

export function CategoryBreakdown({ data, totalSpending }: CategoryBreakdownProps) {
  const total = data.reduce((acc, c) => acc + c.total, 0);

  return (
    <PremiumCard className="h-full">
      <Stack gap="md" h="100%">
        <Text fw={600} size="lg">
          Category Breakdown
        </Text>

        <Stack gap="sm" style={{ flex: 1 }}>
          {data.map((category, index) => {
            const pct = total > 0 ? (category.total / total) * 100 : 0;
            const Icon = getIcon(category.categoryIcon);
            const color = getColor(category.categoryName ?? "other");

            return (
              <motion.div
                key={category.categoryId ?? index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={32} radius="lg" variant="light" color={color as any}>
                    <Icon size={14} />
                  </ThemeIcon>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" mb={2}>
                      <Text size="sm" fw={500} truncate>
                        {category.categoryName ?? "Uncategorized"}
                      </Text>
                      <Text size="sm" fw={600}>
                        ₹{Number(category.total).toLocaleString()}
                      </Text>
                    </Group>
                    <Progress
                      value={pct}
                      color={color as any}
                      size="sm"
                      radius="lg"
                      animated
                    />
                  </div>
                </Group>
              </motion.div>
            );
          })}
        </Stack>
      </Stack>
    </PremiumCard>
  );
}
