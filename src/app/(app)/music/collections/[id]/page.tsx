import { CollectionDetailContent } from "@/modules/music/components/collections/CollectionDetailContent";

export const dynamic = "force-dynamic";

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CollectionDetailContent idPromise={params} />;
}
