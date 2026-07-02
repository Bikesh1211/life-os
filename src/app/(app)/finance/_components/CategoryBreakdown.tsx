"use client";

import { Card, Group, Stack, Text, Progress, ThemeIcon } from "@mantine/core";
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

export function CategoryBreakdown({ data, totalSpending }: CategoryBreakdownProps) {
  return (
    <Card padding="lg" radius="lg" h="100%">
      <Stack gap="md">
        <Text fw={600} size="lg">
          Spending by Category
        </Text>
        <Stack gap="sm">
          {data.map((item, index) => {
            const percentage = totalSpending > 0 ? (item.total / totalSpending) * 100 : 0;
            const Icon = getIcon(item.categoryIcon);

            return (
              <motion.div
                key={item.categoryId ?? `uncategorized-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Group gap="sm" align="center">
                  <ThemeIcon
                    size={36}
                    radius="md"
                    variant="light"
                    color={item.categoryColor ?? "gray"}
                  >
                    <Icon size={18} />
                  </ThemeIcon>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>
                        {item.categoryName ?? "Uncategorized"}
                      </Text>
                      <Text size="sm" fw={600}>
                        ₹{item.total.toLocaleString()}
                      </Text>
                    </Group>
                    <Progress
                      value={percentage}
                      color={item.categoryColor ?? "gray"}
                      size="sm"
                      radius="xl"
                    />
                    <Text size="xs" c="dimmed">
                      {percentage.toFixed(1)}% · {item.count} transactions
                    </Text>
                  </Stack>
                </Group>
              </motion.div>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
