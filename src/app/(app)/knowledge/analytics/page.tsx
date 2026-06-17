import { getCurrentUserId } from "@/core/auth";
import { getKnowledgeEntries, getDashboardStats } from "@/modules/knowledge";
import { KnowledgeAnalytics } from "../components/KnowledgeAnalytics";


export default async function KnowledgeAnalyticsPage() {
  const userId = await getCurrentUserId();
  const [entries, stats] = await Promise.all([
    getKnowledgeEntries(userId!),
    getDashboardStats(userId!),
  ]);
  return <KnowledgeAnalytics entries={entries} stats={stats} />;
}
