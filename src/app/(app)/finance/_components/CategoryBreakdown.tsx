"use client";

import { Card, Group, Stack, Text, Progress, ThemeIcon } from "@mantine/core";
import { motion } from "framer-motion";
import { IconDots, type TablerIcon } from "@tabler/icons-react";

type CategoryItem = {
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  total: number;
  count: number;
};

type CategoryBreakdownProps = {
  data: CategoryItem[];
  totalSpending: number;
};

function getIcon(iconName: string | null): TablerIcon {
  if (!iconName) return IconDots as unknown as TablerIcon;
  try {
    const iconModule = require("@tabler/icons-react");
    return (iconModule[iconName] ?? IconDots) as unknown as TablerIcon;
  } catch {
    return IconDots as unknown as TablerIcon;
  }
}

export function CategoryBreakdown({ data, totalSpending }: CategoryBreakdownProps) {
  return (
    <Card padding="lg" radius="lg">
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
