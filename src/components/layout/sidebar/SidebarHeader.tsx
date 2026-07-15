"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Text } from "@mantine/core";
import { APP_NAME } from "@/core/constants";
import { cn } from "@/core/utils";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarQuickCreate } from "./SidebarQuickCreate";

export function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex flex-col gap-1 pt-3 pb-1.5">
      <Link
        href="/"
        className={cn(
          "flex items-center flex-shrink-0 transition-colors group",
          collapsed ? "justify-center h-10 w-full" : "gap-2.5 h-10 w-full px-3",
        )}
        title="Go to dashboard"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-500/20 dark:shadow-blue-500/10 ring-1 ring-white/10 dark:ring-white/5">
          {APP_NAME.charAt(0)}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <Text fw={600} size="sm" className="tracking-tight">
                {APP_NAME}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <SidebarSearch collapsed={collapsed} />
      <SidebarQuickCreate collapsed={collapsed} />
    </div>
  );
}
