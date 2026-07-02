"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconPlane,
  IconBackpack,
  IconStar,
  IconWorld,
  IconBook,
  IconPhoto,
  IconCoin,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { TripsPanel } from "./components/TripsPanel";
import { WishlistPanel } from "./components/WishlistPanel";
import { VisitedPanel } from "./components/VisitedPanel";
import { JournalsPanel } from "./components/JournalsPanel";
import { PhotosPanel } from "./components/PhotosPanel";
import { ExpensesPanel } from "./components/ExpensesPanel";
import { RestaurantsPanel } from "./components/RestaurantsPanel";
import { DashboardPanel } from "./components/DashboardPanel";

type DashboardData = {
  countriesVisited: number;
  visitedCountries: string[];
  citiesExplored: number;
  totalTrips: number;
  completedTrips: number;
  upcomingTrips: number;
  wishlistCount: number;
  journalCount: number;
  photoCount: number;
  restaurantCount: number;
  totalSpent: number;
  spendingByCategory: Record<string, number>;
  averageTripCost: number;
  favoriteDestination: string | null;
  lastTrip: { id: string; title: string; destination: string; endDate: Date | null } | null;
};

type Props = {
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconPlane },
  { value: "trips", label: "Trips", icon: IconBackpack },
  { value: "wishlist", label: "Wishlist", icon: IconStar },
  { value: "visited", label: "Visited", icon: IconWorld },
  { value: "journals", label: "Journals", icon: IconBook },
  { value: "photos", label: "Photos", icon: IconPhoto },
  { value: "expenses", label: "Expenses", icon: IconCoin },
  { value: "restaurants", label: "Restaurants", icon: IconToolsKitchen2 },
];

export function TravelContent({ dashboardData, dashboardLoading, defaultTab = "dashboard" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "dashboard") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/travel${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md">
          <DashboardPanel data={dashboardData} loading={dashboardLoading} />
        </Tabs.Panel>

        <Tabs.Panel value="trips" pt="md">
          <TripsPanel />
        </Tabs.Panel>

        <Tabs.Panel value="wishlist" pt="md">
          <WishlistPanel />
        </Tabs.Panel>

        <Tabs.Panel value="visited" pt="md">
          <VisitedPanel />
        </Tabs.Panel>

        <Tabs.Panel value="journals" pt="md">
          <JournalsPanel />
        </Tabs.Panel>

        <Tabs.Panel value="photos" pt="md">
          <PhotosPanel />
        </Tabs.Panel>

        <Tabs.Panel value="expenses" pt="md">
          <ExpensesPanel />
        </Tabs.Panel>

        <Tabs.Panel value="restaurants" pt="md">
          <RestaurantsPanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
