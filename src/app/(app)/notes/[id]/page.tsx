import { getCurrentUserId } from "@/core/auth";
import { getNote } from "@/modules/notes";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function NoteReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { id } = await params;
  const note = await getNote(id, userId);
  if (!note) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/notes" className="text-sm text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to notes
      </Link>
      <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(note.updatedAt).toLocaleDateString()}
        {note.category !== "personal" && <> &middot; {note.category}</>}
        {note.tags && note.tags.length > 0 && <> &middot; {note.tags.join(", ")}</>}
      </p>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {note.content || "No content"}
      </div>
    </div>
  );
}
