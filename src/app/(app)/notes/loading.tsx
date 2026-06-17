import { CardGridSkeleton } from "@/components/shared/SkeletonTemplates";

export default function NotesLoading() {
  return <CardGridSkeleton count={8} height={160} />;
}
