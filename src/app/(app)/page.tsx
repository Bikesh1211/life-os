import { getCurrentUserId } from "@/core/auth";
import { getTaskStats } from "@/modules/tasks";
import { getSummary as getHabitSummary } from "@/modules/habits";
import { getOverview as getGoalOverview } from "@/modules/goals";
import { getLifeStats, getUpcomingEvents } from "@/modules/timeline";
import { getNoteStats } from "@/modules/notes";
import { getDashboardSummary } from "@/modules/expenses";
import { DashboardContent } from "./dashboard/DashboardContent";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const userIdStr = userId!;

  const [
    taskSummary,
    habitSummary,
    goalOverview,
    lifeStats,
    upcomingEvents,
    noteStats,
    financeSummary,
  ] = await Promise.all([
    getTaskStats(userIdStr),
    getHabitSummary(userIdStr),
    getGoalOverview(userIdStr),
    getLifeStats(userIdStr),
    getUpcomingEvents(userIdStr, 5),
    getNoteStats(userIdStr),
    getDashboardSummary(userIdStr),
  ]);

  return (
    <DashboardContent
      userId={userIdStr}
      taskSummary={taskSummary}
      habitSummary={habitSummary}
      goalOverview={goalOverview}
      lifeStats={lifeStats}
      upcomingEvents={upcomingEvents}
      noteStats={noteStats}
      financeSummary={financeSummary}
    />
  );
}
