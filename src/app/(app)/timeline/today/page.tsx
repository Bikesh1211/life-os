import { requireAuth } from "@/core/auth";
import { getTimelineEvents } from "@/modules/timeline";
import { TimelineContent } from "../TimelineContent";


export default async function TimelineTodayPage() {
  const userId = await requireAuth();
  const events = await getTimelineEvents(userId);
  return <TimelineContent events={events} defaultTab="today" />;
}
