import { getCurrentUserId } from "@/core/auth";
import { getReadingDashboard } from "@/modules/reading";
import { LibraryContent } from "./LibraryContent";


export default async function LibraryPage() {
  const userId = await getCurrentUserId();
  const dashboard = userId ? await getReadingDashboard(userId) : null;

  return <LibraryContent initialDashboard={dashboard} />;
}
