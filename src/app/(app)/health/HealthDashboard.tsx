"use client";

import { Stack, Group, Text, Paper, SimpleGrid, Badge, ThemeIcon, Progress, Anchor, Tooltip } from "@mantine/core";
import {
  IconHeart,
  IconWeight,
  IconActivity,
  IconBed,
  IconRun,
  IconWalk,
  IconFlame,
  IconDroplet,
  IconPill,
  IconTargetArrow,
  IconTrophy,
  IconArrowRight,
  IconHeartbeat,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import type { HealthDashboard as HealthDashboardData } from "@/modules/health";

function MiniChart({ data, dataKey, color }: { data: { date: string; value: number }[]; dataKey: string; color: string }) {
  if (data.length === 0) return <Text size="xs" c="dimmed">No data</Text>;
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: string | number; icon: React.ComponentType<{ size?: number }>; color: string; href?: string;
}) {
  const inner = (
    <Paper withBorder p="sm">
      <Group justify="space-between" wrap="nowrap" mb={4}>
        <Text size="xs" c="dimmed" fw={600}>{label}</Text>
        <ThemeIcon variant="light" color={color} size="sm" radius="xl">
          <Icon size={14} />
        </ThemeIcon>
      </Group>
      <Text size="xl" fw={700}>{value ?? "—"}</Text>
    </Paper>
  );
  if (href) return <Anchor component={Link} href={href} underline="never">{inner}</Anchor>;
  return inner;
}

