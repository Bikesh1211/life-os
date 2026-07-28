import { requireAuth } from "@/core/auth";
import { getKnowledgeEntry, getEntrySubjects } from "@/modules/knowledge";
import { notFound } from "next/navigation";
import { EntryForm } from "../../components/EntryForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditKnowledgeEntryPage({ params }: Props) {
  const userId = await requireAuth();
  const { id } = await params;
  const [entry, subjects] = await Promise.all([
    getKnowledgeEntry(id, userId),
    getEntrySubjects(userId),
  ]);

  if (!entry) notFound();

  return <EntryForm subjects={subjects} initialData={entry} />;
}
