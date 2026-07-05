"use client";

import { Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PremiumCard } from "@/components/ui/card";

type SpendingTimelineProps = {
  data: { date: string; total: number }[];
};

export function SpendingTimeline({ data }: SpendingTimelineProps) {
  const [range, setRange] = useState("30");

  const ranges = [
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
    { value: "365", label: "1 Year" },
  ];

  const filteredData = data.slice(-Number(range));

  return (
    <PremiumCard className="h-full">
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Spending Timeline
          </Text>
          <SegmentedControl
            value={range}
            onChange={setRange}
            data={ranges}
            size="xs"
            radius="lg"
          />
        </Group>

        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mantine-color-blue-5)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--mantine-color-blue-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--mantine-color-body)",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Spending"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--mantine-color-blue-5)"
                strokeWidth={2}
                fill="url(#spendingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </PremiumCard>
  );
}
