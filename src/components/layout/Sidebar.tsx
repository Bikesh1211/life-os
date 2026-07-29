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
  IconLogout,
  IconPlus,
  IconMoon,
  IconSun,
  IconLayoutDashboard,
  IconBook,
  IconChecklist,
  IconRepeat,
  IconTarget,
  IconCoin,
  IconSchool,
  IconTimelineEvent,
  IconLayoutGrid,
  IconUser,
  IconMessagePlus,
} from "@tabler/icons-react";
import { type NavItem } from "@/core/navigation";
import { findNavItemByFeatureId, navigation } from "@/core/navigation";
import { cn } from "@/core/utils";
import { APP_NAME } from "@/core/constants";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import { useMantineColorScheme, useComputedColorScheme, Text, Tooltip, Avatar } from "@mantine/core";

const NAV_ICON_SIZE = 18;
const SIDEBAR_COLLAPSED_W = 64;

const PRIMARY_FEATURE_IDS = [
  "dashboard",
  "journal",
  "tasks",
  "habits",
  "goals",
  "finance",
  "knowledge",
  "timeline",
] as const;

const SECONDARY_LINKS = [
  { key: "browse", label: "Browse all pages", icon: IconLayoutGrid, route: "/pages" },
  { key: "search", label: "Search", icon: IconSearch, action: "search" as const },
] as const;

const ACCOUNT_LINKS = [
  { key: "profile", label: "Profile", icon: IconUser, route: "/profile" },
  { key: "settings", label: "Settings", icon: IconSettings, route: "/settings" },
  { key: "feedback", label: "Feedback", icon: IconMessagePlus, route: "/feedback" },
] as const;

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

/* ── Brand ── */

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 h-12 w-full px-4 flex-shrink-0 border-b border-gray-100/80 dark:border-white/[0.06] transition-colors group"
      title="Go to dashboard"
    >
      <div className="sd-brand-logo flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-500/20 dark:shadow-blue-500/10 ring-1 ring-white/10 dark:ring-white/5">
        {APP_NAME.charAt(0)}
      </div>
      <Text fw={600} size="sm" className="tracking-tight">
        {APP_NAME}
      </Text>
    </Link>
  );
}

/* ── Primary Nav Item ── */

function PrimaryNavItem({
  item,
  collapsed = false,
}: {
  item: NavItem;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { closeMobile } = useAppShell();
  const Icon = item.icon;

  const isActive =
    item.route === "/"
      ? pathname === "/"
      : pathname === item.route || pathname.startsWith(item.route + "/");

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
    <Link
      href={item.route}
      onClick={closeMobile}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-150 mx-1.5",
        "text-sm",
        isActive
          ? "sd-nav-active font-semibold text-blue-700 dark:text-blue-300"
          : "font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center",
          isActive ? "sd-nav-active-icon" : "text-gray-400 dark:text-gray-500",
        )}
      >
        <Icon size={NAV_ICON_SIZE} strokeWidth={isActive ? 2.5 : 1.75} />
      </div>
      <span className="truncate leading-snug">{item.label}</span>
    </Link>
  );
}

/* ── Bottom Action Row (collapsed / expanded variants) ── */

function ActionRow({
  icon: Icon,
  label,
  onClick,
  collapsed = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <Tooltip label={label} position="right">
        <button
          onClick={onClick}
          className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
        >
          <Icon size={16} strokeWidth={1.5} />
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
    >
      <Icon size={16} strokeWidth={1.5} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
      <span>{label}</span>
    </button>
  );
}

/* ── Navigation link (for secondary/account items) ── */

function SidebarLink({
  href,
  icon: Icon,
  label,
  collapsed = false,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { closeMobile } = useAppShell();
  const isActive = pathname === href;

  if (collapsed) {
    return (
      <Tooltip label={label} position="right">
        <Link
          href={href}
          onClick={closeMobile}
          className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
        >
          <Icon size={16} strokeWidth={1.5} />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      onClick={closeMobile}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mx-1.5",
        isActive
          ? "sd-nav-active font-semibold text-blue-700 dark:text-blue-300"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200",
      )}
    >
      <Icon
        size={16}
        strokeWidth={isActive ? 2.5 : 1.75}
        className={cn(
          "flex-shrink-0",
          isActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500",
        )}
      />
      <span>{label}</span>
    </Link>
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
  const { user } = useSupabase();
  const { closeMobile } = useAppShell();
  const openSpotlight = useCallback(() => {
    closeMobile();
    document.dispatchEvent(new CustomEvent("opencode-spotlight"));
  }, [closeMobile]);

  const primaryItems = PRIMARY_FEATURE_IDS.map(
    (id) => findNavItemByFeatureId(id),
  ).filter((item): item is NavItem => item !== undefined);

  if (collapsed) {
    return (
      <div className="flex h-full flex-col sd-content">
        {/* Brand mini */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <Link href="/" title="Go to dashboard">
            <div className="sd-brand-logo flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-500/20 dark:shadow-blue-500/10 ring-1 ring-white/10 dark:ring-white/5">
              {APP_NAME.charAt(0)}
            </div>
          </Link>
        </div>

        {/* Primary nav items (icons only) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 pb-2 space-y-0.5">
          {primaryItems.map((item) => (
            <PrimaryNavItem key={item.featureId} item={item} collapsed />
          ))}
        </div>

        {/* Bottom actions */}
        <div className="border-t border-gray-100/80 dark:border-white/[0.06] px-3 py-2 flex flex-col items-center gap-1">
          <ThemeToggleBtn />
          <ActionRow icon={IconSearch} label="Search" onClick={openSpotlight} collapsed />
          {showBottomCollapse && <CollapseBtn />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col sd-content">
      {/* Brand header */}
      {showBrand && <Brand />}

      {/* Primary navigation */}
      <div className="pt-2 pb-1 space-y-0.5">
        {primaryItems.map((item) => (
          <PrimaryNavItem key={item.featureId} item={item} />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent mx-4 my-2" />

      {/* Secondary links */}
      <div className="space-y-0.5">
        <Link
          href="/pages"
          onClick={closeMobile}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium mx-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <IconLayoutGrid size={16} strokeWidth={1.75} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
          <span>Browse all pages</span>
        </Link>
        <button
          onClick={openSpotlight}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium mx-1.5 w-full text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <IconSearch size={16} strokeWidth={1.75} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
          <span>Search</span>
          <kbd className="ml-auto flex-shrink-0 inline-flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 leading-none">
            <span className="text-[8px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-white/[0.06] to-transparent mx-4 my-2" />

      {/* Account section header */}
      <div className="px-4 pb-1">
        <span className="sd-group-label">Account</span>
      </div>

      {/* Account links */}
      <div className="space-y-0.5 pb-1">
        <SidebarLink href="/profile" icon={IconUser} label="Profile" />
        <SidebarLink href="/settings" icon={IconSettings} label="Settings" />
        <SidebarLink href="/feedback" icon={IconMessagePlus} label="Feedback" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: avatar + email + sign out */}
      <div className="border-t border-gray-100/80 dark:border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar
            src={user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? ""}
            alt={user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User"}
            size="sm"
            radius="xl"
            className="ring-2 ring-white/20 dark:ring-white/10 flex-shrink-0"
          >
            {(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "U").charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0 flex-1">
            {user?.email && (
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/sign-in");
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <IconLogout size={14} strokeWidth={1.5} />
            <span>Sign out</span>
          </button>
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
            marginBottom: "60px",
          }}
        >
          <SidebarContent collapsed={collapsed} />
        </div>
      )}
    </AppShellNavbar>
  );
});
