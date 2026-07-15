"use client";

import { memo } from "react";
import { AppShellNavbar } from "@mantine/core";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { SidebarContent } from "./SidebarContent";

export const Sidebar = memo(function Sidebar() {
  const { opened, collapsed, minimalChrome } = useAppShell();

  if (minimalChrome) return null;

  return (
    <AppShellNavbar className="sd-navbar">
      {opened && <SidebarContent collapsed={collapsed} />}
    </AppShellNavbar>
  );
});
