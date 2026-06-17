import { getCurrentUserId } from "@/core/auth";
import { getKnowledgeEntries, getEntrySubjects } from "@/modules/knowledge";
import { KnowledgeLibrary } from "../components/KnowledgeLibrary";


export default async function KnowledgeLibraryPage() {
  const userId = await getCurrentUserId();
  const [entries, subjects] = await Promise.all([
    getKnowledgeEntries(userId!),
    getEntrySubjects(userId!),
  ]);
  return <KnowledgeLibrary entries={entries} subjects={subjects} />;
}
