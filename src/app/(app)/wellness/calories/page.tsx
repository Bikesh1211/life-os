import { getCurrentUserId } from "@/core/auth";
import { getCalorieEntries } from "@/modules/wellness";
import { CaloriesContent } from "./CaloriesContent";

export default async function CaloriesPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getCalorieEntries(userId, { period: "month" });
  return <CaloriesContent entries={entries} />;
}
