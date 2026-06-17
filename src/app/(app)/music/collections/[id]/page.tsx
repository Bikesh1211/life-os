import { CollectionDetailContent } from "@/modules/music/components/collections/CollectionDetailContent";

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CollectionDetailContent idPromise={params} />;
}
