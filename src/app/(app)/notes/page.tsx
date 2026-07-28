import { requireAuth } from "@/core/auth";
import { getNotes } from "@/modules/notes";
import { NotesContent } from "@/components/notes/NotesContent";


export default async function NotesPage() {
  const userId = await requireAuth();
  const notes = await getNotes(userId, { limit: 100, sortBy: "updatedAt", sortOrder: "desc" });

  return <NotesContent initialNotes={notes} />;
}
