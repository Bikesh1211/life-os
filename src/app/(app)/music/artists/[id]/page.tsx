import { ArtistContent } from "@/modules/music/components/artist/ArtistContent";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  return <ArtistContent idPromise={params} />;
}
