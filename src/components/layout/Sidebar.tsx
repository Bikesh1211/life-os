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
  IconPlus,
  IconSwitchHorizontal,
  IconMoon,
  IconSun,
  IconLayoutDashboard,
  IconBolt,
  IconHourglassEmpty,
} from "@tabler/icons-react";
import { type NavItem } from "@/core/navigation";
import { cn } from "@/core/utils";
import { APP_NAME } from "@/core/constants";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import { useMantineColorScheme, useComputedColorScheme, Avatar, Text, Tooltip } from "@mantine/core";

const NAV_ICON_SIZE = 18;
const SIDEBAR_COLLAPSED_W = 64;

/* ── User Profile ── */

function UserProfile({ collapsed }: { collapsed: boolean }) {
  const { user } = useSupabase();
  const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User";
  // const email = user?.email ?? "";
  const avatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "";

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 pt-3 pb-2">
        <Tooltip label={name} position="right">
          <Avatar src={avatar} alt={name} size="sm" radius="xl" className="ring-2 ring-white/20 dark:ring-white/10">
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
      <Avatar src={avatar} alt={name} size="md" radius="xl" className="ring-2 ring-white/50 dark:ring-white/10 flex-shrink-0">
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex-1 min-w-0">
        <Text size="sm" fw={600} truncate className="text-gray-900 dark:text-white">
          {name}
        </Text>
        {/* <Text size="xs" c="dimmed" truncate>
          {email}
        </Text> */}
      </div>
    </div>
  );
}

/* ── Collapse toggle ── */

function CollapseBtn() {
  const { collapsed, toggleCollapsed } = useAppShell();
  return (
    <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <IconArrowBarToRight size={14} strokeWidth={1.5} />
        </motion.div>
      </button>
    </Tooltip>
  );
}

/* ── Theme toggle ── */

