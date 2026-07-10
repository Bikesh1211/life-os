import { getCurrentUserId } from "@/core/auth";
import { SleepContent } from "./SleepContent";

export default async function SleepPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return <SleepContent />;
}
