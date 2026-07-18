import { Suspense } from "react";
import { WorkoutDetail } from "./WorkoutDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <WorkoutDetail sessionId={id} />
    </Suspense>
  );
}
