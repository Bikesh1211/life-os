"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconRepeat } from "@tabler/icons-react";
import { useHabitAnalytics, useHabitHeatmap } from "@/hooks/use-habit-analytics";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsOverviewCards } from "./AnalyticsOverviewCards";
import { HabitTrendChart } from "./HabitTrendChart";
import { HabitHeatmap } from "./HabitHeatmap";
import { HabitRankingTable } from "./HabitRankingTable";
import { HabitStreakCard } from "./HabitStreakCard";
import { HabitInsightsCard } from "./HabitInsightsCard";

export function AnalyticsPage() {
  const [filters, setFilters] = useState<{ period?: string; category?: string }>({
    period: "month",
  });

  const { data: dashboard, isLoading: dashboardLoading } = useHabitAnalytics(filters);
  const { data: heatmap } = useHabitHeatmap(filters);

  if (dashboardLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]"
            />
          ))}
        </div>
        <div className="mt-6 h-72 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconRepeat size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Analytics Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Create and track habits to see your analytics, streaks, and insights here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Habit Analytics
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Track your habits, streaks, and progress
        </p>
      </motion.div>

      <AnalyticsFilters onApply={setFilters} />

      <div className="space-y-6">
        <AnalyticsOverviewCards data={dashboard} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HabitTrendChart
              dailyTrend={dashboard.dailyTrend}
              categoryDistribution={dashboard.categoryDistribution}
            />
          </div>
          <div>
            <HabitStreakCard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HabitRankingTable filters={filters} />
          </div>
          <div>
            <HabitInsightsCard filters={filters} />
          </div>
        </div>

        {heatmap && heatmap.length > 0 && <HabitHeatmap data={heatmap} />}
      </div>
    </div>
  );
}
