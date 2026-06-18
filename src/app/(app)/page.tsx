import { getCurrentUserId } from "@/core/auth";
import { getTaskStats } from "@/modules/tasks";
import { getKnowledgeEntries } from "@/modules/knowledge";
import { getSummary as getHabitSummary } from "@/modules/habits";
import { DashboardContent } from "./dashboard/DashboardContent";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const userIdStr = userId!;
  const [taskSummary, knowledgeEntries, habitSummary] = await Promise.all([
    getTaskStats(userIdStr),
    getKnowledgeEntries(userIdStr),
    getHabitSummary(userIdStr),
  ]);

  return (
    <DashboardContent
      userId={userIdStr}
      taskSummary={taskSummary}
      knowledgeEntries={knowledgeEntries}
      habitSummary={habitSummary}
    />
  );
}
