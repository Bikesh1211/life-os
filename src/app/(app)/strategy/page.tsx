import { getCurrentUserId } from "@/core/auth";
import { getStrategy } from "@/modules/strategy";
import { StrategyContent } from "./_components/StrategyContent";

export default async function StrategyPage() {
  const userId = await getCurrentUserId();
  const sections = userId ? await getStrategy(userId) : [];

  return <StrategyContent sections={sections} />;
}
