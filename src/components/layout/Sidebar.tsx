"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { AppShellNavbar } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronRight,
  IconArrowBarToRight,
  IconStar,
  IconStarFilled,
  IconSearch,
  IconSettings,
  IconArchive,
  IconLogout,
} from "@tabler/icons-react";
import { type NavItem } from "@/core/navigation";
import { cn } from "@/core/utils";
import { APP_NAME } from "@/core/constants";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";

const NAV_ICON_SIZE = 18;
const SIDEBAR_COLLAPSED_W = 64;

/* ── Collapse toggle button ── */

function CollapseBtn() {
  const { collapsed, toggleCollapsed } = useAppShell();
  return (
    <button
      onClick={toggleCollapsed}
      className="flex items-center justify-center h-8 w-8 mx-auto rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <motion.div
        animate={{ rotate: collapsed ? 0 : 180 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <IconArrowBarToRight size={15} strokeWidth={1.5} />
      </motion.div>
    </button>
  );
}

/* ── Bottom icon button ── */

function BottomIconBtn({ href, onClick, icon: Icon, title }: { href?: string; onClick?: () => void; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string }) {
  const pathname = usePathname();
  const isActive = href ? pathname === href || pathname.startsWith(href + "/") : false;
  const classes = cn(
    "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
    isActive
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95",
  );
  if (onClick) {
    return (
      <button onClick={onClick} type="button" className={classes} title={title}>
        <Icon size={15} strokeWidth={1.5} />
      </button>
    );
  }
  return (
    <Link href={href!} className={classes} title={title}>
      <Icon size={15} strokeWidth={1.5} />
    </Link>
  );
}

/* ── Brand top section ── */

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "cursor-pointer flex items-center flex-shrink-0 transition-colors",
        collapsed
          ? "justify-center h-14 w-full"
          : "gap-3 h-14 w-full px-4 text-left border-b border-gray-100/80 dark:border-white/[0.06] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]",
      )}
      title="Go to dashboard"
    >
      <div className="sd-brand-logo flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-500/20 dark:shadow-blue-500/10 ring-1 ring-white/10 dark:ring-white/5">
        {APP_NAME.charAt(0)}
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-start leading-tight"
          >
            <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
              {APP_NAME}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}

/* ── Nav item link ── */

type NavItemLinkProps = {
  item: NavItem;
  depth?: number;
  collapsed?: boolean;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  isDefault?: boolean;
};

function NavItemLink({
  item,
  depth = 0,
  collapsed = false,
  onFavorite,
  isFavorited: fav,
  isDefault,
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
    <div className={cn("group relative flex items-center", depth > 0 && "pl-7")}>
      <Link
        href={item.route}
        onClick={closeMobile}
        className={cn(
          "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all duration-150",
          "text-sm",
          depth > 0 && "text-xs",
          isActive
            ? "sd-nav-active font-semibold text-blue-700 dark:text-blue-300"
            : "font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 flex items-center justify-center",
            isActive
              ? "sd-nav-active-icon"
              : "text-gray-400 dark:text-gray-500",
          )}
        >
          <Icon size={depth > 0 ? 14 : NAV_ICON_SIZE} strokeWidth={isActive ? 2.5 : 1.75} />
        </div>
        <span className="truncate leading-snug">{item.label}</span>
      </Link>
      {onFavorite && !isDefault && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite(item.featureId);
          }}
          className={cn(
            "flex-shrink-0 rounded p-0.5 transition-all duration-150 mr-1",
            fav
              ? "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              : "opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400",
          )}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          {fav ? <IconStarFilled size={12} /> : <IconStar size={12} />}
        </button>
      )}
    </div>
  );
}

/* ── Parent item with children ── */

type NavItemParentProps = {
  item: NavItem;
  collapsed?: boolean;
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
};

