import { getCurrentUserId } from "@/core/auth";
import { getTaskStats, getTasks } from "@/modules/tasks";
import { TasksContent } from "./TasksContent";


export default async function TasksPage() {
  const userId = await getCurrentUserId();
  const [taskSummary, initialTasks] = await Promise.all([
    getTaskStats(userId!),
    getTasks(userId!, { status: "active", sortBy: "priority", parentId: null }),
  ]);

  return <TasksContent taskSummary={taskSummary} initialTasks={initialTasks} />;
}
