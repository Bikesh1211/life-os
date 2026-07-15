"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import type { NavItem } from "@/core/navigation";

const NAV_ICON_SIZE = 18;

type SidebarItemLinkProps = {
  item: NavItem;
  depth?: number;
  collapsed?: boolean;
};

export function SidebarItemLink({
  item,
  depth = 0,
  collapsed = false,
}: SidebarItemLinkProps) {
  const pathname = usePathname();
  const { closeMobile } = useAppShell();
  const isActive =
    pathname === item.route || pathname.startsWith(item.route + "/");
  const Icon = item.icon;

  if (collapsed) {
    return (
      <div className="group relative flex items-center justify-center px-1">
        <Link
          href={item.route}
          onClick={closeMobile}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150",
            isActive
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300",
          )}
          title={item.label}
        >
          <Icon size={NAV_ICON_SIZE} />
        </Link>
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-full bg-blue-500 dark:bg-blue-400" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("group relative", depth > 0 && "pl-7")}>
      <Link
        href={item.route}
        onClick={closeMobile}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all duration-150",
          "text-sm",
          depth > 0 && "text-xs",
          isActive
            ? "bg-blue-50/80 dark:bg-blue-500/10 font-semibold text-blue-700 dark:text-blue-300 shadow-sm"
            : "font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 flex items-center justify-center",
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500",
          )}
        >
          <Icon size={depth > 0 ? 14 : NAV_ICON_SIZE} strokeWidth={isActive ? 2.5 : 1.75} />
        </div>
        <span className="truncate leading-snug">{item.label}</span>
      </Link>
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300 shadow-sm shadow-blue-500/30 dark:shadow-blue-400/20" />
      )}
    </div>
  );
}
