import { TrackContent } from "@/modules/music/components/track/TrackContent";

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  return <TrackContent idPromise={params} />;
}
