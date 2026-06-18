import { getCurrentUserId } from "@/core/auth";
import { getHeartRateEntries } from "@/modules/wellness";
import { HeartRateContent } from "./HeartRateContent";

export default async function HeartRatePage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getHeartRateEntries(userId, { period: "month" });
  return <HeartRateContent entries={entries} />;
}
