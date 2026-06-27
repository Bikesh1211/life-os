"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { IconBooks, IconPlus, IconSearch } from "@tabler/icons-react";

const tabs = [
  { value: "/creator-studio/books", label: "Library", icon: IconBooks },
  { value: "/creator-studio/books/new", label: "New Book", icon: IconPlus },
  { value: "/creator-studio/books/search", label: "Search", icon: IconSearch },
];

export function BookShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find(
    (t) => pathname === t.value || pathname.startsWith(t.value + "/"),
  )?.value ?? "/creator-studio/books";

  const showTabs = !pathname.match(/\/creator-studio\/books\/[^/]+\/(write|read)/);

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
