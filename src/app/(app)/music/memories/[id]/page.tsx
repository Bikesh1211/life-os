import { MemoryDetailContent } from "@/modules/music/components/memory/MemoryDetailContent";

export const dynamic = "force-dynamic";

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <MemoryDetailContent idPromise={params} />;
}
