"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Tabs, Container } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconLayoutDashboard, IconShirt, IconPalette, IconBackpack, IconChartBar } from "@tabler/icons-react";

const TABS = [
  { value: "/inventory/wardrobe", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "/inventory/wardrobe/items", label: "Items", icon: IconShirt },
  { value: "/inventory/wardrobe/outfits", label: "Outfits", icon: IconPalette },
  { value: "/inventory/wardrobe/packing", label: "Packing", icon: IconBackpack },
  { value: "/inventory/wardrobe/analytics", label: "Analytics", icon: IconChartBar },
];

export default function WardrobeShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = TABS.find(t => pathname === t.value || pathname.startsWith(t.value + "/"))?.value || TABS[0].value;

  return (
    <Container size="xl" py="md">
      <Tabs value={activeTab} onChange={(v) => v && router.push(v)} mb="lg">
        <Tabs.List>
          {TABS.map(tab => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {children}
    </Container>
  );
}
