import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function RoutinesAnalyticsLoading() {
  return <DashboardSkeleton statCards={3} chartCount={2} />;
}
