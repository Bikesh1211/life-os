import { Suspense } from "react";
import { FitnessDashboard } from "./FitnessDashboard";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function FitnessPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <FitnessDashboard defaultTab={tab ?? "overview"} />
    </Suspense>
  );
}
