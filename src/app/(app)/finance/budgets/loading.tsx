import { CardGridSkeleton } from "@/components/shared/SkeletonTemplates";

export default function FinanceBudgetsLoading() {
  return <CardGridSkeleton count={4} height={200} />;
}
