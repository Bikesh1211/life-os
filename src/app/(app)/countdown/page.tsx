import { Suspense } from "react";
import { CountdownContent } from "./CountdownContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function CountdownPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <CountdownContent defaultTab={tab ?? "dashboard"} />
    </Suspense>
  );
}
