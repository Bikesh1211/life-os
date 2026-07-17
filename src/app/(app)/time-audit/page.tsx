import { Suspense } from "react";
import { getCurrentUserId } from "@/core/auth";
import {
  ensureDefaultCategories,
  getDashboardMetrics,
  getTimeDistribution,
  getWeeklyTrend,
  getComparison,
  getWeeklySummary,
  getProductivityStats,
  getBudgetProgress,
  getAvailableProjects,
} from "@/modules/time-audit";
import { TimeAuditDashboard } from "./TimeAuditDashboard";
import { TabbedPageSkeleton } from "@/components/shared/SkeletonTemplates";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function TimeAuditPage({ searchParams }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { tab } = await searchParams;

  const [categories, today, week, month, distribution, trend, comparison, summary, stats, budgets, projects] =
    await Promise.all([
      ensureDefaultCategories(userId),
      getDashboardMetrics(userId, "today"),
      getDashboardMetrics(userId, "week"),
      getDashboardMetrics(userId, "month"),
      getTimeDistribution(userId, "week"),
      getWeeklyTrend(userId),
      getComparison(userId),
      getWeeklySummary(userId),
      getProductivityStats(userId),
      getBudgetProgress(userId),
      getAvailableProjects(userId),
    ]);

  return (
    <Suspense fallback={<TabbedPageSkeleton />}>
      <TimeAuditDashboard
        defaultTab={tab ?? "overview"}
        categories={categories}
        today={today}
        week={week}
        month={month}
        distribution={distribution}
        trend={trend}
        comparison={comparison}
        summary={summary}
        stats={stats}
        budgets={budgets}
        projects={projects}
      />
    </Suspense>
  );
}
