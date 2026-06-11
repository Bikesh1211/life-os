"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { motion } from "framer-motion";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  icon: TablerIcon;
  color: string;
  trend?: { value: string; positive: boolean };
};

export function MetricCard({ label, value, subtitle, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        padding="lg"
        radius="lg"
        h="100%"
        className="backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          borderColor: `${color}30`,
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {label}
            </Text>
            <Text size="28px" fw={700} lh={1.2}>
              {value}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            )}
            {trend && (
              <Text
                size="sm"
                c={trend.positive ? "teal" : "red"}
                fw={500}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </Text>
            )}
          </Stack>
          <ThemeIcon
            size={48}
            radius="xl"
            variant="light"
            color={color}
            style={{ flexShrink: 0 }}
          >
            <Icon size={24} />
          </ThemeIcon>
        </Group>
      </Card>
    </motion.div>
  );
}
