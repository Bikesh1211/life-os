"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SidebarItemLink } from "./SidebarItem";
import { SidebarGroupSection } from "./SidebarGroupSection";
import type { NavGroup } from "@/core/navigation";
import type { NavItem } from "@/core/navigation";

type SidebarNavProps = {
  collapsed: boolean;
  groups: NavGroup[];
  defaultItems: NavItem[];
  customItems: NavItem[];
  hasFavorites: boolean;
};

export function SidebarNav({
  collapsed,
  groups,
  defaultItems,
  customItems,
  hasFavorites,
}: SidebarNavProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={collapsed ? "collapsed" : "expanded"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        layout
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1.5 pb-2 scrollbar-thin"
      >
        {hasFavorites && (
          <div className="mb-0.5">
            <div className="space-y-0.5">
              {defaultItems.map((item) => (
                <SidebarItemLink
                  key={item.featureId}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
              {customItems.map((item) => (
                <SidebarItemLink
                  key={item.featureId}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {hasFavorites && !collapsed && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent mx-2 my-1.5" />
        )}

        {groups.map((group) =>
          group.label === "Favorites" ? null : (
            <SidebarGroupSection
              key={group.label}
              group={group}
              collapsed={collapsed}
            />
          ),
        )}
      </motion.div>
    </AnimatePresence>
  );
}
