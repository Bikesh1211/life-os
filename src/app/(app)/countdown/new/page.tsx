import { Suspense } from "react";
import { CountdownForm } from "../components/CountdownForm";

export default async function NewCountdownPage() {
  return (
    <Suspense fallback={null}>
      <CountdownForm />
    </Suspense>
  );
}
