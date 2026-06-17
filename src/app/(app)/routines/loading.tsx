import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function RoutinesLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
