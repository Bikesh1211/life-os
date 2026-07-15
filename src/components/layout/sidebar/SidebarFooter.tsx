"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import { useMantineColorScheme, useComputedColorScheme, Avatar, Text, Tooltip } from "@mantine/core";
import { IconSettings, IconLogout, IconSun, IconMoon, IconArrowBarToRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useAppShell } from "@/app/(app)/AppShellProvider";

function UserProfile({ collapsed }: { collapsed: boolean }) {
  const { user } = useSupabase();
  const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User";
  const email = user?.email ?? "";
  const avatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "";

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 pt-2 pb-1">
        <Tooltip label={name} position="right">
          <Avatar
            src={avatar}
            alt={name}
            size="sm"
            radius="xl"
            className="ring-2 ring-white/20 dark:ring-white/10 cursor-default"
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 pt-2 pb-1.5">
      <Avatar
        src={avatar}
        alt={name}
        size="sm"
        radius="xl"
        className="ring-2 ring-white/50 dark:ring-white/10 flex-shrink-0 cursor-default"
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex-1 min-w-0">
        <Text size="sm" fw={600} truncate className="text-gray-900 dark:text-white leading-tight">
          {name}
        </Text>
        <Text size="xs" c="dimmed" truncate className="leading-tight">
          {email}
        </Text>
      </div>
    </div>
  );
}

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
          computed === "dark" ? (
            <IconSun size={14} strokeWidth={1.5} />
          ) : (
            <IconMoon size={14} strokeWidth={1.5} />
          )
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
}

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

type SidebarFooterProps = {
  collapsed?: boolean;
  showCollapse?: boolean;
};

export function SidebarFooter({ collapsed = false, showCollapse = true }: SidebarFooterProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

  return (
    <div className="border-t border-gray-100/80 dark:border-white/[0.06]">
      <UserProfile collapsed={collapsed} />
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-1">
          <Tooltip label="Settings" position="right">
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95"
            >
              <IconSettings size={14} strokeWidth={1.5} />
            </button>
          </Tooltip>
          <Tooltip label="Sign out" position="right">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/sign-in");
              }}
              className="flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95"
            >
              <IconLogout size={14} strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggleBtn />
          {showCollapse && <CollapseBtn />}
        </div>
      </div>
    </div>
  );
}
