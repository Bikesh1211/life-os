"use client";

import { Container, Grid, Group, Stack, Text, Title, Button, Skeleton } from "@mantine/core";
import { IconPlus, IconCoin, IconTrendingUp, IconWallet, IconReceipt } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import { MetricCard } from "./_components/MetricCard";
import { SpendingTimeline } from "./_components/SpendingTimeline";
import { CategoryBreakdown } from "./_components/CategoryBreakdown";
import { QuickAddModal } from "./_components/QuickAddModal";

type OverviewData = {
  summary: {
    monthlySpending: number;
    monthlyIncome: number;
    savingsRate: number;
    averageDailySpend: number;
    transactionCount: number;
  };
  categoryBreakdown: {
    categoryId: string | null;
    categoryName: string | null;
    categoryColor: string | null;
    categoryIcon: string | null;
    total: number;
    count: number;
  }[];
  timeline: { date: string; total: number; count: number }[];
  topMerchants: { merchant: string; total: number; count: number }[];
  categories: { id: string; name: string; icon: string | null }[];
};

export default function FinanceOverviewPage() {
  const [quickAddOpened, setQuickAddOpened] = useState(false);

  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ["expenses", "overview"],
    queryFn: () => fetch("/api/expenses/overview").then((r) => r.json()),
  });

  const accountsQuery = useQuery({
    queryKey: ["expenses", "accounts"],
    queryFn: () => fetch("/api/expenses/accounts").then((r) => r.json()),
  });

  const recentMerchants = data?.topMerchants.map((m) => m.merchant) ?? [];

  const categoryOptions = (data?.categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const accountOptions = (accountsQuery.data ?? []).map((a: { id: string; name: string }) => ({
    value: a.id,
    label: a.name,
  }));

  if (isLoading) {
    return (
      <Container size="xl">
        <Stack gap="md">
          <Skeleton height={40} width={300} />
          <Grid>
            {[1, 2, 3, 4].map((i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                <Skeleton height={140} radius="lg" />
              </Grid.Col>
            ))}
          </Grid>
          <Skeleton height={320} radius="lg" />
          <Skeleton height={400} radius="lg" />
        </Stack>
      </Container>
    );
  }

  const s = data!.summary;
  const timeline = data!.timeline.map((d) => ({ date: d.date, total: Number(d.total) }));
  const categoryData = data!.categoryBreakdown.map((c) => ({
    ...c,
    total: Number(c.total),
  }));

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Finance Overview</Title>
            <Text c="dimmed" size="sm">
              {dayjs().format("MMMM YYYY")}
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setQuickAddOpened(true)}
            radius="xl"
            size="md"
          >
            Add Expense
          </Button>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Monthly Spending"
              value={`₹${s.monthlySpending.toLocaleString()}`}
              subtitle={`${s.transactionCount} transactions`}
              icon={IconCoin}
              color="red"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Monthly Income"
              value={`₹${s.monthlyIncome.toLocaleString()}`}
              icon={IconTrendingUp}
              color="green"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Savings Rate"
              value={`${s.savingsRate.toFixed(1)}%`}
              subtitle="of income saved"
              icon={IconWallet}
              color="blue"
              trend={{
                value: s.savingsRate > 20 ? "On track" : "Needs improvement",
                positive: s.savingsRate > 20,
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Avg Daily Spend"
              value={`₹${s.averageDailySpend.toLocaleString()}`}
              icon={IconReceipt}
              color="violet"
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <SpendingTimeline data={timeline} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <CategoryBreakdown data={categoryData} totalSpending={s.monthlySpending} />
          </Grid.Col>
        </Grid>
      </Stack>

      <QuickAddModal
        opened={quickAddOpened}
        onClose={() => setQuickAddOpened(false)}
        categories={categoryOptions}
        accounts={accountOptions}
      />
    </Container>
  );
}
