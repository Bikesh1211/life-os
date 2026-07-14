"use client";

import { Card, Text, Stack, SimpleGrid, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconTrendingUp, IconCash, IconCoin, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";

export default function LoansAnalytics() {
  const [data, setData] = useState<{
    totalLent: number;
    totalBorrowed: number;
    totalReceived: number;
    totalRepaid: number;
    outstandingToReceive: number;
    outstandingToPay: number;
    largestLoan: number;
    averageLoan: number;
    recoveryRate: number;
    repaymentRate: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/loans/dashboard");
        if (res.ok) {
          const d = await res.json();
          setData({
            ...d,
            totalReceived: d.amountRecoveredThisMonth ?? 0,
            totalRepaid: d.amountRepaidThisMonth ?? 0,
            largestLoan: 0,
            averageLoan: 0,
            recoveryRate: 0,
            repaymentRate: 0,
          });
        }
      } catch { /* ignore */ }
    }
    load();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n);
  const pct = (n: number) => `${Math.round(n)}%`;

  if (!data) {
    return <Skeleton height={300} radius="lg" />;
  }

  return (
    <Stack gap="md">
      <Text fw={600} size="lg">Lending Analytics</Text>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        <StatCard label="Total Lent" value={fmt(data.totalLent)} icon={IconTrendingUp} color="red" />
        <StatCard label="Total Received" value={fmt(data.totalReceived)} icon={IconCash} color="green" />
        <StatCard label="Outstanding" value={fmt(data.outstandingToReceive)} icon={IconCoin} color="orange" />
      </SimpleGrid>

      <Text fw={600} size="lg" mt="md">Borrowing Analytics</Text>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        <StatCard label="Total Borrowed" value={fmt(data.totalBorrowed)} icon={IconTrendingUp} color="blue" />
        <StatCard label="Total Repaid" value={fmt(data.totalRepaid)} icon={IconCash} color="green" />
        <StatCard label="Remaining" value={fmt(data.outstandingToPay)} icon={IconCoin} color="orange" />
      </SimpleGrid>
    </Stack>
  );
}
