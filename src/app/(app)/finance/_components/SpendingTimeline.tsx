"use client";

import { Card, Group, SegmentedControl, Stack, Text } from "@mantine/core";
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
    <Card padding="lg" radius="lg" h="100%">
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
          />
        </Group>

        <div style={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-dark-4)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--mantine-color-dark-7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Spent"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--mantine-color-blue-6)"
                fill="url(#spendingGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Card>
  );
}
