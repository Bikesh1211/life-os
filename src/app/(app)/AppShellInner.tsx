"use client";

import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, Header } from "@/components/layout";
import { useAppShell } from "./AppShellProvider";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened } = useAppShell();
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { desktop: !opened, mobile: !opened },
      }}
      header={{ height: 56 }}
    >
      <Header />
      <Sidebar />
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
