import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function HabitsInsightsLoading() {
  return <DashboardSkeleton statCards={3} chartCount={2} />;
}
