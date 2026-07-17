"use client";

import {
  Group,
  ActionIcon,
  Text,
  useMantineColorScheme,
  useComputedColorScheme,
  Menu,
  Avatar,
  AppShellHeader,
  Tooltip,
} from "@mantine/core";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import {
  IconSun,
  IconMoon,
  IconBrightnessHalf,
  IconBell,
  IconLogout,
  IconSettings,
  IconUser,
  IconMenu2,
  IconTrophy,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { navigation } from "@/core/navigation";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useGamificationProfile } from "@/hooks/use-gamification";
import { cn } from "@/core/utils";

function useBreadcrumb() {
  const pathname = usePathname();
  for (const group of navigation) {
    for (const item of group.items) {
      if (pathname === item.route || pathname.startsWith(item.route + "/")) {
        return { group: group.label, item: item.label };
      }
      if (item.children) {
        const child = item.children.find(
          (c) => pathname === c.route || pathname.startsWith(c.route + "/"),
        );
        if (child) return { group: group.label, item: child.label, parent: item.label };
      }
    }
  }
  return null;
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme, setColorScheme, clearColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();
  const { user, supabase } = useSupabase();
  const router = useRouter();
  const breadcrumb = useBreadcrumb();
  const { toggle } = useAppShell();
  const { data: gamification } = useGamificationProfile();

  const openSpotlight = useCallback(() => {
    document.dispatchEvent(new CustomEvent("opencode-spotlight"));
  }, []);

  return (
    <AppShellHeader>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Toggle sidebar">
            <ActionIcon
              variant="subtle"
              size="md"
              onClick={toggle}
              aria-label="Toggle sidebar"
              className="text-gray-500 dark:text-gray-400"
            >
              <IconMenu2 size={18} />
            </ActionIcon>
          </Tooltip>

          {breadcrumb && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
            >
              <Text size="xs" c="dimmed" className="hidden sm:block">
                {breadcrumb.group}
              </Text>
              {breadcrumb.parent && (
                <>
                  <Text size="xs" c="dimmed" className="hidden sm:block select-none">
                    /
                  </Text>
                  <Text size="xs" c="dimmed" className="hidden sm:block">
                    {breadcrumb.parent}
                  </Text>
                </>
              )}
              <Text size="xs" c="dimmed" className="hidden sm:block select-none">
                /
              </Text>
              <Text size="sm" fw={600} className="text-gray-900 dark:text-white tracking-tight">
                {breadcrumb.item}
              </Text>
            </motion.div>
          )}
        </Group>

        <Group gap={4} wrap="nowrap">
          {/* Search / Command Palette */}
          <Tooltip label="Search (⌘K)">
            <button
              onClick={openSpotlight}
              className="hidden sm:flex items-center gap-2 h-8 rounded-lg border border-gray-200/70 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.03] px-3 text-xs text-gray-400 dark:text-gray-500 transition-all hover:border-gray-300 dark:hover:border-white/[0.15] hover:bg-gray-100/60 dark:hover:bg-white/[0.06] cursor-text active:scale-[0.99]"
            >
              <IconSearch size={14} strokeWidth={1.5} className="flex-shrink-0" />
              <span>Search</span>
              <kbd className="flex-shrink-0 inline-flex items-center gap-px px-1.5 py-0.5 text-[9px] font-medium rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 leading-none">
                <span className="text-[8px]">⌘</span>K
              </kbd>
            </button>
          </Tooltip>

          {/* Gamification Level */}
          {gamification?.levelInfo && (
            <Tooltip label={`${gamification.levelInfo.totalXp.toLocaleString()} XP total`}>
              <Group gap={4} className="cursor-default px-1.5">
                <IconTrophy size={15} className="text-yellow-500" />
                <Text size="sm" fw={700} className="text-yellow-500 leading-none">
                  {gamification.levelInfo.level}
                </Text>
              </Group>
            </Tooltip>
          )}

          {/* Theme Toggle */}
          <Tooltip
            label={
              colorScheme === "light"
                ? "Dark mode"
                : colorScheme === "dark"
                  ? "System mode"
                  : "Light mode"
            }
          >
            <ActionIcon
              variant="subtle"
              size="md"
              onClick={() => {
                if (colorScheme === "light") {
                  setColorScheme("dark");
                } else if (colorScheme === "dark") {
                  clearColorScheme();
                } else {
                  setColorScheme("light");
                }
              }}
              className="text-gray-500 dark:text-gray-400"
            >
              {!mounted ? (
                <IconSun size={18} />
              ) : colorScheme === "dark" ? (
                <IconMoon size={18} />
              ) : colorScheme === "auto" ? (
                <IconBrightnessHalf size={18} />
              ) : (
                <IconSun size={18} />
              )}
            </ActionIcon>
          </Tooltip>

          {/* Notifications */}
          <Tooltip label="Notifications">
            <ActionIcon variant="subtle" size="md" className="text-gray-500 dark:text-gray-400">
              <IconBell size={18} />
            </ActionIcon>
          </Tooltip>

          {/* User Menu */}
          <Menu shadow="xl" width={240} position="bottom-end" offset={6} withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" size="md" className="ml-1">
                <Avatar
                  src={user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? ""}
                  alt={user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User"}
                  size="sm"
                  className="ring-1 ring-white/50 dark:ring-white/10 cursor-pointer"
                >
                  {(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "U").charAt(0).toUpperCase()}
                </Avatar>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <div className="px-3 py-2.5">
                <Text size="sm" fw={600} truncate className="text-gray-900 dark:text-white">
                  {user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User"}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user?.email}
                </Text>
              </div>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => router.push("/profile")}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => router.push("/settings")}
              >
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/sign-in");
                }}
                color="red"
              >
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShellHeader>
  );
}
