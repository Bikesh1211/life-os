import { Suspense } from "react";
import { MoviesContent } from "./MoviesContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function MoviesPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <MoviesContent defaultTab={tab ?? "dashboard"} />
    </Suspense>
  );
}
