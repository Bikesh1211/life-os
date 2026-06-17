import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function MusicGoalsLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
