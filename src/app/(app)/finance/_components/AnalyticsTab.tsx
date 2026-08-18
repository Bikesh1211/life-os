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
  Table,
  Progress,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconTrendingUp, IconShoppingCart } from "@tabler/icons-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { AnalyticsData } from "@/modules/expenses";
import { apiFetch } from "@/core/api/http";

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#A78BFA", "#F472B6", "#60A5FA", "#F97316", "#34D399", "#FB923C", "#818CF8", "#E879F9", "#9CA3AF"];

export default function AnalyticsTab() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["expenses", "analytics"],
    queryFn: () => apiFetch<AnalyticsData>("/api/expenses/analytics"),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Container size="xl">
        <Text c="dimmed">Loading analytics...</Text>
      </Container>
    );
  }

  if (!data) return null;

  const pieData = data.categoryBreakdown.map((c) => ({
    name: c.categoryName ?? "Uncategorized",
    value: c.total,
    color: c.categoryColor ?? "#9CA3AF",
  }));

  const merchantData = data.topMerchants.map((m) => ({
    name: m.merchant,
    amount: m.total,
    count: m.count,
  }));

  const timelineData = data.timeline.map((d) => ({
    date: d.date,
    amount: Number(d.total),
  }));

  const savingsRate = data.totalIncome > 0
    ? ((data.totalIncome - data.totalSpending) / data.totalIncome) * 100
    : 0;

  return (
    <Container size="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>Analytics</Title>
          <Text c="dimmed" size="sm">
            Deep insights into your spending
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Card padding="lg" radius="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Total Spent
            </Text>
            <Text size="28px" fw={700}>
              ₹{data.totalSpending.toLocaleString()}
            </Text>
          </Card>
          <Card padding="lg" radius="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Total Income
            </Text>
            <Text size="28px" fw={700}>
              ₹{data.totalIncome.toLocaleString()}
            </Text>
          </Card>
          <Card padding="lg" radius="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Savings Rate
            </Text>
            <Text size="28px" fw={700} c={savingsRate > 0 ? "teal" : "red"}>
              {savingsRate.toFixed(1)}%
            </Text>
          </Card>
          <Card padding="lg" radius="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Avg Daily
            </Text>
            <Text size="28px" fw={700}>
              ₹{data.averageDaily.average.toLocaleString()}
            </Text>
          </Card>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Card padding="lg" radius="lg" style={{ overflow: "visible" }}>
            <Text fw={600} mb="md">
              Spending Distribution
            </Text>
            {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
              <Text c="dimmed" ta="center" py={80}>
                No spending data yet
              </Text>
            ) : (
              <div style={{ height: 300, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color ?? COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--mantine-color-dark-7)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                      }}
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card padding="lg" radius="lg" style={{ overflow: "visible" }}>
            <Text fw={600} mb="md">
              Spending Trend
            </Text>
            {timelineData.length === 0 ? (
              <Text c="dimmed" ta="center" py={80}>
                No spending data yet
              </Text>
            ) : (
              <div style={{ height: 300, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-dark-4)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--mantine-color-dark-7)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--mantine-color-blue-6)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Card padding="lg" radius="lg">
            <Group gap="sm" mb="md">
              <ThemeIcon size={32} radius="md" variant="light" color="yellow">
                <IconShoppingCart size={18} />
              </ThemeIcon>
              <Text fw={600}>Top Merchants</Text>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Merchant</Table.Th>
                  <Table.Th>Transactions</Table.Th>
                  <Table.Th>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {merchantData.map((m) => (
                  <Table.Tr key={m.name}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {m.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {m.count}x
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        ₹{m.amount.toLocaleString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

          <Card padding="lg" radius="lg">
            <Group gap="sm" mb="md">
              <ThemeIcon size={32} radius="md" variant="light" color="blue">
                <IconTrendingUp size={18} />
              </ThemeIcon>
              <Text fw={600}>Payment Methods</Text>
            </Group>
            <Stack gap="sm">
              {data.paymentMethods.map((pm) => {
                const pct = data.totalSpending > 0
                  ? (pm.total / data.totalSpending) * 100
                  : 0;
                return (
                  <div key={pm.paymentMethod}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" tt="capitalize">
                        {pm.paymentMethod.replace(/_/g, " ")}
                      </Text>
                      <Text size="sm" fw={600}>
                        ₹{Number(pm.total).toLocaleString()}
                      </Text>
                    </Group>
                    <Progress value={pct} size="sm" radius="xl" />
                    <Text size="xs" c="dimmed">
                      {pm.count} transactions · {pct.toFixed(1)}%
                    </Text>
                  </div>
                );
              })}
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
