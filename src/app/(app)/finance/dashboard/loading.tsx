import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function FinanceDashboardLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
