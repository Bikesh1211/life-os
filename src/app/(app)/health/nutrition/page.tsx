import { getCurrentUserId } from "@/core/auth";
import { getNutritionSummary } from "@/modules/health";
import { NutritionContent } from "./NutritionContent";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const summary = await getNutritionSummary(userId);
  return <NutritionContent summary={summary} />;
}
