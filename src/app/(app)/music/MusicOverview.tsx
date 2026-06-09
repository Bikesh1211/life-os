"use client";

import { SimpleGrid, Card, Text, Group, ThemeIcon } from "@mantine/core";
import { IconBooks, IconRepeat, IconBook, IconChartBar } from "@tabler/icons-react";
import Link from "next/link";

const links = [
  { label: "Library", href: "/music/library", desc: "Your saved music and collections", icon: IconBooks },
  { label: "History", href: "/music/history", desc: "Listening history", icon: IconRepeat },
  { label: "Journal", href: "/music/journal", desc: "Music journal and memories", icon: IconBook },
  { label: "Analytics", href: "/music/analytics", desc: "Listening insights and stats", icon: IconChartBar },
];

export function MusicOverview() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {links.map((link) => (
        <Card key={link.href} component={Link} href={link.href} padding="lg" withBorder>
          <Group>
            <ThemeIcon size="lg" variant="light">
              <link.icon size={20} />
            </ThemeIcon>
            <div>
              <Text fw={500}>{link.label}</Text>
              <Text size="sm" c="dimmed">{link.desc}</Text>
            </div>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
