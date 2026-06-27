"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { IconSettings, IconWriting, IconBook2 } from "@tabler/icons-react";

const bookTabs = [
  { value: "write", label: "Write", icon: IconWriting },
  { value: "read", label: "Read", icon: IconBook2 },
  { value: "settings", label: "Settings", icon: IconSettings },
];

function getTabValue(pathname: string, bookId: string) {
  if (pathname.endsWith(`/books/${bookId}/write`)) return "write";
  if (pathname.endsWith(`/books/${bookId}/read`)) return "read";
  if (pathname === `/books/${bookId}` || pathname.endsWith(`/books/${bookId}/settings`)) return "settings";
  return "settings";
}

export function BookDetailShell({
  children,
  bookId,
}: {
  children: React.ReactNode;
  bookId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = getTabValue(pathname, bookId);

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={(value) => {
          if (!value) return;
          const base = `/books/${bookId}`;
          if (value === "settings") router.push(base);
          else router.push(`${base}/${value}`);
        }}
      >
        <Tabs.List mb="lg">
          {bookTabs.map((tab) => (
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
