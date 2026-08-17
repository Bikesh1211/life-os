"use client";

import { Suspense } from "react";
import { AppShell, AppShellMain } from "@mantine/core";
import { Sidebar, Header, MobileDrawer, MobileNav, SidebarContent } from "@/components/layout";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { PageTransition } from "@/components/ui/page-transition";
import { useAppShell } from "./AppShellProvider";
import { cn } from "@/core/utils";
import { ContextBackground } from "@/core/themes/contexts/ContextBackground";
import { CinematicHeader } from "@/core/themes/contexts/CinematicHeader";

export function AppShellInner({ children }: { children: React.ReactNode }) {
  const { opened, collapsed, mobileOpened, minimalChrome, closeMobile } = useAppShell();
  const sidebarWidth = collapsed ? 72 : 280;

  return (
    <>
      {/* Behind everything, and outside the AppShell so no layout depends on
          it. One fixed element for the whole application. */}
      <ContextBackground />

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
          <CinematicHeader />
          <PageTransition>{children}</PageTransition>
        </AppShellMain>
      </AppShell>

      {!minimalChrome && <MobileNav />}

      {!minimalChrome && (
        <MobileDrawer opened={mobileOpened} onClose={closeMobile}>
          <SidebarContent showBottomCollapse={false} />
        </MobileDrawer>
      )}
    </>
  );
}
