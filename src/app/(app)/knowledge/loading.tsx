import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function KnowledgeLoading() {
  return <DashboardSkeleton statCards={4} chartCount={1} />;
}
