"use client";

import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconRepeat, IconCoin } from "@tabler/icons-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

type RecurringTransaction = {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  transactionDate: string;
  recurrence: string;
  categoryId: string | null;
  paymentMethod: string | null;
};

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useQuery<RecurringTransaction[]>({
    queryKey: ["expenses", "subscriptions"],
    queryFn: () => fetch("/api/expenses/subscriptions").then((r) => r.json()),
  });

  const totalMonthly = (subscriptions ?? [])
    .reduce((sum, s) => {
      const amount = Number(s.amount);
      if (s.recurrence === "monthly") return sum + amount;
      if (s.recurrence === "yearly") return sum + amount / 12;
      if (s.recurrence === "weekly") return sum + amount * 4.33;
      return sum + amount;
    }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Subscriptions</Title>
            <Text c="dimmed" size="sm">
              {subscriptions?.length ?? 0} active · ₹
              {totalMonthly.toLocaleString()}/mo · ₹
              {totalYearly.toLocaleString()}/yr
            </Text>
          </div>
        </Group>

        {isLoading ? (
          <Text c="dimmed">Loading subscriptions...</Text>
        ) : !subscriptions?.length ? (
          <Card padding="xl" radius="lg" ta="center">
            <ThemeIcon size={60} radius="xl" mx="auto" mb="md">
              <IconRepeat size={30} />
            </ThemeIcon>
            <Text fw={500}>No subscriptions yet</Text>
            <Text size="sm" c="dimmed">
              Mark transactions as recurring to see them here.
            </Text>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {subscriptions.map((sub, index) => {
              const nextDate = dayjs(sub.transactionDate).add(1, sub.recurrence as dayjs.ManipulateType);
              const daysUntilNext = nextDate.diff(dayjs(), "day");

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card padding="lg" radius="lg">
                    <Group justify="space-between" mb="xs">
                      <Group gap="sm">
                        <ThemeIcon size={40} radius="md" variant="light">
                          <IconRepeat size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={600}>{sub.merchant ?? "Unknown"}</Text>
                          <Text size="xs" c="dimmed">
                            {sub.description ?? sub.recurrence}
                          </Text>
                        </div>
                      </Group>
                      <Badge
                        size="sm"
                        color={daysUntilNext <= 3 ? "red" : daysUntilNext <= 7 ? "yellow" : "green"}
                      >
                        {daysUntilNext <= 0
                          ? "Due today"
                          : `${daysUntilNext}d`}
                      </Badge>
                    </Group>

                    <Group justify="space-between">
                      <div>
                        <Text size="22px" fw={700}>
                          ₹{Number(sub.amount).toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed" tt="capitalize">
                          {sub.recurrence}
                        </Text>
                      </div>
                      <Text size="xs" c="dimmed">
                        Next: {nextDate.format("MMM D, YYYY")}
                      </Text>
                    </Group>
                  </Card>
                </motion.div>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
