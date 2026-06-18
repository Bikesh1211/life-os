import { getCurrentUserId } from "@/core/auth";
import { getFitnessSummary } from "@/modules/health";
import { FitnessContent } from "./FitnessContent";

export default async function FitnessPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const summary = await getFitnessSummary(userId);
  return <FitnessContent summary={summary} />;
}
