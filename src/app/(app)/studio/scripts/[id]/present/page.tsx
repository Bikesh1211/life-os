import { Suspense } from "react";
import { PresentationView } from "@/modules/scripts/components/PresentationView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PresentPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <PresentationView scriptId={id} />
    </Suspense>
  );
}
