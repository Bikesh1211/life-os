import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function TimelineLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
