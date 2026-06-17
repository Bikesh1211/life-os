import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function GamificationLoading() {
  return <DashboardSkeleton statCards={4} chartCount={1} />;
}
