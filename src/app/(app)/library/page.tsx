import { auth } from "@clerk/nextjs/server";
import { getReadingDashboard } from "@/modules/reading";
import { LibraryContent } from "./LibraryContent";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { userId } = await auth();
  const dashboard = userId ? await getReadingDashboard(userId) : null;

  return <LibraryContent initialDashboard={dashboard} />;
}
