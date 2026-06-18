"use client";

import { Stack, Group, Text, Paper, SimpleGrid, Anchor, ActionIcon } from "@mantine/core";
import { IconArrowLeft, IconFlame, IconApple } from "@tabler/icons-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { NutritionSummary } from "@/modules/health";

const MACRO_COLORS = { protein: "#22c55e", carbs: "#f97316", fat: "#ef4444" };

export function NutritionContent({ summary }: { summary: NutritionSummary }) {
  const pieData = [
    { name: "Protein", value: Math.max(summary.macroBreakdown.protein, 1), color: MACRO_COLORS.protein },
    { name: "Carbs", value: Math.max(summary.macroBreakdown.carbs, 1), color: MACRO_COLORS.carbs },
    { name: "Fat", value: Math.max(summary.macroBreakdown.fat, 1), color: MACRO_COLORS.fat },
  ];

  return (
    <Stack gap="md" p="lg">
      <Group>
        <Anchor component={Link} href="/health">
          <ActionIcon variant="subtle"><IconArrowLeft size={18} /></ActionIcon>
        </Anchor>
        <IconApple size={24} />
        <Text size="xl" fw={700}>Nutrition</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.todayCalories > 0 ? summary.todayCalories : "—"}</Text>
          <Text size="xs" c="dimmed">Today (cal)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.avgDailyCalories > 0 ? summary.avgDailyCalories : "—"}</Text>
          <Text size="xs" c="dimmed">Daily Avg (cal)</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.dailyCalories.length}</Text>
          <Text size="xs" c="dimmed">Days Tracked</Text>
        </Paper>
        <Paper withBorder p="md" className="text-center">
          <Text size="2rem" fw={700}>{summary.macroBreakdown.protein}g</Text>
          <Text size="xs" c="dimmed">Avg Protein</Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Calorie trend */}
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Daily Calorie Intake</Text>
          {summary.dailyCalories.length === 0 ? (
            <Text size="xs" c="dimmed">No data yet.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.dailyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ReTooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Macro breakdown */}
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Macro Distribution (Daily Avg)</Text>
          {summary.macroBreakdown.protein === 0 && summary.macroBreakdown.carbs === 0 && summary.macroBreakdown.fat === 0 ? (
            <Text size="xs" c="dimmed">No data yet.</Text>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
              <SimpleGrid cols={3} spacing="xs" mt="sm">
                <div className="text-center">
                  <Text size="sm" fw={600} c={MACRO_COLORS.protein}>{summary.macroBreakdown.protein}g</Text>
                  <Text size="xs" c="dimmed">Protein</Text>
                </div>
                <div className="text-center">
                  <Text size="sm" fw={600} c={MACRO_COLORS.carbs}>{summary.macroBreakdown.carbs}g</Text>
                  <Text size="xs" c="dimmed">Carbs</Text>
                </div>
                <div className="text-center">
                  <Text size="sm" fw={600} c={MACRO_COLORS.fat}>{summary.macroBreakdown.fat}g</Text>
                  <Text size="xs" c="dimmed">Fat</Text>
                </div>
              </SimpleGrid>
            </>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
