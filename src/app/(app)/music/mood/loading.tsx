import { DashboardSkeleton } from "@/components/shared/SkeletonTemplates";

export default function MusicMoodLoading() {
  return <DashboardSkeleton statCards={3} chartCount={1} />;
}