function NavItemParent({
  item,
  collapsed = false,
  onFavorite,
  isFavorited,
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
        onFavorite={onFavorite}
        isFavorited={isFavorited}
      />
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
          hasActiveChild ? "sd-nav-active-icon" : "text-gray-400 dark:text-gray-500",
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
                <NavItemLink
                  key={child.featureId}
                  item={child}
                  depth={1}
                  onFavorite={onFavorite}
                  isFavorited={isFavorited?.(child.featureId)}
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
  onFavorite,
  isFavorited,
}: {
  item: NavItem;
  hasActiveChild: boolean;
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
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
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
  isDefault?: (id: string) => boolean;
};

function GroupSection({
  group,
  collapsed = false,
  onFavorite,
  isFavorited,
  isDefault,
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
              onFavorite={onFavorite}
              isFavorited={isFavorited}
            />
          ) : (
            <NavItemLink
              key={item.featureId}
              item={item}
              collapsed
              onFavorite={onFavorite}
              isFavorited={isFavorited?.(item.featureId)}
              isDefault={isDefault?.(item.featureId)}
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
          <div className="px-3 pb-0.5 pt-1">
            <span className="sd-group-label">{group.label}</span>
          </div>
        )}
        <div className="space-y-0.5">
          {group.items.map((item) =>
            item.children ? (
              <NavItemParent
                key={item.featureId}
                item={item}
                onFavorite={onFavorite}
                isFavorited={isFavorited}
              />
            ) : (
              <NavItemLink
                key={item.featureId}
                item={item}
                onFavorite={onFavorite}
                isFavorited={isFavorited?.(item.featureId)}
                isDefault={isDefault?.(item.featureId)}
              />
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-3 pt-3 pb-0.5">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent" />
        </div>
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-0.5 text-left transition-colors group hover:opacity-80"
      >
        <IconChevronRight
          size={9}
          strokeWidth={1.5}
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            open && "rotate-90",
            "text-gray-400 dark:text-gray-500",
          )}
        />
        <span className="sd-group-label cursor-pointer">{group.label}</span>
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
                    onFavorite={onFavorite}
                    isFavorited={isFavorited}
                  />
                ) : (
                  <NavItemLink
                    key={item.featureId}
                    item={item}
                    onFavorite={onFavorite}
                    isFavorited={isFavorited?.(item.featureId)}
                    isDefault={isDefault?.(item.featureId)}
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

export function SidebarContent({ collapsed = false, showBrand = true, showBottomCollapse = true }: { collapsed?: boolean; showBrand?: boolean; showBottomCollapse?: boolean }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { loaded, getVisibleGroups } = useSidebarVisibility();
  const {
    loaded: favLoaded,
    getDefaultFavoriteItems,
    getCustomFavoriteItems,
    toggleFavorite,
    isFavorited,
    isDefault,
  } = useSidebarFavorites();

  const groups = loaded ? getVisibleGroups() : [];
  const defaultItems = favLoaded ? getDefaultFavoriteItems() : [];
  const customItems = favLoaded ? getCustomFavoriteItems() : [];
  const hasFavorites = defaultItems.length > 0 || customItems.length > 0;

  const openSpotlight = useCallback(() => {
    document.dispatchEvent(new CustomEvent("opencode-spotlight"));
  }, []);

  return (
    <div className="flex h-full flex-col sd-content">
      {showBrand && <Brand collapsed={collapsed} />}

      {!collapsed && (
        <div className="px-3 pt-2 pb-1.5">
          <button
            onClick={openSpotlight}
            className="flex items-center gap-2 w-full rounded-lg border border-gray-200/70 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.03] px-3 py-2 text-sm text-gray-400 dark:text-gray-500 transition-all duration-150 hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-100/60 dark:hover:bg-white/[0.06] cursor-text active:scale-[0.99]"
          >
            <IconSearch size={15} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="flex-shrink-0 hidden sm:inline-flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 leading-none">
              <span className="text-[8px]">⌘</span>K
            </kbd>
          </button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <motion.div
          key={collapsed ? "collapsed" : "expanded"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          layout
          className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 pb-2 scrollbar-thin"
        >
          {hasFavorites && (
            <div className="mb-0.5">
              <div className="space-y-0.5">
                {defaultItems.map((item) => (
                  <NavItemLink
                    key={item.featureId}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
                {customItems.map((item) => (
                  <NavItemLink
                    key={item.featureId}
                    item={item}
                    collapsed={collapsed}
                    onFavorite={toggleFavorite}
                    isFavorited={isFavorited(item.featureId)}
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
              <GroupSection
                key={group.label}
                group={group}
                collapsed={collapsed}
                onFavorite={toggleFavorite}
                isFavorited={isFavorited}
                isDefault={isDefault}
              />
            ),
          )}
        </motion.div>
      </AnimatePresence>

      <div className="border-t border-gray-100/80 dark:border-white/[0.06] px-3 py-2">
        <div className="flex items-center justify-center gap-1.5">
          <BottomIconBtn href="/settings" icon={IconSettings} title="Settings" />
          <BottomIconBtn href="/archive" icon={IconArchive} title="Archive" />
          <div className="w-px h-5 bg-gray-200/70 dark:bg-white/[0.08]" />
          <BottomIconBtn onClick={async () => { await supabase.auth.signOut(); router.push("/sign-in"); }} icon={IconLogout} title="Logout" />
          {showBottomCollapse && <CollapseBtn />}
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar wrapper ── */

export const Sidebar = memo(function Sidebar() {
  const { opened, collapsed, minimalChrome } = useAppShell();

  if (minimalChrome) return null;

  return (
    <AppShellNavbar className="sd-navbar">
      {opened && <SidebarContent collapsed={collapsed} />}
    </AppShellNavbar>
  );
});
