import { Suspense } from "react";
import { WritingView } from "@/modules/scripts/components/WritingView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ScriptWritePage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <WritingView scriptId={id} />
    </Suspense>
  );
}
