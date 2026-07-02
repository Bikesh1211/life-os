import { Suspense } from "react";
import { RoutinesContent } from "./RoutinesContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function RoutinesPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <RoutinesContent defaultTab={tab ?? "dashboard"} />
    </Suspense>
  );
}
