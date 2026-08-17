import { getCurrentUserId } from "@/core/auth";
import { getReadingItem, getReadingAnnotations, getReadingNotes, getReadingSessions } from "@/modules/reading";
import { ItemDetailContent } from "./ItemDetailContent";

type Props = { params: Promise<{ id: string }> };

export default async function ItemDetailPage({ params }: Props) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) return null;

  const [item, annotations, notes, sessions] = await Promise.all([
    getReadingItem(id, userId),
    getReadingAnnotations(userId, { readingItemId: id }),
    getReadingNotes(userId, { readingItemId: id }),
    getReadingSessions(userId, { readingItemId: id }),
  ]);

  if (!item) return <div>Not found</div>;

  return (
    <ItemDetailContent
      item={item}
      initialAnnotations={annotations}
      initialNotes={notes}
      initialSessions={sessions}
    />
  );
}
