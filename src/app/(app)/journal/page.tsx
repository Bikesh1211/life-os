import { requireAuth } from "@/core/auth";
import { getJournalEntries, getJournalStats } from "@/modules/journal";
import { computeStreak } from "@/modules/journal/utils";
import { JournalContent } from "./JournalContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function JournalPage({ searchParams }: Props) {
  const userId = await requireAuth();
  const [entries, stats] = await Promise.all([
    getJournalEntries(userId, { limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
    getJournalStats(userId),
  ]);
  const dates = entries.map((e) => new Date(e.createdAt));
  const streak = computeStreak(dates);
  const { tab } = await searchParams;
  return <JournalContent entries={entries} streak={streak} stats={stats} defaultTab={tab ?? "story"} />;
}
