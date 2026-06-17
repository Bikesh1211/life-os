import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function KnowledgeAnalyticsLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
