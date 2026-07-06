import { Suspense } from "react";
import { CountdownForm } from "../../components/CountdownForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCountdownPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <CountdownForm eventId={id} />
    </Suspense>
  );
}
