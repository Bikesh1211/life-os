import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function TravelLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
