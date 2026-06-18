import { getCurrentUserId } from "@/core/auth";
import { getWeightEntries } from "@/modules/wellness";
import { WeightContent } from "./WeightContent";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getWeightEntries(userId, { period: "month" });
  return <WeightContent entries={entries} />;
}
