import { getCurrentUserId } from "@/core/auth";
import { getWorkoutEntries } from "@/modules/wellness";
import { WorkoutsContent } from "./WorkoutsContent";

export default async function WorkoutsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getWorkoutEntries(userId, { period: "month" });
  return <WorkoutsContent entries={entries} />;
}
