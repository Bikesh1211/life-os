import { Suspense } from "react";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";
import { TravelContent } from "./TravelContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

async function TravelPageContent({ tab }: { tab?: string }) {
  const userId = await getCurrentUserId();
  let dashboardData = null;
  let dashboardLoading = true;

  if (userId) {
    try {
      dashboardData = await travelService.getDashboard(userId);
      dashboardLoading = false;
    } catch {
      dashboardLoading = false;
    }
  }

  return (
    <TravelContent
      dashboardData={dashboardData}
      dashboardLoading={dashboardLoading}
      defaultTab={tab ?? "dashboard"}
    />
  );
}

export default async function TravelPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={null}>
      <TravelPageContent tab={tab} />
    </Suspense>
  );
}
