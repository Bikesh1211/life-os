import { auth } from "@clerk/nextjs/server";
import { getTimelineEvents } from "@/modules/timeline";
import { TimelineContent } from "./TimelineContent";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const { userId } = await auth();
  const events = await getTimelineEvents(userId!);
  return <TimelineContent events={events} />;
}
