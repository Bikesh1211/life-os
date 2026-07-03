"use client";

import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { PremiumCard } from "./card";
import { cn } from "@/core/utils";

type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: TablerIcon;
  color?: string;
  trend?: { value: string; direction: TrendDirection };
  variant?: "default" | "gradient";
  delay?: number;
}

const trendColors: Record<TrendDirection, string> = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-500 dark:text-red-400",
  neutral: "text-gray-500 dark:text-gray-400",
};

const trendIcons: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  variant = "default",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05, ease: [0.4, 0, 0.2, 1] }}
      style={{ height: "100%" }}
    >
      <PremiumCard
        variant={variant === "gradient" ? "gradient" : "default"}
        gradient={variant === "gradient" ? { from: color, to: "transparent" } : undefined}
        className="h-full"
        style={{
          ...(variant === "gradient"
            ? {
                background: `linear-gradient(135deg, color-mix(in srgb, ${color} 8%, transparent) 0%, transparent 100%)`,
                borderColor: `color-mix(in srgb, ${color} 20%, var(--border-subtle))`,
              }
            : {}),
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} component="span">
              {label}
            </Text>
            <Text fw={700} lh={1.1} className="text-[28px] tracking-tight">
              {value}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed" component="span">
                {subtitle}
              </Text>
            )}
            {trend && (
              <Text
                size="sm"
                fw={500}
                className={cn("flex items-center gap-0.5", trendColors[trend.direction])}
              >
                <span>{trendIcons[trend.direction]}</span>
                {trend.value}
              </Text>
            )}
          </Stack>
          <ThemeIcon
            size={44}
            radius="xl"
            variant="light"
            color={color}
            style={{ flexShrink: 0 }}
          >
            <Icon size={22} />
          </ThemeIcon>
        </Group>
      </PremiumCard>
    </motion.div>
  );
}
