import { auth } from "@clerk/nextjs/server";
import { getTimelineEvents } from "@/modules/timeline";
import { TimelineContent } from "../TimelineContent";


export default async function TimelineAnalyticsPage() {
  const { userId } = await auth();
  const events = await getTimelineEvents(userId!);
  return <TimelineContent events={events} defaultTab="insights" />;
}
