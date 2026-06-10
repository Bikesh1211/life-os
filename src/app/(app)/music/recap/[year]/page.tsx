import { RecapContent } from "@/modules/music/components/recap/RecapContent";

export const dynamic = "force-dynamic";

export default async function MusicRecapPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return <RecapContent year={Number(year)} />;
}
