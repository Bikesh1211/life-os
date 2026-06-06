"use client";

import {
  Group,
  ActionIcon,
  useMantineColorScheme,
  Text,
  Menu,
  Avatar,
  AppShellHeader,
  Tooltip,
} from "@mantine/core";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  IconSun,
  IconMoon,
  IconBell,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppShell } from "@/app/(app)/AppShellProvider";

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { opened, toggle } = useAppShell();

  return (
    <AppShellHeader>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="xs">
          <ActionIcon variant="subtle" size="lg" onClick={toggle}>
            {opened ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </ActionIcon>
          <Text fw={700} size="lg">
            Life OS
          </Text>
        </Group>

        <Group gap="xs">
          <Tooltip label="Notifications">
            <ActionIcon variant="subtle" size="lg">
              <IconBell size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={colorScheme === "dark" ? "Light mode" : "Dark mode"}>
            <ActionIcon variant="subtle" size="lg" onClick={() => toggleColorScheme()}>
              {!mounted ? <IconSun size={20} /> : colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Tooltip>

          <Menu shadow="md" width={200}>
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
              <Menu.Item leftSection={<IconUserCircle size={16} />}>
                <Text size="sm">{user?.fullName}</Text>
                <Text size="xs" c="dimmed">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </Menu.Item>
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
