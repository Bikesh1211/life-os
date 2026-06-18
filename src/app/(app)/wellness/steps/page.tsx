import { getCurrentUserId } from "@/core/auth";
import { getStepEntries } from "@/modules/wellness";
import { StepsContent } from "./StepsContent";

export default async function StepsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getStepEntries(userId, { period: "month" });
  return <StepsContent entries={entries} />;
}
