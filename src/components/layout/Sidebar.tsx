"use client";

import {
  AppShellNavbar,
  AppShellSection,
  ScrollArea,
  NavLink,
  Group,
  Text,
  Collapse,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
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

  const content = hasChildren ? (
    <NavLink
      label={item.label}
      leftSection={
        <ThemeIcon variant={isActive ? "filled" : "light"} size="sm" color={isActive ? "blue" : "gray"}>
          <item.icon size={16} />
        </ThemeIcon>
      }
      rightSection={
        <IconChevronRight
          size={14}
          className={cn("transition-transform", opened && "rotate-90")}
        />
      }
      onClick={toggle}
      active={isActive}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
      mod={{ active: isActive }}
    />
  ) : (
    <NavLink
      label={item.label}
      leftSection={
        <ThemeIcon variant={isActive ? "filled" : "light"} size="sm" color={isActive ? "blue" : "gray"}>
          <item.icon size={16} />
        </ThemeIcon>
      }
      onClick={toggle}
      active={isActive}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
      component={Link}
      href={item.route}
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
  return (
    <AppShellNavbar p="md">
      <AppShellSection grow component={ScrollArea}>
        {navigation.map((group) => (
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
