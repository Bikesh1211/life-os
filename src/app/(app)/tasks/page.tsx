import { requireAuth } from "@/core/auth";
import { getTaskStats, getTasks } from "@/modules/tasks";
import { TasksContent } from "./TasksContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function TasksPage({ searchParams }: Props) {
  const userId = await requireAuth();
  const [taskSummary, initialTasks] = await Promise.all([
    getTaskStats(userId),
    getTasks(userId, { status: "active", sortBy: "priority", parentId: null }),
  ]);
  const { tab } = await searchParams;
  return <TasksContent taskSummary={taskSummary} initialTasks={initialTasks} defaultTab={tab ?? "dashboard"} />;
}
