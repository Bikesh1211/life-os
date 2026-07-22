import { Suspense } from "react";
import { PracticeView } from "@/modules/scripts/components/PracticeView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <PracticeView scriptId={id} />
    </Suspense>
  );
}
