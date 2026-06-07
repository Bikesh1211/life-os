import { auth } from "@clerk/nextjs/server";
import { getJournalEntries } from "@/modules/journal";
import { computeStreak } from "@/modules/journal/utils";
import { JournalContent } from "./JournalContent";

export default async function JournalPage() {
  const { userId } = await auth();
  const entries = await getJournalEntries(userId!, { limit: 100, sortBy: "createdAt", sortOrder: "desc" });
  const dates = entries.map((e) => new Date(e.createdAt));
  const streak = computeStreak(dates);

  return <JournalContent entries={entries} streak={streak} />;
}
