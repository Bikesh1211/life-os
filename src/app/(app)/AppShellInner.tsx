"use client";

import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, SidebarContent, Header, MobileDrawer, MobileNav } from "@/components/layout";
import { useAppShell } from "./AppShellProvider";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened, mobileOpened, closeMobile } = useAppShell();

  return (
    <>
      <AppShell
        padding="md"
        navbar={{
          width: 280,
          breakpoint: "sm",
          collapsed: { desktop: !opened, mobile: true },
        }}
        header={{ height: 56 }}
        classNames={{ navbar: "sidebar-navbar", main: "sidebar-main" }}
      >
        <Header />
        <Sidebar />
        <AppShellMain>{children}</AppShellMain>
      </AppShell>

      <MobileNav />

      <MobileDrawer opened={mobileOpened} onClose={closeMobile}>
        <div className="sidebar-navbar-inner h-full">
          <SidebarContent />
        </div>
      </MobileDrawer>
    </>
  );
}
