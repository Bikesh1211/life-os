import { Suspense } from "react";
import { NetworkContent } from "./NetworkContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function NetworkPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <NetworkContent defaultTab={tab ?? "overview"} />
    </Suspense>
  );
}
