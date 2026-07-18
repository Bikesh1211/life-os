import { Suspense } from "react";
import { WorkoutSessionContent } from "./WorkoutSessionContent";

type Props = {
  searchParams: Promise<{ programDayId?: string }>;
};

export default async function WorkoutPage({ searchParams }: Props) {
  const { programDayId } = await searchParams;
  return (
    <Suspense fallback={null}>
      <WorkoutSessionContent programDayId={programDayId} />
    </Suspense>
  );
}
