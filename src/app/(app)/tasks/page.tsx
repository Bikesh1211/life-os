import { auth } from "@clerk/nextjs/server";
import { getTasksForUser } from "@/modules/tasks";
import { TasksContent } from "./TasksContent";

export default async function TasksPage() {
  const { userId } = await auth();
  const tasks = await getTasksForUser(userId!);

  return <TasksContent tasks={tasks} />;
}
