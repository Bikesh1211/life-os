import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function GoalsAnalyticsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
