import { AlbumContent } from "@/modules/music/components/album/AlbumContent";

export const dynamic = "force-dynamic";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  return <AlbumContent idPromise={params} />;
}
