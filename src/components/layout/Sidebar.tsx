"use client";

import { useState } from "react";
import {
  AppShellNavbar,
  AppShellSection,
  ScrollArea,
  NavLink,
  Group,
  Text,
  UnstyledButton,
  Collapse,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { navigation, type NavItem } from "@/core/navigation";
import { cn } from "@/core/utils";

function NavItemLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure(
    item.children?.some((c) => pathname.startsWith(c.route)) ?? false,
  );
  const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
  const hasChildren = item.children && item.children.length > 0;

  if (item.featureId === "logout") {
    return (
      <NavLink
        label={item.label}
        description={item.description}
        leftSection={
          <ThemeIcon variant="light" size="sm" color="red">
            <item.icon size={16} />
          </ThemeIcon>
        }
        onClick={() => {}}
        style={{ borderRadius: "var(--mantine-radius-md)" }}
      />
    );
  }

  const content = (
    <NavLink
      label={item.label}
      description={item.description}
      leftSection={
        <ThemeIcon variant={isActive ? "filled" : "light"} size="sm" color={isActive ? "blue" : "gray"}>
          <item.icon size={16} />
        </ThemeIcon>
      }
      rightSection={
        hasChildren ? (
          <IconChevronRight
            size={14}
            className={cn("transition-transform", opened && "rotate-90")}
          />
        ) : undefined
      }
      onClick={hasChildren ? toggle : undefined}
      active={isActive}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
      component={hasChildren ? undefined : Link}
      href={hasChildren ? "#" : item.route}
      mod={{ active: isActive }}
    />
  );

  return (
    <>
      {content}
      {hasChildren && (
        <Collapse in={opened}>
          <Box pl="md">
            {item.children!.map((child) => (
              <NavItemLink key={child.featureId} item={child} depth={depth + 1} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
}

export function Sidebar() {
  const [search, setSearch] = useState("");

  const filtered = navigation.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <AppShellNavbar p="md">
      <AppShellSection>
        <Group mb="md" px="xs">
          <Text fw={700} size="lg">
            Life OS
          </Text>
        </Group>
        <UnstyledButton
          onClick={() => {}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--mantine-color-default-hover)",
            width: "100%",
            marginBottom: "8px",
          }}
        >
          <IconSearch size={16} />
          <Text size="sm" c="dimmed">
            Search...
          </Text>
        </UnstyledButton>
      </AppShellSection>

      <AppShellSection grow component={ScrollArea}>
        {filtered.map((group) => (
          <Box key={group.label} mb="md">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs" px="xs">
              {group.label}
            </Text>
            {group.items.map((item) => (
              <NavItemLink key={item.featureId} item={item} />
            ))}
          </Box>
        ))}
      </AppShellSection>
    </AppShellNavbar>
  );
}