function ThemeToggleBtn() {
  const [mounted, setMounted] = useState(false);
  const { colorScheme, setColorScheme, clearColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycle = useCallback(() => {
    if (colorScheme === "light") setColorScheme("dark");
    else if (colorScheme === "dark") clearColorScheme();
    else setColorScheme("light");
  }, [colorScheme, setColorScheme, clearColorScheme]);

  return (
    <Tooltip label={`${computed === "dark" ? "Light" : "Dark"} mode`} position="right">
      <button
        onClick={cycle}
        className="flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
      >
        {mounted ? (
          computed === "dark" ? <IconSun size={14} strokeWidth={1.5} /> : <IconMoon size={14} strokeWidth={1.5} />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
}

/* ── Bottom icon button ── */

function BottomIconBtn({
  href,
  onClick,
  icon: Icon,
  title,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
}) {
  const pathname = usePathname();
  const isActive = href ? pathname === href || pathname.startsWith(href + "/") : false;
  const classes = cn(
    "flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200",
    isActive
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95",
  );
  if (onClick) {
    return (
      <Tooltip label={title} position="right">
        <button onClick={onClick} type="button" className={classes}>
          <Icon size={14} strokeWidth={1.5} />
        </button>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={title} position="right">
      <Link href={href!} className={classes}>
        <Icon size={14} strokeWidth={1.5} />
      </Link>
    </Tooltip>
  );
}

/* ── Brand ── */

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center flex-shrink-0 transition-colors group",
        collapsed
          ? "justify-center h-12 w-full"
          : "gap-2.5 h-12 w-full px-4",
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
          >
            <Text fw={600} size="sm" className="tracking-tight">
              {APP_NAME}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}

/* ── Quick Create ── */

function QuickCreate({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="px-2 py-1.5">
        <Tooltip label="Quick Create" position="right">
          <button className="flex items-center justify-center w-full h-9 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-400 hover:to-blue-500 active:scale-95 transition-all duration-150">
            <IconPlus size={16} strokeWidth={2.5} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="px-3 py-1.5">
      <button className="flex items-center gap-2 w-full h-9 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:from-blue-400 hover:to-blue-500 active:scale-[0.98] transition-all duration-150 justify-center">
        <IconPlus size={16} strokeWidth={2.5} />
        <span>Quick Create</span>
      </button>
    </div>
  );
}

/* ── Workspace Switcher ── */

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="px-2 pb-1">
        <Tooltip label="Switch workspace" position="right">
          <button className="flex items-center justify-center w-full h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
            <IconSwitchHorizontal size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="px-3 pb-1">
      <button className="flex items-center gap-2 w-full h-8 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all px-2">
        <IconSwitchHorizontal size={14} strokeWidth={1.5} className="flex-shrink-0" />
        <span className="truncate">Personal Workspace</span>
      </button>
    </div>
  );
}

/* ── Search ── */

function SearchBtn({ collapsed }: { collapsed: boolean }) {
  const openSpotlight = useCallback(() => {
    document.dispatchEvent(new CustomEvent("opencode-spotlight"));
  }, []);

  if (collapsed) {
    return (
      <div className="px-2 pb-1.5">
        <Tooltip label="Search (⌘K)" position="right">
          <button
            onClick={openSpotlight}
            className="flex items-center justify-center w-full h-8 rounded-lg border border-gray-200/70 dark:border-white/[0.08] text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all"
          >
            <IconSearch size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="px-3 pb-1.5">
      <button
        onClick={openSpotlight}
        className="flex items-center gap-2 w-full rounded-lg border border-gray-200/70 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.03] px-3 h-8 text-xs text-gray-400 dark:text-gray-500 transition-all hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-100/60 dark:hover:bg-white/[0.06] cursor-text active:scale-[0.99]"
      >
        <IconSearch size={14} strokeWidth={1.5} className="flex-shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="flex-shrink-0 hidden sm:inline-flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 leading-none">
          <span className="text-[8px]">⌘</span>K
        </kbd>
      </button>
    </div>
  );
}

/* ── Nav Item Link ── */

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
        <Tooltip label={item.label} position="right">
          <Link
            href={item.route}
            onClick={closeMobile}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150",
              isActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300",
            )}
          >
            <Icon size={NAV_ICON_SIZE} />
          </Link>
        </Tooltip>
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

/* ── Collapsed parent item ── */

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
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-left transition-colors group hover:opacity-80"
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
      </div>
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

/* ── Storage Indicator ── */

function StorageIndicator({ collapsed }: { collapsed: boolean }) {
  const pct = 34;

  if (collapsed) {
    return (
      <div className="px-3 py-2">
        <Tooltip label={`${pct}% used`} position="right">
          <div className="h-1 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <Text size="xs" c="dimmed" fw={500}>
          Storage
        </Text>
        <Text size="xs" c="dimmed">
          {pct}%
        </Text>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
        />
      </div>
    </div>
  );
}

/* ── Main sidebar content ── */

export function SidebarContent({
  collapsed = false,
  showBrand = true,
  showBottomCollapse = true,
}: {
  collapsed?: boolean;
  showBrand?: boolean;
  showBottomCollapse?: boolean;
}) {
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

  return (
    <div className="flex h-full flex-col sd-content">
      {/* User Profile */}
      <UserProfile collapsed={collapsed} />

      {/* Workspace Switcher */}
      {/* {!collapsed && <WorkspaceSwitcher collapsed={collapsed} />} */}

      {/* Quick Create */}
      <QuickCreate collapsed={collapsed} />

      {/* Search */}
      {/* <SearchBtn collapsed={collapsed} /> */}

      {/* Divider */}
      {!collapsed && (
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent mx-3 my-1.5" />
      )}

      {/* Navigation */}
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

      {/* Storage Indicator */}
      <StorageIndicator collapsed={collapsed} />

      {/* Bottom Actions */}
      <div className="border-t border-gray-100/80 dark:border-white/[0.06] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <BottomIconBtn href="/settings" icon={IconSettings} title="Settings" />
            <BottomIconBtn href="/archive" icon={IconArchive} title="Archive" />
            <div className="w-px h-4 bg-gray-200/70 dark:bg-white/[0.08] mx-0.5" />
            <BottomIconBtn
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/sign-in");
              }}
              icon={IconLogout}
              title="Sign out"
            />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggleBtn />
            {showBottomCollapse && <CollapseBtn />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar wrapper with floating effect ── */

export const Sidebar = memo(function Sidebar() {
  const { opened, collapsed, minimalChrome } = useAppShell();

  if (minimalChrome) return null;

  return (
    <AppShellNavbar className="sd-navbar">
      {opened && (
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden",
            "m-1.5 rounded-2xl",
          )}
          style={{  
            background: "var(--mantine-color-body)",
            boxShadow: "var(--shadow-sidebar)",
            marginBottom:"60px"
          }}
        >
          <SidebarContent collapsed={collapsed} />
        </div>
      )}
    </AppShellNavbar>
  );
});
