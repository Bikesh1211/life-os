import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function MusicAnalyticsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
