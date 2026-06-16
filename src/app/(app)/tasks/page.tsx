import { auth } from "@clerk/nextjs/server";
import { getTaskStats } from "@/modules/tasks";
import { TasksContent } from "./TasksContent";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { userId } = await auth();
  const taskSummary = await getTaskStats(userId!);

  return <TasksContent taskSummary={taskSummary} />;
}
