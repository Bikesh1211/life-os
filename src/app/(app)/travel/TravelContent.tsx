"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Group, Stack, Tabs, Text } from "@mantine/core";
import {
  IconArrowRight,
  IconPlane,
  IconBackpack,
  IconCompass,
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

/**
 * The way into Explore Mode.
 *
 * The tabs below are the *workbench* — where trips, places and journals are
 * entered and edited. Explore is the same records read as an archive, and it
 * takes over the whole window when it opens, so it cannot be a ninth tab: it is
 * a door, and it says so.
 */
function ExploreEntry() {
  return (
    <Card
      component={Link}
      href="/travel/explore"
      withBorder
      radius="md"
      padding="md"
      className="group transition-colors hover:border-[var(--mantine-color-orange-5)]"
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Group gap="md" wrap="nowrap">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--mantine-color-orange-light)]">
            <IconCompass size={22} className="text-[var(--mantine-color-orange-filled)]" />
          </div>
          <div className="min-w-0">
            <Text fw={600} size="sm">
              Explore Mode — The Adventure Archive
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              Your trips and places as an expedition map, a timeline, a gallery and the stories you
              brought back.
            </Text>
          </div>
        </Group>
        <IconArrowRight
          size={18}
          className="shrink-0 text-[var(--mantine-color-dimmed)] transition-transform group-hover:translate-x-0.5"
        />
      </Group>
    </Card>
  );
}

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
      <ExploreEntry />

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
