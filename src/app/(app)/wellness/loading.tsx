import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function WellnessLoading() {
  return <DashboardSkeleton statCards={3} chartCount={2} />;
}
