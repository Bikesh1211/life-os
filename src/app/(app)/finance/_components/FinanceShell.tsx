"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDashboard,
  IconArrowsLeftRight,
  IconPigMoney,
  IconBuildingBank,
  IconRepeat,
  IconReportAnalytics,
} from "@tabler/icons-react";

const tabs = [
  { value: "/finance/dashboard", label: "Dashboard", icon: IconDashboard },
  { value: "/finance/transactions", label: "Transactions", icon: IconArrowsLeftRight },
  { value: "/finance/budgets", label: "Budgets", icon: IconPigMoney },
  { value: "/finance/accounts", label: "Accounts", icon: IconBuildingBank },
  { value: "/finance/subscriptions", label: "Subscriptions", icon: IconRepeat },
  { value: "/finance/analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname.startsWith(t.value))?.value ?? "/finance/dashboard";

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={(value) => value && router.push(value)}
        styles={{
          tab: {
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 500,
          },
        }}
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
      </Tabs>
      {children}
    </>
  );
}
