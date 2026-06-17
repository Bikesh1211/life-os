import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function RoutineAnalyticsLoading() {
  return <DashboardSkeleton statCards={3} chartCount={2} />;
}
