import { getCurrentUserId } from "@/core/auth";
import { getBloodPressureEntries } from "@/modules/wellness";
import { BloodPressureContent } from "./BloodPressureContent";

export const dynamic = "force-dynamic";

export default async function BloodPressurePage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const entries = await getBloodPressureEntries(userId, { period: "month" });
  return <BloodPressureContent entries={entries} />;
}
