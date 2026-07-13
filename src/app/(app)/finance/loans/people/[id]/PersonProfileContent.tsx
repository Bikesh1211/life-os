"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Stack, Group, Text, Card, SimpleGrid, Skeleton, ActionIcon, Badge,
  Avatar, ThemeIcon,
} from "@mantine/core";
import { IconArrowLeft, IconArrowUpRight, IconArrowDownRight, IconCoin } from "@tabler/icons-react";
import dayjs from "dayjs";

interface PersonSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  totalLent: number;
  totalBorrowed: number;
  outstandingBalance: number;
  activeLoans: number;
  closedLoans: number;
  loanCount: number;
}

export function PersonProfileContent() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.id as string;
  const [person, setPerson] = useState<PersonSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/loans/people/${connectionId}`);
        if (res.ok) setPerson(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [connectionId]);

  if (loading) return <Skeleton height={300} radius="lg" />;
  if (!person) return <Text c="dimmed">Person not found</Text>;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n);

  return (
    <Stack gap="lg">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.push("/finance/loans")} radius="xl">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Group>
          <Avatar src={person.profilePictureUrl} size="lg" radius="xl">
            {person.name.charAt(0)}
          </Avatar>
          <div>
            <Text fw={700} size="xl">{person.name}</Text>
            <Text size="sm" c="dimmed">
              {person.phone && `${person.phone}`}
              {person.phone && person.email && " · "}
              {person.email && `${person.email}`}
            </Text>
          </div>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Card withBorder radius="lg" padding="md">
          <Group gap="xs">
            <ThemeIcon size={28} radius="xl" color="red" variant="light">
              <IconArrowUpRight size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Lent</Text>
              <Text fw={700}>{fmt(person.totalLent)}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <Group gap="xs">
            <ThemeIcon size={28} radius="xl" color="blue" variant="light">
              <IconArrowDownRight size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Borrowed</Text>
              <Text fw={700}>{fmt(person.totalBorrowed)}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <Group gap="xs">
            <ThemeIcon size={28} radius="xl" color={person.outstandingBalance >= 0 ? "green" : "orange"} variant="light">
              <IconCoin size={16} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Outstanding</Text>
              <Text fw={700}>{fmt(Math.abs(person.outstandingBalance))}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Loans</Text>
            <Text fw={700}>{person.activeLoans} active / {person.closedLoans} closed</Text>
          </div>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
