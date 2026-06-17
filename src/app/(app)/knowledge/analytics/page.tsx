import { auth } from "@clerk/nextjs/server";
import { getKnowledgeEntries, getDashboardStats } from "@/modules/knowledge";
import { KnowledgeAnalytics } from "../components/KnowledgeAnalytics";


export default async function KnowledgeAnalyticsPage() {
  const { userId } = await auth();
  const [entries, stats] = await Promise.all([
    getKnowledgeEntries(userId!),
    getDashboardStats(userId!),
  ]);
  return <KnowledgeAnalytics entries={entries} stats={stats} />;
}
