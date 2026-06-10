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
import { useUser, useClerk } from "@clerk/nextjs";
import {
  IconSun,
  IconMoon,
  IconBrightnessHalf,
  IconBell,
  IconLogout,
  IconSettings,
  IconMenu2,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { navigation } from "@/core/navigation";
import { useAppShell } from "@/app/(app)/AppShellProvider";

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
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const breadcrumb = useBreadcrumb();
  const { opened, toggle, minimalChrome } = useAppShell();

  if (minimalChrome) return null;

  return (
    <AppShellHeader>
      <Group h="100%" px="md" justify="space-between">
        <Group gap={4}>
          <ActionIcon variant="subtle" size="lg" onClick={toggle} aria-label="Toggle sidebar" className="hidden sm:inline-flex">
            <IconMenu2 size={20} />
          </ActionIcon>
          {/* <Link href="/dashboard" className="no-underline">
            <Text size="sm" fw={700} className="text-gray-900 dark:text-white">
              Focus Linq
            </Text>
          </Link> */}
          {breadcrumb && (
            <>
              {/* <Text size="sm" c="dimmed" className="mx-1 select-none">
                /
              </Text> */}
              <Text size="sm" c="dimmed" visibleFrom="sm">
                {breadcrumb.group}
              </Text>
              {breadcrumb.parent && (
                <>
                  <Text size="sm" c="dimmed" visibleFrom="sm" className="mx-0.5 select-none">
                    ·
                  </Text>
                  <Text size="sm" c="dimmed" visibleFrom="sm">
                    {breadcrumb.parent}
                  </Text>
                </>
              )}
              <Text size="sm" fw={600}>
                {breadcrumb.item}
              </Text>
            </>
          )}
        </Group>

        <Group gap="xs">
          <Tooltip label="Notifications">
            <ActionIcon variant="subtle" size="lg">
              <IconBell size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={colorScheme === "light" ? "Dark mode" : colorScheme === "dark" ? "System mode" : "Light mode"}>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => {
                if (colorScheme === "light") {
                  setColorScheme("dark");
                } else if (colorScheme === "dark") {
                  clearColorScheme();
                } else {
                  setColorScheme("light");
                }
              }}
            >
              {!mounted ? (
                <IconSun size={20} />
              ) : colorScheme === "dark" ? (
                <IconMoon size={20} />
              ) : colorScheme === "auto" ? (
                <IconBrightnessHalf size={20} />
              ) : (
                <IconSun size={20} />
              )}
            </ActionIcon>
          </Tooltip>

          <Menu shadow="md" width={220} position="bottom-end" offset={6} withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg">
                <Avatar
                  src={user?.imageUrl}
                  alt={user?.fullName ?? "User"}
                  size="sm"
                  style={{ cursor: "pointer" }}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <div className="px-3 py-2">
                <Text size="sm" fw={600} truncate>
                  {user?.fullName}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </div>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => router.push("/settings")}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
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
