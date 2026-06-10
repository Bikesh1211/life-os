"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AppShellNavbar } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronRight,
  IconArrowBarToRight,
} from "@tabler/icons-react";
import { type NavItem } from "@/core/navigation";
import { cn } from "@/core/utils";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";

const NAV_ICON_SIZE = 18;
const SIDEBAR_COLLAPSED_W = 64;

/* ── Collapse toggle button ── */

function CollapseBtn() {
  const { toggleCollapsed } = useAppShell();
  return (
    <button
      onClick={toggleCollapsed}
      className="flex items-center justify-center h-9 w-9 mx-auto rounded-lg transition-all duration-150 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
      title="Expand sidebar"
    >
      <IconArrowBarToRight size={16} />
    </button>
  );
}

/* ── Brand top section ── */

function Brand({ collapsed }: { collapsed: boolean }) {
  const { toggleCollapsed } = useAppShell();
  return collapsed ? (
    <button
      onClick={toggleCollapsed}
      className="cursor-pointer flex items-center justify-center h-14 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors w-full"
      title="Expand sidebar"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-sm">
        L
      </div>
    </button>
  ) : (
    <button
      onClick={toggleCollapsed}
      className="cursor-pointer flex items-center gap-2.5 px-4 h-14 w-full border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-left"
      title="Collapse sidebar"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-sm">
        L
      </div>
      <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
        Focus Linq
      </span>
    </button>
  );
}

/* ── Nav item link ── */

type NavItemLinkProps = {
  item: NavItem;
  depth?: number;
  collapsed?: boolean;
};

function NavItemLink({
  item,
  depth = 0,
  collapsed = false,
}: NavItemLinkProps) {
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
        <div className="absolute left-full ml-2 z-50 hidden group-hover:block">
          <div className="px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-lg">
            {item.label}
          </div>
        </div>
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-full bg-blue-500 dark:bg-blue-400" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("group relative flex items-center", depth > 0 && "pl-8")}>
      <Link
        href={item.route}
        onClick={closeMobile}
        className={cn(
          "flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-all duration-150",
          "text-sm font-medium",
          depth > 0 && "text-xs",
          isActive
            ? "sd-nav-active text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
        )}
      >
        <div
          className={cn(
            "flex-shrink-0",
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500",
          )}
        >
          <Icon size={depth > 0 ? 14 : NAV_ICON_SIZE} />
        </div>
        <span className="truncate leading-none">{item.label}</span>
      </Link>
    </div>
  );
}

/* ── Parent item with children ── */

type NavItemParentProps = {
  item: NavItem;
  collapsed?: boolean;
};

