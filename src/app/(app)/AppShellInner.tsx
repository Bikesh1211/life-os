"use client";

import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, SidebarContent, Header, MobileDrawer, MobileNav } from "@/components/layout";
import { useAppShell } from "./AppShellProvider";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened, collapsed, mobileOpened, minimalChrome, closeMobile } = useAppShell();
  const sidebarWidth = collapsed ? 64 : 280;

  return (
    <>
      <AppShell
        padding="md"
        navbar={{
          width: sidebarWidth,
          breakpoint: "sm",
          collapsed: { desktop: minimalChrome || !opened, mobile: true },
        }}
        header={{ height: minimalChrome ? 0 : 56 }}
        classNames={{ navbar: "sidebar-navbar", main: "sidebar-main" }}
      >
        <Header />
        <Sidebar />
        <AppShellMain>{children}</AppShellMain>
      </AppShell>

      {!minimalChrome && <MobileNav />}

      {!minimalChrome && (
        <MobileDrawer opened={mobileOpened} onClose={closeMobile}>
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                Life OS
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent showBrand={false} />
            </div>
          </div>
        </MobileDrawer>
      )}
    </>
  );
}
