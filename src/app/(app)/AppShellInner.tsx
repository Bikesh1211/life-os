"use client";

import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, SidebarContent, Header, MobileDrawer, MobileNav } from "@/components/layout";
import { useAppShell } from "./AppShellProvider";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened, mobileOpened, minimalChrome, closeMobile } = useAppShell();

  return (
    <>
      <AppShell
        padding="md"
        navbar={{
          width: 280,
          breakpoint: "sm",
          collapsed: { desktop: minimalChrome || !opened, mobile: true },
        }}
        header={{ height: minimalChrome ? 0 : 56 }}
        classNames={{ navbar: "sidebar-navbar", main: "sidebar-main" }}
      >
        <Header />
        {!minimalChrome && <Sidebar />}
        <AppShellMain>{children}</AppShellMain>
      </AppShell>

      {!minimalChrome && <MobileNav />}

      {!minimalChrome && (
        <MobileDrawer opened={mobileOpened} onClose={closeMobile}>
          <div className="sidebar-navbar-inner h-full">
            <SidebarContent />
          </div>
        </MobileDrawer>
      )}
    </>
  );
}
