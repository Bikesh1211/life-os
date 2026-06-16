import { auth } from "@clerk/nextjs/server";
import { getNote } from "@/modules/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { notFound } from "next/navigation";

export default async function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;

  const { id } = await params;
  const note = await getNote(id, userId);
  if (!note) notFound();

  return <NoteEditor note={note} />;
}
