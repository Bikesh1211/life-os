import { Suspense } from "react";
import { MusicContent } from "./MusicContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function MusicPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <MusicContent defaultTab={tab ?? "overview"} />
    </Suspense>
  );
}
