import { auth } from "@clerk/nextjs/server";
import { getKnowledgeEntries, getEntrySubjects } from "@/modules/knowledge";
import { KnowledgeLibrary } from "../components/KnowledgeLibrary";

export const dynamic = "force-dynamic";

export default async function KnowledgeLibraryPage() {
  const { userId } = await auth();
  const [entries, subjects] = await Promise.all([
    getKnowledgeEntries(userId!),
    getEntrySubjects(userId!),
  ]);
  return <KnowledgeLibrary entries={entries} subjects={subjects} />;
}
