"use client";

import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

type SidebarContentProps = {
  collapsed?: boolean;
  showCollapse?: boolean;
};

export function SidebarContent({
  collapsed = false,
  showCollapse = true,
}: SidebarContentProps) {
  const { loaded, getVisibleGroups } = useSidebarVisibility();
  const {
    loaded: favLoaded,
    getDefaultFavoriteItems,
    getCustomFavoriteItems,
  } = useSidebarFavorites();

  const groups = loaded ? getVisibleGroups() : [];
  const defaultItems = favLoaded ? getDefaultFavoriteItems() : [];
  const customItems = favLoaded ? getCustomFavoriteItems() : [];
  const hasFavorites = defaultItems.length > 0 || customItems.length > 0;

  return (
    <div className="flex h-full flex-col min-h-0 sd-content">
      <SidebarHeader collapsed={collapsed} />

      {!collapsed && (
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent mx-3 my-1" />
      )}

      <SidebarNav
        collapsed={collapsed}
        groups={groups}
        defaultItems={defaultItems}
        customItems={customItems}
        hasFavorites={hasFavorites}
      />

      <SidebarFooter collapsed={collapsed} showCollapse={showCollapse} />
    </div>
  );
}
