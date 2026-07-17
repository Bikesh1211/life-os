"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  Title,
  Badge,
  Card,
  Progress,
  Tabs,
  Table,
  ScrollArea,
  Tooltip,
  ActionIcon,
  ThemeIcon,
  Select,
  Container,
} from "@mantine/core";
import {
  IconClock,
  IconCalendar,
  IconCalendarMonth,
  IconTrendingUp,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconTargetArrow,
  IconStar,
  IconFlame,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from "recharts";

import dayjs from "dayjs";
import { TimeAuditQuickAdd } from "./TimeAuditQuickAdd";
import { TimeAuditTimerCard } from "./TimeAuditTimerCard";

type TimeCategory = { id: string; name: string; icon: string; color: string };
type DashboardMetrics = { totalMinutes: number; sessionCount: number; avgDuration: number; maxDuration: number; minDuration: number };
type CategoryDistribution = { categoryId: string | null; totalMinutes: number; sessionCount: number };
type DayDistribution = { date: string; totalMinutes: number; sessionCount: number };
type TrendData = { week: string; totalMinutes: number; sessionCount: number };
type ProjectData = { projectId: string | null; totalMinutes: number; sessionCount: number; avgDuration: number; lastActivity: Date; percentageOfTotal?: number };
type BudgetProgress = { id: string; categoryId: string; period: string; targetMinutes: number; actualMinutes: number; remainingMinutes: number; percentage: number; isExceeded: boolean };
type Comparison = { week: { currentMinutes: number; previousMinutes: number; change: number; currentSessions: number; previousSessions: number }; month: { currentMinutes: number; previousMinutes: number; change: number; currentSessions: number; previousSessions: number } };
type WeeklySummary = { totalHours: number; totalSessions: number; mostUsedCategory: { name: string; minutes: number } | null; longestSession: number; averageDailyHours: number; categoryBreakdown: { categoryId: string | null; name: string; minutes: number; sessions: number }[] };
type ProductivityStats = { totalHours: number; totalSessions: number; averageDailyHours: number; averageWeeklyHours: number; averageMonthlyHours: number; averageSessionDuration: number; consecutiveTrackingDays: number; longestTrackingStreak: number; todayHours: number; weekHours: number; monthHours: number };
type Project = { id: string; title: string; color: string };

type Props = {
  defaultTab: string;
  categories: TimeCategory[];
  today: DashboardMetrics;
  week: DashboardMetrics;
  month: DashboardMetrics;
  distribution: { byCategory: CategoryDistribution[]; byDay: DayDistribution[] };
  trend: TrendData[];
  comparison: Comparison;
  summary: WeeklySummary;
  stats: ProductivityStats;
  budgets: BudgetProgress[];
  projects: Project[];
};

const CATEGORY_COLORS = [
  "#4C6EF5", "#7C3AED", "#E64980", "#FA5252", "#FD7E14",
  "#FAB005", "#40C057", "#15AABF", "#1C7ED6", "#7950F2",
  "#F06595", "#FF6B6B", "#F59F00", "#868E96", "#ADB5BD",
];

function MetricCard({ label, value, subtitle, icon: Icon, color, change }: {
  label: string; value: string | number; subtitle?: string; icon?: React.ComponentType<{ size?: number }>; color?: string; change?: number;
}) {
  return (
    <Paper withBorder p="md" radius="lg">
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">{label}</Text>
        {Icon && (
          <ThemeIcon variant="light" color={color ?? "blue"} size="md" radius="xl">
            <Icon size={16} />
          </ThemeIcon>
        )}
      </Group>
      <Text fz={28} fw={700}>{value}</Text>
      {subtitle && <Text size="xs" c="dimmed" mt={2}>{subtitle}</Text>}
      {change !== undefined && (
        <Group gap={4} mt={4}>
          {change > 0 ? (
            <IconArrowUpRight size={14} color="green" />
          ) : change < 0 ? (
            <IconArrowDownRight size={14} color="red" />
          ) : (
            <IconMinus size={14} color="gray" />
          )}
          <Text size="xs" c={change > 0 ? "green" : change < 0 ? "red" : "dimmed"}>
            {Math.abs(change)}% vs last {label.includes("Week") ? "week" : "month"}
          </Text>
        </Group>
      )}
    </Paper>
  );
}

function OverviewTab({ today, week, month, distribution, trend, comparison, summary, stats, budgets, categories, onCreated }: Props & { onCreated: () => void }) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const pieData = distribution.byCategory.map((c) => ({
    name: categoryMap.get(c.categoryId ?? "")?.name ?? "Uncategorized",
    value: c.totalMinutes,
    color: categoryMap.get(c.categoryId ?? "")?.color ?? "gray",
  }));

  const barData = distribution.byDay.map((d) => ({
    day: dayjs(d.date).format("ddd"),
    hours: Math.round((d.totalMinutes / 60) * 10) / 10,
    fullDate: d.date,
  }));

  const trendData = trend.map((t) => ({
    week: t.week,
    hours: Math.round((t.totalMinutes / 60) * 10) / 10,
  }));

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TimeAuditQuickAdd categories={categories} onCreated={onCreated} />
        <TimeAuditTimerCard categories={categories} onCreated={onCreated} />
      </SimpleGrid>

      <WeeklySummaryCard summary={summary} />

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
        <MetricCard label="Today" value={`${Math.round(today.totalMinutes / 60 * 10) / 10}h`} subtitle={`${today.sessionCount} sessions`} icon={IconClock} color="blue" />
        <MetricCard label="This Week" value={`${Math.round(week.totalMinutes / 60 * 10) / 10}h`} subtitle={`${week.sessionCount} sessions`} icon={IconCalendar} color="violet" change={comparison.week.change} />
        <MetricCard label="This Month" value={`${Math.round(month.totalMinutes / 60 * 10) / 10}h`} subtitle={`${month.sessionCount} sessions`} icon={IconCalendarMonth} color="teal" change={comparison.month.change} />
        <MetricCard label="Avg Session" value={`${week.avgDuration}m`} icon={IconClock} color="orange" />
        <MetricCard label="Streak" value={`${stats.consecutiveTrackingDays} days`} subtitle={`Best: ${stats.longestTrackingStreak}`} icon={IconFlame} color="red" />
        <MetricCard label="Total" value={`${stats.totalHours}h`} subtitle={`${stats.totalSessions} sessions`} icon={IconStar} color="yellow" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ChartCard title="Time by Category" height={300}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }: any) => `${name} ${Math.round(value / 60 * 10) / 10}h`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={((value: any) => `${Math.round(Number(value) / 60 * 10) / 10}h`) as any} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No data this week" />
          )}
        </ChartCard>

        <ChartCard title="Daily Hours (This Week)" height={300}>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="day" stroke="var(--mantine-color-dimmed)" fontSize={12} />
                <YAxis stroke="var(--mantine-color-dimmed)" fontSize={12} unit="h" />
                <RechartsTooltip formatter={((value: any) => `${Number(value)}h`) as any} />
                <Bar dataKey="hours" fill="var(--mantine-color-blue-6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No entries this week" />
          )}
        </ChartCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ChartCard title="Weekly Trend (Last 12 Weeks)" height={250}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                <XAxis dataKey="week" stroke="var(--mantine-color-dimmed)" fontSize={10} />
                <YAxis stroke="var(--mantine-color-dimmed)" fontSize={12} unit="h" />
                <RechartsTooltip formatter={((value: any) => `${Number(value)}h`) as any} />
                <Line type="monotone" dataKey="hours" stroke="var(--mantine-color-indigo-6)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Not enough data for trend" />
          )}
        </ChartCard>

        <ChartCard title="Budget Progress" height={250}>
          {budgets.length > 0 ? (
            <Stack gap="sm">
              {budgets.slice(0, 6).map((b) => {
                const cat = categoryMap.get(b.categoryId);
                return (
                  <div key={b.id}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">{cat?.name ?? "Unknown"}</Text>
                      <Text size="xs" c="dimmed">
                        {Math.round(b.actualMinutes / 60 * 10) / 10}h / {Math.round(b.targetMinutes / 60 * 10) / 10}h
                      </Text>
                    </Group>
                    <Progress
                      value={Math.min(b.percentage, 100)}
                      color={b.isExceeded ? "red" : "blue"}
                      size="md"
                      radius="md"
                    />
                  </div>
                );
              })}
            </Stack>
          ) : (
            <EmptyState message="No budgets set" />
          )}
        </ChartCard>
      </SimpleGrid>
    </Stack>
  );
}

