import { Suspense } from "react";
import { SettingsView } from "@/modules/scripts/components/SettingsView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <SettingsView scriptId={id} />
    </Suspense>
  );
}
