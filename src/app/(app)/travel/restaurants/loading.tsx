import { CardGridSkeleton } from "@/components/shared/SkeletonTemplates";

export default function TravelRestaurantsLoading() {
  return <CardGridSkeleton count={6} height={160} />;
}
