import { getCurrentUserId } from "@/core/auth";
import { getUserGoals, getAchievements } from "@/modules/wellness";
import { GoalsContent } from "./GoalsContent";

export default async function GoalsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [goals, achievements] = await Promise.all([
    getUserGoals(userId),
    getAchievements(userId),
  ]);

  return <GoalsContent goals={goals} achievements={achievements} />;
}