function ChartCard({ title, children, height }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <Paper withBorder p="md" radius="lg">
      <Text size="sm" fw={600} mb="md">{title}</Text>
      <div style={{ height: height ?? 300 }}>{children}</div>
    </Paper>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <Text size="sm" c="dimmed">{message}</Text>
    </div>
  );
}

function WeeklySummaryCard({ summary }: { summary: WeeklySummary }) {
  return (
    <Paper withBorder p="md" radius="lg" bg="var(--mantine-color-blue-0)" style={{ borderColor: "var(--mantine-color-blue-3)" }}>
      <Group justify="space-between" mb="xs">
        <Group gap={8}>
          <ThemeIcon variant="light" color="blue" size="md" radius="xl">
            <IconTrendingUp size={16} />
          </ThemeIcon>
          <Text fw={600}>This Week in Review</Text>
        </Group>
        <Badge variant="light" color="blue">
          {dayjs().startOf("isoWeek").format("MMM D")} – {dayjs().endOf("isoWeek").format("MMM D, YYYY")}
        </Badge>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
        <div>
          <Text size="xs" c="dimmed">Total Hours</Text>
          <Text fw={600}>{summary.totalHours}h</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">Sessions</Text>
          <Text fw={600}>{summary.totalSessions}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">Avg Daily</Text>
          <Text fw={600}>{summary.averageDailyHours}h</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">Longest Session</Text>
          <Text fw={600}>{summary.longestSession}m</Text>
        </div>
      </SimpleGrid>
      {summary.mostUsedCategory && (
        <Group gap={4} mt="xs">
          <Text size="xs" c="dimmed">Most time spent on:</Text>
          <Badge size="sm" variant="light">{summary.mostUsedCategory.name}</Badge>
        </Group>
      )}
    </Paper>
  );
}

