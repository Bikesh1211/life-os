import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function MusicRecapLoading() {
  return <DashboardSkeleton statCards={4} chartCount={2} />;
}
