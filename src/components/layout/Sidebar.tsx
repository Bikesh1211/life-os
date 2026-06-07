"use client";

import {
  AppShellNavbar,
  ScrollArea,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { type NavItem } from "@/core/navigation";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useSidebarVisibility } from "@/core/sidebar-visibility";

type NavItemLinkProps = {
  item: NavItem;
  depth?: number;
};

function NavItemLink({ item, depth = 0 }: NavItemLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.route || pathname.startsWith(item.route + "/");

  return (
    <Link
      href={item.route}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150",
        depth > 0 && "ml-4",
        isActive
          ? "nav-item-active relative bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400" />
      )}
      <div
        className={cn(
          "flex-shrink-0",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-400 dark:text-gray-500",
        )}
      >
        <item.icon size={18} />
      </div>
      <span className="truncate text-sm font-medium leading-none">{item.label}</span>
    </Link>
  );
}

type NavItemWithChildrenProps = {
  item: NavItem;
};

function NavItemWithChildren({ item }: NavItemWithChildrenProps) {
  const pathname = usePathname();
  const hasActiveChild =
    item.children?.some((c) => pathname === c.route || pathname.startsWith(c.route + "/")) ?? false;
  const [opened, { toggle }] = useDisclosure(hasActiveChild);

  return (
    <div>
      <button
        onClick={toggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          hasActiveChild
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
        )}
      >
        <div
          className={cn(
            "flex-shrink-0",
            hasActiveChild
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500",
          )}
        >
          <item.icon size={18} />
        </div>
        <span className="flex-1 truncate text-left">{item.label}</span>
        <IconChevronRight
          size={14}
          className={cn(
            "flex-shrink-0 transition-transform duration-150",
            opened && "rotate-90",
            hasActiveChild ? "text-blue-500" : "text-gray-400",
          )}
        />
      </button>
      <Collapse in={opened}>
        <div className="mt-0.5 space-y-0.5">
          {item.children?.map((child) => (
            <NavItemLink key={child.featureId} item={child} depth={1} />
          ))}
        </div>
      </Collapse>
    </div>
  );
}

type GroupSectionProps = {
  group: { label: string; items: NavItem[] };
};

function GroupSection({ group }: GroupSectionProps) {
  const [opened, { toggle }] = useDisclosure(group.label === "Operations");

  return (
    <div className="mb-4">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-gray-500 transition-colors duration-150 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <IconChevronRight
          size={10}
          className={cn("flex-shrink-0 transition-transform duration-150", opened && "rotate-90")}
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest">{group.label}</span>
      </button>
      <Collapse in={opened}>
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) =>
            item.children ? (
              <NavItemWithChildren key={item.featureId} item={item} />
            ) : (
              <NavItemLink key={item.featureId} item={item} />
            ),
          )}
        </div>
      </Collapse>
    </div>
  );
}

export function SidebarContent() {
  const { loaded, getVisibleGroups } = useSidebarVisibility();

  const groups = loaded ? getVisibleGroups() : [];

  return (
    <div className="flex h-full flex-col">
      <div className="block sm:hidden px-4 pt-4 pb-2">
        <Link href="/dashboard" className="no-underline">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Life OS
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden pt-3">
        <ScrollArea h="100%" scrollbarSize={4} type="hover">
          <div className="px-2 pb-4">
            {groups.map((group) => (
              <GroupSection key={group.label} group={group} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { opened } = useAppShell();

  if (!opened) return null;

  return (
    <AppShellNavbar className="sidebar-navbar-inner">
      <SidebarContent />
    </AppShellNavbar>
  );
}
