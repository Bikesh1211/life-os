import { auth } from "@clerk/nextjs/server";
import { getJournalEntries } from "@/modules/journal";
import { TimelineContent } from "./TimelineContent";

export default async function TimelinePage() {
  const { userId } = await auth();
  const entries = await getJournalEntries(userId!, { limit: 200, sortBy: "createdAt", sortOrder: "desc" });

  return <TimelineContent entries={entries} />;
}