export function HealthDashboard({ data }: { data: HealthDashboardData }) {
  const { vitals, vitalsTrends, fitness, nutrition, activeGoals, activeMedicines, achievements } = data;

  return (
    <Stack gap="md" p="lg">
      <div>
        <Text size="xl" fw={700}>Health Overview</Text>
        <Text size="sm" c="dimmed">Trends, correlations & insights</Text>
      </div>

      {/* Today's Snapshot */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
        <StatCard
          label="Weight"
          value={vitals.latestWeight ? `${vitals.latestWeight.weightKg} kg` : "—"}
          icon={IconWeight} color="cyan"
          href="/health/vitals"
        />
        <StatCard
          label="Blood Pressure"
          value={vitals.latestBp ? `${vitals.latestBp.systolic}/${vitals.latestBp.diastolic}` : "—"}
          icon={IconHeartbeat} color="pink"
          href="/health/vitals"
        />
        <StatCard
          label="Heart Rate"
          value={vitals.latestHr ? `${vitals.latestHr.average ?? vitals.latestHr.resting ?? "—"} bpm` : "—"}
          icon={IconActivity} color="grape"
          href="/health/vitals"
        />
        <StatCard
          label="Sleep"
          value={vitals.avgSleepDuration ? `${vitals.avgSleepDuration}h` : "—"}
          icon={IconBed} color="indigo"
          href="/health/vitals"
        />
        <StatCard
          label="Water"
          value={vitals.todayHydration > 0 ? `${vitals.todayHydration}ml` : "—"}
          icon={IconDroplet} color="blue"
        />
        <StatCard
          label="Steps"
          value={fitness.stepTrend.length > 0 ? fitness.stepTrend[fitness.stepTrend.length - 1].value.toLocaleString() : "—"}
          icon={IconWalk} color="orange"
          href="/health/fitness"
        />
      </SimpleGrid>

      {/* 7-Day Trends */}
      <Text size="sm" fw={600} tt="uppercase" c="dimmed" mt="sm">Trends (7 days)</Text>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Weight</Text>
            <Badge size="sm" color="cyan">{vitalsTrends.weight.length} records</Badge>
          </Group>
          <MiniChart data={vitalsTrends.weight} dataKey="value" color="#22d3ee" />
        </Paper>
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Blood Pressure</Text>
            <Badge size="sm" color="pink">{vitalsTrends.systolic.length} records</Badge>
          </Group>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={vitalsTrends.systolic.map((s, i) => ({ ...s, diastolic: vitalsTrends.diastolic[i]?.value }))}>
              <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#f472b6" strokeWidth={2} dot={false} name="Diastolic" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Sleep Duration</Text>
            <Badge size="sm" color="indigo">{vitalsTrends.sleepDuration.length} records</Badge>
          </Group>
          <MiniChart data={vitalsTrends.sleepDuration} dataKey="value" color="#6366f1" />
        </Paper>
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Steps</Text>
            <Badge size="sm" color="orange">{fitness.stepTrend.length} records</Badge>
          </Group>
          <MiniChart data={fitness.stepTrend} dataKey="value" color="#f97316" />
        </Paper>
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Calories</Text>
            <Badge size="sm" color="red">{nutrition.dailyCalories.length} records</Badge>
          </Group>
          <MiniChart data={nutrition.dailyCalories} dataKey="value" color="#ef4444" />
        </Paper>
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={600}>Sleep Quality</Text>
            <Badge size="sm" color="violet">{vitalsTrends.sleepQuality.length} records</Badge>
          </Group>
          <MiniChart data={vitalsTrends.sleepQuality} dataKey="value" color="#8b5cf6" />
        </Paper>
      </SimpleGrid>

      {/* Fitness + Nutrition Summary */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="sm">
        <Paper withBorder p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Fitness (This Week)</Text>
            <Anchor component={Link} href="/health/fitness" size="xs">
              Details →
            </Anchor>
          </Group>
          <SimpleGrid cols={3} spacing="xs">
            <div className="text-center">
              <Text size="xl" fw={700}>{fitness.totalWorkoutMinutesWeek}</Text>
              <Text size="xs" c="dimmed">Minutes</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{fitness.totalCaloriesBurned > 0 ? fitness.totalCaloriesBurned : "—"}</Text>
              <Text size="xs" c="dimmed">Cal Burned</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{fitness.avgDailySteps.toLocaleString()}</Text>
              <Text size="xs" c="dimmed">Avg Steps</Text>
            </div>
          </SimpleGrid>
        </Paper>

        <Paper withBorder p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Nutrition (Daily Avg)</Text>
            <Anchor component={Link} href="/health/nutrition" size="xs">
              Details →
            </Anchor>
          </Group>
          <SimpleGrid cols={4} spacing="xs">
            <div className="text-center">
              <Text size="xl" fw={700}>{nutrition.avgDailyCalories > 0 ? nutrition.avgDailyCalories : "—"}</Text>
              <Text size="xs" c="dimmed">Calories</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{nutrition.macroBreakdown.protein}g</Text>
              <Text size="xs" c="dimmed">Protein</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{nutrition.macroBreakdown.carbs}g</Text>
              <Text size="xs" c="dimmed">Carbs</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{nutrition.macroBreakdown.fat}g</Text>
              <Text size="xs" c="dimmed">Fat</Text>
            </div>
          </SimpleGrid>
        </Paper>
      </SimpleGrid>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <>
          <Text size="sm" fw={600} tt="uppercase" c="dimmed" mt="sm">Active Goals</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            {activeGoals.slice(0, 4).map((g) => (
              <Paper key={g.id} withBorder p="sm">
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={500}>{g.title}</Text>
                  <Badge size="sm" color={g.progress >= 100 ? "teal" : "blue"}>
                    {Number(g.currentValue)}/{Number(g.targetValue)} {g.unit}
                  </Badge>
                </Group>
                <Progress value={g.progress} size="sm" color={g.progress >= 100 ? "teal" : "blue"} />
              </Paper>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* Summary Row */}
      <Paper withBorder p="sm">
        <Group gap="xl">
          <Group gap={6}>
            <ThemeIcon variant="light" color="blue" size="sm" radius="xl"><IconPill size={14} /></ThemeIcon>
            <Text size="sm">{activeMedicines} active {activeMedicines === 1 ? "medicine" : "medicines"}</Text>
          </Group>
          <Group gap={6}>
            <ThemeIcon variant="light" color="yellow" size="sm" radius="xl"><IconTrophy size={14} /></ThemeIcon>
            <Text size="sm">{achievements} {achievements === 1 ? "achievement" : "achievements"}</Text>
          </Group>
          <Group gap={6}>
            <ThemeIcon variant="light" color="violet" size="sm" radius="xl"><IconTargetArrow size={14} /></ThemeIcon>
            <Text size="sm">{activeGoals.length} active {activeGoals.length === 1 ? "goal" : "goals"}</Text>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