function TimelineTab({ categories: cats, refreshKey }: { categories: TimeCategory[]; refreshKey: number }) {
  return <EntryList refreshKey={refreshKey} />;
}

function EntryList({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/time-audit/entries")
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Text size="sm" c="dimmed">Loading...</Text>;

  const grouped = entries.reduce((acc: Record<string, any[]>, e: any) => {
    const date = dayjs(e.startTime).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  return (
    <Stack gap="md">
      {Object.entries(grouped).length === 0 && <EmptyState message="No entries yet. Start tracking your time!" />}
      {Object.entries(grouped).map(([date, dayEntries]) => (
        <div key={date}>
          <Text size="sm" fw={600} mb="xs">{dayjs(date).format("dddd, MMM D, YYYY")}</Text>
          <Stack gap={4}>
            {(dayEntries as any[]).map((e: any) => (
              <Paper key={e.id} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>{e.title}</Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(e.startTime).format("HH:mm")}
                      {e.endTime ? ` – ${dayjs(e.endTime).format("HH:mm")}` : " – running"}
                      {e.durationMinutes ? ` · ${e.durationMinutes}m` : ""}
                    </Text>
                  </div>
                  <Group gap={6}>
                    {e.isBillable && <Badge size="sm" variant="light" color="green">$</Badge>}
                    {e.tags?.slice(0, 2).map((t: string) => (
                      <Badge key={t} size="sm" variant="light">{t}</Badge>
                    ))}
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}

function CategoriesTab({ categories: cats, distribution }: { categories: TimeCategory[]; distribution: { byCategory: CategoryDistribution[] } }) {
  const categoryMap = new Map(cats.map((c) => [c.id, c]));
  const pieData = distribution.byCategory.map((c) => ({
    name: categoryMap.get(c.categoryId ?? "")?.name ?? "Uncategorized",
    value: c.totalMinutes,
    hours: Math.round((c.totalMinutes / 60) * 10) / 10,
    color: categoryMap.get(c.categoryId ?? "")?.color ?? "gray",
    sessions: c.sessionCount,
  }));

  return (
    <Stack gap="lg">
      <Paper withBorder p="md" radius="lg">
        <Text size="sm" fw={600} mb="md">Category Distribution</Text>
        <div style={{ height: 300 }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }: any) => `${name} ${Math.round(value / 60 * 10) / 10}h`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={((value: any) => `${Math.round(Number(value) / 60 * 10) / 10}h`) as any} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No data this period" />
          )}
        </div>
      </Paper>

      <Paper withBorder p="md" radius="lg">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Category</Table.Th>
              <Table.Th>Hours</Table.Th>
              <Table.Th>Sessions</Table.Th>
              <Table.Th>Avg Duration</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pieData.map((c) => (
              <Table.Tr key={c.name}>
                <Table.Td><Group gap={6}><div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />{c.name}</Group></Table.Td>
                <Table.Td>{c.hours}h</Table.Td>
                <Table.Td>{c.sessions}</Table.Td>
                <Table.Td>{c.sessions > 0 ? `${Math.round(c.value / c.sessions)}m` : "-"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

function ProjectsTab({ projects, refreshKey }: { projects: Project[]; refreshKey: number }) {
  return <ProjectList projects={projects} refreshKey={refreshKey} />;
}

function ProjectList({ projects: projectList, refreshKey }: { projects: Project[]; refreshKey: number }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/time-audit/entries")
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  const projectMap = new Map(projectList.map((p) => [p.id, p]));
  const projectTime = new Map<string, { title: string; color: string; totalMinutes: number; sessions: number; lastActivity: Date }>();

  entries
    .filter((e: any) => e.projectId && !e.deletedAt)
    .forEach((e: any) => {
      const existing = projectTime.get(e.projectId) ?? {
        title: projectMap.get(e.projectId)?.title ?? "Unknown",
        color: projectMap.get(e.projectId)?.color ?? "gray",
        totalMinutes: 0,
        sessions: 0,
        lastActivity: new Date(0),
      };
      existing.totalMinutes += e.durationMinutes ?? 0;
      existing.sessions += 1;
      if (e.startTime && new Date(e.startTime) > existing.lastActivity) {
        existing.lastActivity = new Date(e.startTime);
      }
      projectTime.set(e.projectId, existing);
    });

  const allTimeMinutes = Array.from(projectTime.values()).reduce((s, p) => s + p.totalMinutes, 0) || 1;
  const sorted = Array.from(projectTime.entries())
    .map(([id, data]) => ({ id, ...data, percentage: Math.round((data.totalMinutes / allTimeMinutes) * 100) }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  if (loading) return <Text size="sm" c="dimmed">Loading...</Text>;

  return (
    <Paper withBorder p="md" radius="lg">
      {sorted.length === 0 ? (
        <EmptyState message="No project time tracked yet" />
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Project</Table.Th>
              <Table.Th>Hours</Table.Th>
              <Table.Th>Sessions</Table.Th>
              <Table.Th>Avg Duration</Table.Th>
              <Table.Th>% of Total</Table.Th>
              <Table.Th>Last Activity</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>
                  <Group gap={6}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                    {p.title}
                  </Group>
                </Table.Td>
                <Table.Td>{(p.totalMinutes / 60).toFixed(1)}h</Table.Td>
                <Table.Td>{p.sessions}</Table.Td>
                <Table.Td>{p.sessions > 0 ? `${Math.round(p.totalMinutes / p.sessions)}m` : "-"}</Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Progress value={p.percentage} size="sm" style={{ flex: 1 }} />
                    <Text size="xs">{p.percentage}%</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{dayjs(p.lastActivity).format("MMM D")}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}

function BudgetsTab({ budgets, categories }: { budgets: BudgetProgress[]; categories: TimeCategory[] }) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <Stack gap="md">
      {budgets.length === 0 && <EmptyState message="No budgets set. Create time budgets to track your targets." />}
      {budgets.map((b) => {
        const cat = categoryMap.get(b.categoryId);
        return (
          <Paper key={b.id} withBorder p="md" radius="lg">
            <Group justify="space-between" mb="xs">
              <Group gap={8}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: cat?.color ?? "gray" }} />
                <Text fw={500}>{cat?.name ?? "Unknown"}</Text>
              </Group>
              <Badge variant="light" color={b.isExceeded ? "red" : b.percentage >= 80 ? "yellow" : "green"}>
                {b.isExceeded ? "Exceeded" : `${b.percentage}%`}
              </Badge>
            </Group>
            <Progress
              value={Math.min(b.percentage, 100)}
              color={b.isExceeded ? "red" : b.percentage >= 80 ? "yellow" : "blue"}
              size="lg"
              radius="md"
              mb="xs"
            />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {Math.round(b.actualMinutes / 60 * 10) / 10}h of {Math.round(b.targetMinutes / 60 * 10) / 10}h
              </Text>
              <Text size="sm" fw={500} c={b.isExceeded ? "red" : "green"}>
                {b.isExceeded
                  ? `${Math.round((b.actualMinutes - b.targetMinutes) / 60 * 10) / 10}h over`
                  : `${Math.round(b.remainingMinutes / 60 * 10) / 10}h remaining`}
              </Text>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}

export function TimeAuditDashboard(props: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleCreated = () => setRefreshKey((k) => k + 1);

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Time Audit</Title>
        <Group gap="sm">
          <Badge variant="light" color="blue" size="lg">
            {dayjs().format("dddd, MMM D")}
          </Badge>
        </Group>
      </Group>

      <Tabs defaultValue={props.defaultTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconTrendingUp size={16} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconCalendar size={16} />}>Timeline</Tabs.Tab>
          <Tabs.Tab value="categories" leftSection={<IconTargetArrow size={16} />}>Categories</Tabs.Tab>
          <Tabs.Tab value="projects" leftSection={<IconStar size={16} />}>Projects</Tabs.Tab>
          <Tabs.Tab value="budgets" leftSection={<IconTargetArrow size={16} />}>Budgets</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview"><OverviewTab {...props} onCreated={handleCreated} /></Tabs.Panel>
        <Tabs.Panel value="timeline"><TimelineTab categories={props.categories} refreshKey={refreshKey} /></Tabs.Panel>
        <Tabs.Panel value="categories"><CategoriesTab categories={props.categories} distribution={props.distribution} /></Tabs.Panel>
        <Tabs.Panel value="projects"><ProjectsTab projects={props.projects} refreshKey={refreshKey} /></Tabs.Panel>
        <Tabs.Panel value="budgets"><BudgetsTab budgets={props.budgets} categories={props.categories} /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
