import { requireAuth } from "@/core/auth";
import { getKnowledgeEntry, getEntryLinks } from "@/modules/knowledge";
import { notFound } from "next/navigation";
import { EntryDetail } from "../components/EntryDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function KnowledgeEntryPage({ params }: Props) {
  const userId = await requireAuth();
  const { id } = await params;
  const [entry, links] = await Promise.all([
    getKnowledgeEntry(id, userId),
    getEntryLinks(id, userId),
  ]);

  if (!entry) notFound();

  return <EntryDetail entry={entry} links={links} />;
}
