import { getCurrentUserId } from "@/core/auth";
import { getVitalsSnapshot, getVitalsTrends } from "@/modules/health";
import { VitalsContent } from "./VitalsContent";

export const dynamic = "force-dynamic";

export default async function VitalsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [snapshot, trends] = await Promise.all([
    getVitalsSnapshot(userId),
    getVitalsTrends(userId),
  ]);

  return <VitalsContent snapshot={snapshot} trends={trends} />;
}
