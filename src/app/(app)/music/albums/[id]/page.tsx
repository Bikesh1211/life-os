import { AlbumContent } from "@/modules/music/components/album/AlbumContent";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  return <AlbumContent idPromise={params} />;
}
