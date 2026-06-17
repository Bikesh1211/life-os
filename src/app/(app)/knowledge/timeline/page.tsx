import { auth } from "@clerk/nextjs/server";
import { getKnowledgeEntries } from "@/modules/knowledge";
import { KnowledgeTimeline } from "../components/KnowledgeTimeline";


export default async function KnowledgeTimelinePage() {
  const { userId } = await auth();
  const entries = await getKnowledgeEntries(userId!);
  return <KnowledgeTimeline entries={entries} />;
}
