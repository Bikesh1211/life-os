import { auth } from "@clerk/nextjs/server";
import { getKnowledgeEntries, getDashboardStats } from "@/modules/knowledge";
import { KnowledgeDashboard } from "./components/KnowledgeDashboard";


export default async function KnowledgePage() {
  const { userId } = await auth();
  const [entries, stats] = await Promise.all([
    getKnowledgeEntries(userId!),
    getDashboardStats(userId!),
  ]);
  return <KnowledgeDashboard entries={entries} stats={stats} />;
}
