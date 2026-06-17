import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function FinanceAnalyticsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
