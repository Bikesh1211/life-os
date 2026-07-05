"use client";

import { Suspense } from "react";
import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, Header, MobileDrawer, MobileNav, SidebarContent } from "@/components/layout";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { PageTransition } from "@/components/ui/page-transition";
import { APP_NAME } from "@/core/constants";
import { useAppShell } from "./AppShellProvider";
import { cn } from "@/core/utils";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened, collapsed, mobileOpened, minimalChrome, closeMobile } = useAppShell();
  const sidebarWidth = collapsed ? 72 : 280;

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <AppShell
        padding="md"
        navbar={{
          width: sidebarWidth,
          breakpoint: "sm",
          collapsed: { desktop: minimalChrome || !opened, mobile: true },
        }}
        header={{ height: minimalChrome ? 0 : 56 }}
        transitionDuration={350}
        transitionTimingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
        classNames={{
          navbar: cn(
            "border-0 bg-transparent",
            "pt-1.5 pb-1.5 pl-1.5",
          ),
          main: "sidebar-main",
        }}
      >
        <Header />
        <Sidebar />
        <AppShellMain>
          <PageTransition>{children}</PageTransition>
        </AppShellMain>
      </AppShell>

      {!minimalChrome && <MobileNav />}

      {!minimalChrome && (
        <MobileDrawer opened={mobileOpened} onClose={closeMobile}>
          <div className="h-full flex flex-col py-4">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-[10px] font-bold text-white">
                {APP_NAME.charAt(0)}
              </div>
              <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                {APP_NAME}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent showBrand={false} showBottomCollapse={false} />
            </div>
          </div>
        </MobileDrawer>
      )}
    </>
  );
}
