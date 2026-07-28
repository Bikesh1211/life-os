import { requireAuth } from "@/core/auth";
import { getTaskStats } from "@/modules/tasks";
import { getSummary as getHabitSummary } from "@/modules/habits";
import { getOverview as getGoalOverview } from "@/modules/goals";
import { getLifeStats, getUpcomingEvents } from "@/modules/timeline";
import { getNoteStats } from "@/modules/notes";
import { getDashboardSummary } from "@/modules/expenses";
import { DashboardContent } from "./dashboard/DashboardContent";

export default async function HomePage() {
  const userId = await requireAuth();

  const [
    taskSummary,
    habitSummary,
    goalOverview,
    lifeStats,
    upcomingEvents,
    noteStats,
    financeSummary,
  ] = await Promise.all([
    getTaskStats(userId),
    getHabitSummary(userId),
    getGoalOverview(userId),
    getLifeStats(userId),
    getUpcomingEvents(userId, 5),
    getNoteStats(userId),
    getDashboardSummary(userId),
  ]);

  return (
    <DashboardContent
      userId={userId}
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
