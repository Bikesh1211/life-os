import { TrackContent } from "@/modules/music/components/track/TrackContent";

export const dynamic = "force-dynamic";

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  return <TrackContent idPromise={params} />;
}
