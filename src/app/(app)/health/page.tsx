import { getCurrentUserId } from "@/core/auth";
import { getHealthDashboard, getVitalsSnapshot, getVitalsTrends, getFitnessSummary, getNutritionSummary } from "@/modules/health";
import { HealthTabs } from "./HealthTabs";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [dashboard, vitalsSnapshot, vitalsTrends, fitness, nutrition] = await Promise.all([
    getHealthDashboard(userId),
    getVitalsSnapshot(userId),
    getVitalsTrends(userId),
    getFitnessSummary(userId),
    getNutritionSummary(userId),
  ]);

  return (
    <HealthTabs
      dashboard={dashboard}
      vitalsSnapshot={vitalsSnapshot}
      vitalsTrends={vitalsTrends}
      fitness={fitness}
      nutrition={nutrition}
    />
  );
}
