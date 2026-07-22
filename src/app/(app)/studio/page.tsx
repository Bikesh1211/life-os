import { Suspense } from "react";
import { StudioContent } from "./StudioContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function StudioPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <StudioContent defaultTab={tab ?? "overview"} />
    </Suspense>
  );
}
