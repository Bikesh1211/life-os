import { auth } from "@clerk/nextjs/server";
import { getKnowledgeEntry, getEntrySubjects } from "@/modules/knowledge";
import { notFound } from "next/navigation";
import { EntryForm } from "../../components/EntryForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditKnowledgeEntryPage({ params }: Props) {
  const { userId } = await auth();
  const { id } = await params;
  const [entry, subjects] = await Promise.all([
    getKnowledgeEntry(id, userId!),
    getEntrySubjects(userId!),
  ]);

  if (!entry) notFound();

  return <EntryForm subjects={subjects} initialData={entry} />;
}
