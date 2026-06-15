"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  type PieLabelRenderProps,
} from "recharts";
import { Paper, Text, Group, SegmentedControl } from "@mantine/core";
import { useState } from "react";
import type { CompletionTrendsData, DashboardData } from "@/hooks/use-habit-analytics";

const CATEGORY_COLORS: Record<string, string> = {
  health: "#ef4444",
  fitness: "#f97316",
  reading: "#eab308",
  learning: "#22c55e",
  productivity: "#3b82f6",
  mindfulness: "#8b5cf6",
  finance: "#ec4899",
  social: "#14b8a6",
  creative: "#6366f1",
  uncategorized: "#6b7280",
};

type TrendChartProps = {
  dailyTrend: DashboardData["dailyTrend"];
  habitPerformance?: CompletionTrendsData["habitPerformance"];
  categoryDistribution?: DashboardData["categoryDistribution"];
};

export function HabitTrendChart({ dailyTrend, habitPerformance, categoryDistribution }: TrendChartProps) {
  const [view, setView] = useState("completions");

  return (
    <Paper withBorder p="md" radius="md">
      <Group mb="sm" justify="space-between">
        <Text fw={600} size="sm">Completion Trends</Text>
        <SegmentedControl
          value={view}
          onChange={setView}
          data={[
            { value: "completions", label: "Daily" },
            { value: "performance", label: "Performance" },
            { value: "categories", label: "Categories" },
          ]}
          size="xs"
        />
      </Group>

      {view === "completions" && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2f33" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#5c5f66", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
              stroke="#2e2f33"
            />
            <YAxis tick={{ fill: "#5c5f66", fontSize: 11 }} stroke="#2e2f33" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#1a1b1e",
                border: "1px solid #2e2f33",
                borderRadius: 8,
                color: "#c1c2c5",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {view === "performance" && habitPerformance && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={habitPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2f33" />
            <XAxis
              type="number"
              tick={{ fill: "#5c5f66", fontSize: 11 }}
              domain={[0, 100]}
              stroke="#2e2f33"
            />
            <YAxis
              dataKey="title"
              type="category"
              tick={{ fill: "#5c5f66", fontSize: 11 }}
              width={120}
              stroke="#2e2f33"
            />
            <Tooltip
              contentStyle={{
                background: "#1a1b1e",
                border: "1px solid #2e2f33",
                borderRadius: 8,
                color: "#c1c2c5",
              }}
              formatter={(value) => [`${value}%`, "Completion Rate"]}
            />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {habitPerformance.map((entry, i) => (
                <Cell
                  key={entry.habitId}
                  fill={CATEGORY_COLORS[entry.category ?? "uncategorized"] ?? "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "categories" && categoryDistribution && (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="completed"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ payload, percent }: PieLabelRenderProps) =>
                `${payload?.category ?? "Other"} ${(Number(percent) * 100).toFixed(0)}%`
              }
            >
              {categoryDistribution.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category] ?? "#6b7280"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1b1e",
                border: "1px solid #2e2f33",
                borderRadius: 8,
                color: "#c1c2c5",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
