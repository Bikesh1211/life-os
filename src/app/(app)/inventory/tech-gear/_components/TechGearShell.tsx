"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Tabs, Container } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconLayoutDashboard, IconDeviceLaptop, IconComponents, IconTools } from "@tabler/icons-react";

const TABS = [
  { value: "/inventory/tech-gear", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "/inventory/tech-gear/items", label: "Items", icon: IconDeviceLaptop },
  { value: "/inventory/tech-gear/setups", label: "Setups", icon: IconComponents },
  { value: "/inventory/tech-gear/maintenance", label: "Maintenance", icon: IconTools },
];

export default function TechGearShell({ children }: { children: ReactNode }) {
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