function NavItemParent({
  item,
  collapsed = false,
}: NavItemParentProps) {
  const pathname = usePathname();
  const hasActiveChild =
    item.children?.some(
      (c) => pathname === c.route || pathname.startsWith(c.route + "/"),
    ) ?? false;
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  if (collapsed) {
    return (
      <CollapsedParentItem
        item={item}
        hasActiveChild={hasActiveChild}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-150",
          "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
        )}
      >
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          <Icon size={NAV_ICON_SIZE} />
        </div>
        <span className="flex-1 truncate text-left">{item.label}</span>
        <IconChevronRight
          size={12}
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
                <NavItemLink
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

/* ── Collapsed parent item with floating submenu ── */

function CollapsedParentItem({
  item,
  hasActiveChild,
}: {
  item: NavItem;
  hasActiveChild: boolean;
}) {
  const pathname = usePathname();
  const [subOpen, setSubOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    setSubOpen((o) => !o);
  }, []);

  useEffect(() => {
    if (!subOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [subOpen]);

  return (
    <>
      <div className="group relative flex items-center justify-center px-1">
        <button
          ref={triggerRef}
          onClick={handleClick}
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
        {hasActiveChild && (
          <div className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-full bg-blue-500 dark:bg-blue-400" />
        )}
      </div>
      <AnimatePresence>
        {subOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-50 w-48 py-1.5 rounded-xl border shadow-xl backdrop-blur-xl"
            style={{
              marginLeft: SIDEBAR_COLLAPSED_W + 8,
              backgroundColor: "var(--mantine-color-body)",
              borderColor: "var(--mantine-color-default-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
              {item.label}
            </div>
            {item.children?.map((child) => {
              const isChildActive =
                pathname === child.route ||
                pathname.startsWith(child.route + "/");
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.featureId}
                  href={child.route}
                  onClick={() => setSubOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                    isChildActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]",
                  )}
                >
                  <ChildIcon size={14} />
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Group section ── */

type GroupSectionProps = {
  group: { label: string; items: NavItem[] };
  collapsed?: boolean;
};

function GroupSection({
  group,
  collapsed = false,
}: GroupSectionProps) {
  const isSpecial = group.label === "System" || group.label === "Favorites";
  const pathname = usePathname();
  const hasActiveItem = group.items.some((item) => {
    if (pathname === item.route || pathname.startsWith(item.route + "/"))
      return true;
    return (
      item.children?.some(
        (c) => pathname === c.route || pathname.startsWith(c.route + "/"),
      ) ?? false
    );
  });
  const [open, setOpen] = useState(isSpecial || hasActiveItem);

  if (collapsed) {
    return (
      <div className="py-1 space-y-0.5">
        {group.items.map((item) =>
          item.children ? (
            <NavItemParent
              key={item.featureId}
              item={item}
              collapsed
            />
          ) : (
            <NavItemLink
              key={item.featureId}
              item={item}
              collapsed
            />
          ),
        )}
        <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-1" />
      </div>
    );
  }

  if (isSpecial) {
    return (
      <div>
        {group.label !== "Favorites" && (
          <div className="px-3 pb-1 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
              {group.label}
            </span>
          </div>
        )}
        <div className="space-y-0.5">
          {group.items.map((item) =>
            item.children ? (
              <NavItemParent
                key={item.featureId}
                item={item}
              />
            ) : (
              <NavItemLink
                key={item.featureId}
                item={item}
              />
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
        </div>
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1 text-left transition-colors group"
      >
        <IconChevronRight
          size={9}
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            open && "rotate-90",
            "text-gray-500 dark:text-gray-400",
          )}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer">
          {group.label}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="group-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-0.5 space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <NavItemParent
                    key={item.featureId}
                    item={item}
                  />
                ) : (
                  <NavItemLink
                    key={item.featureId}
                    item={item}
                  />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main sidebar content ── */

export function SidebarContent({ collapsed = false, showBrand = true }: { collapsed?: boolean; showBrand?: boolean }) {
  const { loaded, getVisibleGroups } = useSidebarVisibility();
  const {
    loaded: favLoaded,
    getFavoriteItems,
  } = useSidebarFavorites();

  const groups = loaded ? getVisibleGroups() : [];
  const favItems = favLoaded ? getFavoriteItems() : [];

  return (
    <div className="flex h-full flex-col sd-content">
      {showBrand && <Brand collapsed={collapsed} />}

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 pb-2 scrollbar-thin">
        {favItems.length > 0 && (
          <div className="mb-0.5">
            <div className="space-y-0.5">
              {favItems.map((item) => (
                <NavItemLink
                  key={item.featureId}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {favItems.length > 0 && !collapsed && (
          <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-1.5" />
        )}

        {groups.map((group) =>
          group.label === "Favorites" ? null : (
            <GroupSection
              key={group.label}
              group={group}
              collapsed={collapsed}
            />
          ),
        )}
      </div>

      {collapsed && (
        <div className="border-t border-gray-100 dark:border-white/5 py-1">
          <CollapseBtn />
        </div>
      )}
    </div>
  );
}

/* ── Sidebar wrapper ── */

export function Sidebar() {
  const { opened, collapsed, minimalChrome } = useAppShell();

  if (!opened || minimalChrome) return null;

  return (
    <AppShellNavbar
      className="sd-navbar"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_W : 280 }}
    >
      <SidebarContent collapsed={collapsed} />
    </AppShellNavbar>
  );
}
