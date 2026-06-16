import { auth } from "@clerk/nextjs/server";
import {
  computeWellnessScores,
  getWellnessInsights,
  getMoodLogs,
  getSleepRecords,
  getConfidenceCheckins,
  getOverdueEnrichments,
} from "@/modules/wellness";
import { WellnessDashboard } from "./WellnessDashboard";

export const dynamic = "force-dynamic";

export default async function WellnessPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [scores, insights, recentMoods, recentSleep, recentConfidence, overdueEnrichments] =
    await Promise.all([
      computeWellnessScores(userId),
      getWellnessInsights(userId),
      getMoodLogs(userId, { period: "week" }),
      getSleepRecords(userId, { period: "week" }),
      getConfidenceCheckins(userId, { period: "week" }),
      getOverdueEnrichments(userId),
    ]);

  return (
    <WellnessDashboard
      scores={scores}
      insights={insights}
      recentMoods={recentMoods}
      recentSleep={recentSleep}
      recentConfidence={recentConfidence}
      overdueEnrichments={overdueEnrichments}
    />
  );
}
