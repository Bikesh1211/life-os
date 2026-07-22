import { Suspense } from "react";
import { NewScriptForm } from "@/modules/scripts/components/NewScriptForm";

export default async function NewScriptPage() {
  return (
    <Suspense fallback={null}>
      <NewScriptForm />
    </Suspense>
  );
}
