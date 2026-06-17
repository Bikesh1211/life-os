import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function DashboardLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
