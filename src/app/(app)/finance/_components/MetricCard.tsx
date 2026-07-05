"use client";

import type { TablerIcon } from "@tabler/icons-react";
import { StatCard } from "@/components/ui/stat-card";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  icon: TablerIcon;
  color: string;
  trend?: { value: string; positive: boolean };
};

export function MetricCard({ label, value, subtitle, icon, color, trend }: MetricCardProps) {
  return (
    <StatCard
      label={label}
      value={value}
      subtitle={subtitle}
      icon={icon}
      color={color}
      variant="gradient"
      trend={
        trend
          ? {
              value: trend.value,
              direction: trend.positive ? "up" : "down",
            }
          : undefined
      }
    />
  );
}
