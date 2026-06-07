"use client";

import {
  AppShellNavbar,
  ScrollArea,
  Collapse,
  Tooltip,
  Divider,
  Avatar,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconChevronRight,
  IconSettings,
} from "@tabler/icons-react";
import { navigation, type NavItem, type NavGroup } from "@/core/navigation";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useUser } from "@clerk/nextjs";

const DEFAULT_PINNED = new Set(["dashboard", "tasks", "timeline", "notes", "journal", "calendar"]);

function findNavItem(featureId: string): NavItem | undefined {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.featureId === featureId) return item;
      if (item.children) {
        const child = item.children.find((c) => c.featureId === featureId);
        if (child) return child;
      }
    }
  }
}

const pinnedItems = [...DEFAULT_PINNED].map((id) => findNavItem(id)).filter(Boolean) as NavItem[];

type NavItemLinkProps = {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
};

function NavItemLink({ item, collapsed, depth = 0 }: NavItemLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.route || pathname.startsWith(item.route + "/");

  const content = (
    <div
      className={cn(
        "nav-item group relative flex items-center gap-3 rounded-lg transition-all duration-150",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
        depth > 0 && !collapsed && "ml-4",
        isActive
          ? "nav-item-active bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400" />
      )}
      <div
        className={cn(
          "flex-shrink-0 transition-colors duration-150",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300",
        )}
      >
        <item.icon size={collapsed ? 20 : 18} />
      </div>
      {!collapsed && (
        <span className="truncate text-sm font-medium leading-none">{item.label}</span>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} position="right" offset={12} withArrow>
        <Link href={item.route}>{content}</Link>
      </Tooltip>
    );
  }

  return <Link href={item.route}>{content}</Link>;
}

type NavItemWithChildrenProps = {
  item: NavItem;
  collapsed: boolean;
};

function NavItemWithChildren({ item, collapsed }: NavItemWithChildrenProps) {
  const pathname = usePathname();
  const hasActiveChild =
    item.children?.some((c) => pathname === c.route || pathname.startsWith(c.route + "/")) ?? false;
  const [opened, { toggle }] = useDisclosure(hasActiveChild);

  if (collapsed) {
    return (
      <>
        {item.children?.map((child) => (
          <NavItemLink key={child.featureId} item={child} collapsed={collapsed} />
        ))}
      </>
    );
  }

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
            <NavItemLink key={child.featureId} item={child} collapsed={collapsed} depth={1} />
          ))}
        </div>
      </Collapse>
    </div>
  );
}

type GroupSectionProps = {
  group: NavGroup;
  collapsed: boolean;
};

function GroupSection({ group, collapsed }: GroupSectionProps) {
  const pathname = usePathname();
  const hasActiveItem = group.items.some(
    (item) =>
      pathname === item.route ||
      pathname.startsWith(item.route + "/") ||
      item.children?.some((c) => pathname === c.route || pathname.startsWith(c.route + "/")),
  );
  const [opened, { toggle }] = useDisclosure(hasActiveItem);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-2">
        {group.items.map((item) =>
          item.children ? (
            item.children.map((child) => (
              <NavItemLink key={child.featureId} item={child} collapsed={collapsed} />
            ))
          ) : (
            <NavItemLink key={item.featureId} item={item} collapsed={collapsed} />
          ),
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={toggle}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 transition-colors duration-150",
          hasActiveItem ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500",
        )}
      >
        <IconChevronRight
          size={10}
          className={cn("flex-shrink-0 transition-transform duration-150", opened && "rotate-90")}
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest">
          {group.label}
        </span>
      </button>
      <Collapse in={opened}>
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) =>
            item.children ? (
              <NavItemWithChildren key={item.featureId} item={item} collapsed={collapsed} />
            ) : (
              <NavItemLink key={item.featureId} item={item} collapsed={collapsed} />
            ),
          )}
        </div>
      </Collapse>
    </div>
  );
}

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-3 px-3", collapsed ? "justify-center py-4" : "py-4")}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20">
        <span className="text-sm font-bold text-white">L</span>
      </div>
      {!collapsed && (
        <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
          Life OS
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const { opened } = useAppShell();
  const { user } = useUser();
  const collapsed = !opened;

  return (
    <AppShellNavbar className="sidebar-navbar-inner">
      <div className="flex h-full flex-col">
        <SidebarLogo collapsed={collapsed} />

        {!collapsed && pinnedItems.length > 0 && (
          <>
            <div className="space-y-0.5 px-2">
              <Text size="xs" fw={600} c="dimmed" className="px-1 pb-1 pt-0">
                Favorites
              </Text>
              {pinnedItems.map((item) => (
                <NavItemLink key={item.featureId} item={item} collapsed={false} />
              ))}
            </div>
            <div className="px-4 py-2">
              <Divider />
            </div>
          </>
        )}

        {collapsed && pinnedItems.length > 0 && (
          <>
            <div className="flex flex-col items-center gap-0.5 pb-2">
              {pinnedItems.map((item) => (
                <NavItemLink key={item.featureId} item={item} collapsed={true} />
              ))}
            </div>
            <div className="mx-3 py-1">
              <Divider />
            </div>
          </>
        )}

        <div className="flex-1 overflow-hidden">
          <ScrollArea h="100%" scrollbarSize={4} type="hover">
            <div
              className={
                collapsed
                  ? "flex flex-col items-center gap-0.5 pb-4 pt-2"
                  : "px-2 pb-4 pt-1"
              }
            >
              {navigation.map((group) => (
                <GroupSection key={group.label} group={group} collapsed={collapsed} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <div
          className={cn(
            "flex-shrink-0 border-t border-gray-200/60 dark:border-gray-700/40",
            collapsed
              ? "flex flex-col items-center gap-1 py-2"
              : "flex items-center justify-between px-3 py-2.5",
          )}
        >
          {collapsed ? (
            <>
              <Link
                href="/settings"
                className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
              >
                <IconSettings size={18} />
              </Link>
              <Tooltip label={user?.fullName ?? "User"} position="right" offset={12}>
                <Link
                  href="/settings"
                  className="flex items-center justify-center rounded-lg p-1 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                >
                  <Avatar src={user?.imageUrl} size="sm" alt={user?.fullName ?? "User"} />
                </Link>
              </Tooltip>
            </>
          ) : (
            <div className="flex w-full items-center justify-between">
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                <Avatar src={user?.imageUrl} size="xs" alt={user?.fullName ?? "User"} />
                <div className="min-w-0">
                  <Text size="xs" fw={500} truncate maw={120}>
                    {user?.fullName ?? "User"}
                  </Text>
                  <Text size="10" c="dimmed" truncate maw={120}>
                    {user?.primaryEmailAddress?.emailAddress ?? ""}
                  </Text>
                </div>
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
              >
                <IconSettings size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShellNavbar>
  );
}
