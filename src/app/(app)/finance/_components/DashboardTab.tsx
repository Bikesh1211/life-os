"use client";

import { Grid, Group, Stack, Text, SimpleGrid, Button } from "@mantine/core";
import { IconPlus, IconCoin, IconTrendingUp, IconWallet, IconReceipt } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { MetricCard } from "./MetricCard";
import { SpendingTimeline } from "./SpendingTimeline";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { QuickAddModal } from "./QuickAddModal";

import { StatGridSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton";
import type { OverviewData, Account } from "@/modules/expenses";
import { apiFetch } from "@/core/api/http";

export default function DashboardTab() {
  const [quickAddOpened, setQuickAddOpened] = useState(false);

  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ["expenses", "overview"],
    queryFn: () => apiFetch<OverviewData>("/api/expenses/overview"),
    staleTime: 5 * 60 * 1000,
  });

  const accountsQuery = useQuery({
    queryKey: ["expenses", "accounts"],
    queryFn: () => apiFetch<Account[]>("/api/expenses/accounts"),
    staleTime: 5 * 60 * 1000,
  });

  const categoryOptions = (data?.categories ?? []).map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  const accountOptions = (accountsQuery.data ?? []).map((a: { id: string; name: string }) => ({
    value: a.id,
    label: a.name,
  }));

  if (isLoading) {
    return (
      <Stack gap="lg">
        <StatGridSkeleton count={4} />
        <ChartSkeleton height={300} />
        <ChartSkeleton height={350} />
      </Stack>
    );
  }

  const s = data!.summary;
  const timeline = data!.timeline.map((d: any) => ({ date: d.date, total: Number(d.total) }));
  const categoryData = data!.categoryBreakdown.map((c: any) => ({
    ...c,
    total: Number(c.total),
  }));

  const metrics = [
    { label: "Monthly Spending", value: `₹${Number(s.monthlySpending).toLocaleString()}`, subtitle: "This month", icon: IconCoin, color: "red" },
    { label: "Monthly Income", value: `₹${Number(s.monthlyIncome).toLocaleString()}`, subtitle: "This month", icon: IconTrendingUp, color: "green" },
    { label: "Savings Rate", value: `${Math.round(s.savingsRate)}%`, subtitle: "This month", icon: IconWallet, color: "blue" },
    { label: "Transactions", value: String(s.transactionCount), subtitle: "This month", icon: IconReceipt, color: "violet" },
  ];

  return (
    <Stack gap="lg">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Group justify="space-between" mb="sm">
          <div>
            <Text fw={700} className="text-xl tracking-tight">
              Overview
            </Text>
            <Text c="dimmed" size="sm">
              {dayjs().format("MMMM YYYY")}
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setQuickAddOpened(true)}
            radius="xl"
          >
            Add Transaction
          </Button>
        </Group>
      </motion.div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <MetricCard
              label={m.label}
              value={m.value}
              subtitle={m.subtitle}
              icon={m.icon}
              color={m.color}
            />
          </motion.div>
        ))}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SpendingTimeline data={timeline} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <CategoryBreakdown data={categoryData} totalSpending={s.monthlySpending} />
        </Grid.Col>
      </Grid>

      <QuickAddModal
        opened={quickAddOpened}
        onClose={() => setQuickAddOpened(false)}
        categories={categoryOptions}
        accounts={accountOptions}
      />
    </Stack>
  );
}
