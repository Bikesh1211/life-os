import { auth } from "@clerk/nextjs/server";
import { getTimelineEvents } from "@/modules/timeline";
import { TimelineContent } from "./TimelineContent";


type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function TimelinePage({ searchParams }: Props) {
  const { userId } = await auth();
  const events = await getTimelineEvents(userId!);
  const { tab } = await searchParams;
  return <TimelineContent events={events} defaultTab={tab ?? "today"} />;
}
