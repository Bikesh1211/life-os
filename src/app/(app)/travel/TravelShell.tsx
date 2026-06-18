"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
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

const tabs = [
  { value: "/travel", label: "Dashboard", icon: IconPlane },
  { value: "/travel/trips", label: "Trips", icon: IconBackpack },
  { value: "/travel/wishlist", label: "Wishlist", icon: IconStar },
  { value: "/travel/visited", label: "Visited", icon: IconWorld },
  { value: "/travel/journals", label: "Journals", icon: IconBook },
  { value: "/travel/photos", label: "Photos", icon: IconPhoto },
  { value: "/travel/expenses", label: "Expenses", icon: IconCoin },
  { value: "/travel/restaurants", label: "Restaurants", icon: IconToolsKitchen2 },
];

export function TravelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname === t.value || pathname.startsWith(t.value + "/"))?.value ?? "/travel";

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={(value) => value && router.push(value)}
        styles={{
          tab: {
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 500,
          },
        }}
      >
        <Tabs.List mb="lg">
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {children}
    </>
  );
}
