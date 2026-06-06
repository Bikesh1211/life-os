import { auth } from "@clerk/nextjs/server";
import { getTaskSummary } from "@/modules/tasks";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();
  const userIdStr = userId!;
  const taskSummary = await getTaskSummary(userIdStr);

  return <DashboardContent userId={userIdStr} taskSummary={taskSummary} />;
}
