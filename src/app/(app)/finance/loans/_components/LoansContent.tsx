"use client";

import { useCallback, lazy, Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, Stack, SimpleGrid, Group, Text, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCoin,
  IconCash,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBriefcase,
  IconCircleCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconPlus,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { StatCard } from "@/components/ui/stat-card";

const LoansList = lazy(() => import("./LoansList"));
const LoansAnalytics = lazy(() => import("./LoansAnalytics"));
const LoansReports = lazy(() => import("./LoansReports"));
const CreateLoanModal = lazy(() => import("./CreateLoanModal"));

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconTrendingUp },
  { value: "list", label: "All Loans", icon: IconBriefcase },
  { value: "analytics", label: "Analytics", icon: IconTrendingUp },
  { value: "reports", label: "Reports", icon: IconCoin },
];

function TabFallback() {
  return <CardGridSkeleton count={2} height={200} />;
}

export function LoansContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "dashboard";
  const [opened, { open, close }] = useDisclosure(false);

  const [dashboardData, setDashboardData] = useState<{
    totalLent: number;
    totalBorrowed: number;
    outstandingToReceive: number;
    outstandingToPay: number;
    activeLoans: number;
    closedLoans: number;
    overdueLoans: number;
    amountRecoveredThisMonth: number;
    amountRepaidThisMonth: number;
    netBalance: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/loans/dashboard");
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch { /* ignore */ }
    }
    load();
  }, []);

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "dashboard") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      router.replace(`/finance/loans${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <PageHeader title="Loans" subtitle="Track money lent and borrowed" />
        <Button leftSection={<IconPlus size={18} />} onClick={open} radius="lg">
          New Loan
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
        <StatCard
          label="Total Lent"
          value={fmt(dashboardData?.totalLent ?? 0)}
          icon={IconArrowUpRight}
          color="red"
          delay={0}
        />
        <StatCard
          label="Total Borrowed"
          value={fmt(dashboardData?.totalBorrowed ?? 0)}
          icon={IconArrowDownRight}
          color="blue"
          delay={1}
        />
        <StatCard
          label="Outstanding to Receive"
          value={fmt(dashboardData?.outstandingToReceive ?? 0)}
          icon={IconCash}
          color="green"
          delay={2}
        />
        <StatCard
          label="Outstanding to Pay"
          value={fmt(dashboardData?.outstandingToPay ?? 0)}
          icon={IconCash}
          color="orange"
          delay={3}
        />
        <StatCard
          label="Active Loans"
          value={dashboardData?.activeLoans ?? 0}
          icon={IconBriefcase}
          color="blue"
          delay={4}
        />
        <StatCard
          label="Closed Loans"
          value={dashboardData?.closedLoans ?? 0}
          icon={IconCircleCheck}
          color="green"
          delay={5}
        />
        <StatCard
          label="Overdue"
          value={dashboardData?.overdueLoans ?? 0}
          icon={IconAlertTriangle}
          color="red"
          delay={6}
        />
        <StatCard
          label="Net Balance"
          value={fmt(dashboardData?.netBalance ?? 0)}
          icon={IconCoin}
          color={dashboardData && dashboardData.netBalance >= 0 ? "green" : "red"}
          delay={7}
        />
      </SimpleGrid>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        keepMounted={false}
        variant="pills"
        radius="lg"
      >
        <Tabs.List mb="lg">
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              leftSection={<tab.icon size={18} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="dashboard">
          <Suspense fallback={<TabFallback />}>
            <Text c="dimmed" mb="md">Select "All Loans" to view and manage loans, or create a new loan.</Text>
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="list">
          <Suspense fallback={<TabFallback />}>
            <LoansList />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="analytics">
          <Suspense fallback={<TabFallback />}>
            <LoansAnalytics />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="reports">
          <Suspense fallback={<TabFallback />}>
            <LoansReports />
          </Suspense>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={close}
        title="Create New Loan"
        size="lg"
        radius="lg"
      >
        <Suspense fallback={<CardGridSkeleton count={1} height={300} />}>
          <CreateLoanModal onClose={close} />
        </Suspense>
      </Modal>
    </Stack>
  );
}
