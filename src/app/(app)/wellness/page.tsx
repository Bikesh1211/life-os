import { getCurrentUserId } from "@/core/auth";
import {
  computeWellnessScores,
  getWellnessInsights,
  getMoodLogs,
  getSleepRecords,
  getConfidenceCheckins,
  getOverdueEnrichments,
  getWeightEntries,
  getWorkoutEntries,
  getStepEntries,
  getCalorieEntries,
  getBloodPressureEntries,
  getHeartRateEntries,
  getMedicineReminders,
  getUserGoals,
  getAchievements,
} from "@/modules/wellness";
import { WellnessDashboard } from "./WellnessDashboard";

export const dynamic = "force-dynamic";

export default async function WellnessPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [
    scores,
    insights,
    recentMoods,
    recentSleep,
    recentConfidence,
    overdueEnrichments,
    recentWeight,
    recentWorkouts,
    recentSteps,
    recentCalories,
    recentBp,
    recentHr,
    medicineReminders,
    userGoals,
    achievements,
  ] = await Promise.all([
    computeWellnessScores(userId),
    getWellnessInsights(userId),
    getMoodLogs(userId, { period: "week" }),
    getSleepRecords(userId, { period: "week" }),
    getConfidenceCheckins(userId, { period: "week" }),
    getOverdueEnrichments(userId),
    getWeightEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getWorkoutEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getStepEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getCalorieEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getBloodPressureEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getHeartRateEntries(userId, { dateFrom: weekAgo, dateTo: today }),
    getMedicineReminders(userId),
    getUserGoals(userId),
    getAchievements(userId),
  ]);

  return (
    <WellnessDashboard
      scores={scores}
      insights={insights}
      recentMoods={recentMoods}
      recentSleep={recentSleep}
      recentConfidence={recentConfidence}
      overdueEnrichments={overdueEnrichments}
      recentWeight={recentWeight}
      recentWorkouts={recentWorkouts}
      recentSteps={recentSteps}
      recentCalories={recentCalories}
      recentBp={recentBp}
      recentHr={recentHr}
      medicineReminders={medicineReminders}
      userGoals={userGoals}
      achievements={achievements}
    />
  );
}
