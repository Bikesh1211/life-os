import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function TimelineAnalyticsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
