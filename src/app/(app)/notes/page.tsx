import { auth } from "@clerk/nextjs/server";
import { getNotes } from "@/modules/notes";
import { NotesContent } from "@/components/notes/NotesContent";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const { userId } = await auth();
  const notes = await getNotes(userId!, { limit: 100, sortBy: "updatedAt", sortOrder: "desc" });

  return <NotesContent initialNotes={notes} />;
}
