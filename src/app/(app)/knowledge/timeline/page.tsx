import { getCurrentUserId } from "@/core/auth";
import { getKnowledgeEntries } from "@/modules/knowledge";
import { KnowledgeTimeline } from "../components/KnowledgeTimeline";


export default async function KnowledgeTimelinePage() {
  const userId = await getCurrentUserId();
  const entries = await getKnowledgeEntries(userId!);
  return <KnowledgeTimeline entries={entries} />;
}
