"use client";

import { motion } from "framer-motion";
import {
  IconRepeat,
  IconCheck,
  IconPercentage,
  IconFlame,
  IconTrophy,
  IconX,
  IconTarget,
  IconActivity,
} from "@tabler/icons-react";
import type { DashboardData } from "@/hooks/use-habit-analytics";

type Props = {
  data: DashboardData;
};

const cards = [
  {
    key: "totalHabits",
    label: "Total Habits",
    icon: IconRepeat,
    color: "text-blue-400",
    getValue: (d: DashboardData) => d.totalHabits,
  },
  {
    key: "completedToday",
    label: "Completed Today",
    icon: IconCheck,
    color: "text-green-400",
    getValue: (d: DashboardData) => d.completedToday,
  },
  {
    key: "completionRate",
    label: "Completion Rate",
    icon: IconPercentage,
    color: "text-violet-400",
    getValue: (d: DashboardData) => `${d.completionRate}%`,
    trend: (d: DashboardData) => ({
      value: `${d.rateChange > 0 ? "+" : ""}${d.rateChange}%`,
      positive: d.rateChange >= 0,
    }),
  },
  {
    key: "currentStreak",
    label: "Current Streak",
    icon: IconFlame,
    color: "text-orange-400",
    getValue: (d: DashboardData) => `${d.currentStreak} days`,
  },
  {
    key: "longestStreak",
    label: "Longest Streak",
    icon: IconTrophy,
    color: "text-yellow-400",
    getValue: (d: DashboardData) => `${d.longestStreak} days`,
  },
  {
    key: "missedHabits",
    label: "Missed",
    icon: IconX,
    color: "text-red-400",
    getValue: (d: DashboardData) => d.missedHabits,
  },
  {
    key: "consistencyScore",
    label: "Consistency",
    icon: IconActivity,
    color: "text-cyan-400",
    getValue: (d: DashboardData) => `${d.consistencyScore}%`,
  },
  {
    key: "totalCompletions",
    label: "Total Completions",
    icon: IconTarget,
    color: "text-teal-400",
    getValue: (d: DashboardData) => d.totalCompletions,
  },
];

export function AnalyticsOverviewCards({ data }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => {
        const trend = card.trend?.(data);
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
            className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-body,#0a0a0f)] p-4 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-3xl">
                  {card.getValue(data)}
                </p>
                <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                  {card.label}
                </p>
              </div>
              <card.icon size={20} className={card.color} />
            </div>
            {trend && (
              <p
                className={`mt-2 text-xs ${
                  trend.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value} vs last period
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
