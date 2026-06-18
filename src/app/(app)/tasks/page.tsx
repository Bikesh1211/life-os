import { getCurrentUserId } from "@/core/auth";
import { getTaskStats } from "@/modules/tasks";
import { TasksContent } from "./TasksContent";


export default async function TasksPage() {
  const userId = await getCurrentUserId();
  const taskSummary = await getTaskStats(userId!);

  return <TasksContent taskSummary={taskSummary} />;
}
