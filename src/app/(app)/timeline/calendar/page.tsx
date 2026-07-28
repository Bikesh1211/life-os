import { requireAuth } from "@/core/auth";
import { getTimelineEvents } from "@/modules/timeline";
import { TimelineContent } from "../TimelineContent";


export default async function TimelineCalendarPage() {
  const userId = await requireAuth();
  const events = await getTimelineEvents(userId);
  return <TimelineContent events={events} defaultTab="calendar" />;
}
