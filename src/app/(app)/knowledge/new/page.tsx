import { auth } from "@clerk/nextjs/server";
import { getEntrySubjects } from "@/modules/knowledge";
import { EntryForm } from "../components/EntryForm";


export default async function NewKnowledgeEntryPage() {
  const { userId } = await auth();
  const subjects = await getEntrySubjects(userId!);
  return (
    <EntryForm subjects={subjects.length > 0 ? subjects : ["Technology", "Career", "Business", "Personal Growth"]} />
  );
}
