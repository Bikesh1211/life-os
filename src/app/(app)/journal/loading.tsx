import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function JournalLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
