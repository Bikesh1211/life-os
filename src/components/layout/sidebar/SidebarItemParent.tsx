"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "@mantine/core";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { SidebarItemLink } from "./SidebarItem";
import type { NavItem } from "@/core/navigation";

const NAV_ICON_SIZE = 18;

type SidebarItemParentProps = {
  item: NavItem;
  collapsed?: boolean;
};

export function SidebarItemParent({
  item,
  collapsed = false,
}: SidebarItemParentProps) {
  const pathname = usePathname();
  const { closeMobile } = useAppShell();
  const hasActiveChild =
    item.children?.some(
      (c) => pathname === c.route || pathname.startsWith(c.route + "/"),
    ) ?? false;
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  if (collapsed) {
    return (
      <div className="group relative flex items-center justify-center px-1">
        <Menu position="right-start" offset={12} withArrow shadow="xl" width={200}>
          <Menu.Target>
            <button
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150",
                hasActiveChild
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300",
              )}
              title={item.label}
            >
              <Icon size={NAV_ICON_SIZE} />
            </button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{item.label}</Menu.Label>
            {item.children?.map((child) => {
              const isChildActive =
                pathname === child.route ||
                pathname.startsWith(child.route + "/");
              const ChildIcon = child.icon;
              return (
                <Menu.Item
                  key={child.featureId}
                  component={Link}
                  href={child.route}
                  leftSection={<ChildIcon size={16} />}
                  onClick={closeMobile}
                  className={isChildActive ? "text-blue-600 dark:text-blue-400" : ""}
                >
                  {child.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
        {hasActiveChild && (
          <div className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-full bg-blue-500 dark:bg-blue-400" />
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-150",
          "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
        )}
      >
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center",
          hasActiveChild ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500",
        )}>
          <Icon size={NAV_ICON_SIZE} strokeWidth={1.75} />
        </div>
        <span className="flex-1 truncate text-left">{item.label}</span>
        <IconChevronRight
          size={12}
          strokeWidth={1.5}
          className={cn(
            "flex-shrink-0 transition-transform duration-200 text-gray-400 dark:text-gray-500",
            open && "rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-0.5 space-y-0.5 pb-1">
              {item.children?.map((child) => (
                <SidebarItemLink
                  key={child.featureId}
                  item={child}
                  depth={1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
