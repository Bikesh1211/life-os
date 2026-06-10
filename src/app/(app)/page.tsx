import { auth } from "@clerk/nextjs/server";
import { getTaskSummary } from "@/modules/tasks";
import { getKnowledgeEntries } from "@/modules/knowledge";
import { DashboardContent } from "./dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  const userIdStr = userId!;
  const [taskSummary, knowledgeEntries] = await Promise.all([
    getTaskSummary(userIdStr),
    getKnowledgeEntries(userIdStr),
  ]);

  return (
    <DashboardContent
      userId={userIdStr}
      taskSummary={taskSummary}
      knowledgeEntries={knowledgeEntries}
    />
  );
}
