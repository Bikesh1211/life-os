import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function WardrobeAnalyticsLoading() {
  return <DashboardSkeleton statCards={3} chartCount={2} />;
}
