import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function LibraryLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
