"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { IconBooks, IconPlus, IconSearch } from "@tabler/icons-react";

const tabs = [
  { value: "/books", label: "Library", icon: IconBooks },
  { value: "/books/new", label: "New Book", icon: IconPlus },
  { value: "/books/search", label: "Search", icon: IconSearch },
];

export function BookShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find(
    (t) => pathname === t.value || pathname.startsWith(t.value + "/"),
  )?.value ?? "/books";

  const showTabs = !pathname.match(/\/books\/[^/]+\/(write|read)/);

  return (
    <>
      {showTabs && (
        <Tabs value={currentTab} onChange={(value) => value && router.push(value)}>
          <Tabs.List mb="lg">
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      )}
      {children}
    </>
  );
}
