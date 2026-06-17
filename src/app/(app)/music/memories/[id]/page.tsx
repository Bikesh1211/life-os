import { MemoryDetailContent } from "@/modules/music/components/memory/MemoryDetailContent";

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <MemoryDetailContent idPromise={params} />;
}
