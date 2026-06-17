import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function HabitsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
