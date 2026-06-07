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
        width: { base: 280, sm: opened ? 280 : 60 },
        breakpoint: "sm",
        collapsed: { desktop: false, mobile: !opened },
      }}
      header={{ height: 56 }}
      classNames={{ navbar: "sidebar-navbar", main: "sidebar-main" }}
    >
      <Header />
      <Sidebar />
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
