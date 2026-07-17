"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  Title,
  Badge,
  Progress,
  Tabs,
  Table,
  ActionIcon,
  ThemeIcon,
  SegmentedControl,
  Container,
  Center,
  Loader,
  Modal,
  Button,
  useComputedColorScheme,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
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
  IconTrash,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import { TimeAuditQuickAdd } from "./TimeAuditQuickAdd";
import { TimeAuditTimerCard } from "./TimeAuditTimerCard";

const OverviewCharts = dynamic(() => import("./OverviewCharts"), { ssr: false });

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
type Distribution = { byCategory: CategoryDistribution[]; byDay: DayDistribution[] };

type Props = {
  defaultTab: string;
  categories: TimeCategory[];
  today: DashboardMetrics;
  week: DashboardMetrics;
  month: DashboardMetrics;
  distribution: Distribution;
  trend: TrendData[];
  comparison: Comparison;
  summary: WeeklySummary;
  stats: ProductivityStats;
  budgets: BudgetProgress[];
  projects: Project[];
};

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all_time", label: "All Time" },
] as const;

function getPeriodDateRange(period: string): { dateFrom?: string; dateTo?: string } {
  const now = dayjs();
  switch (period) {
    case "today":
      return { dateFrom: now.startOf("day").toISOString(), dateTo: now.endOf("day").toISOString() };
    case "week":
      return { dateFrom: now.startOf("isoWeek").toISOString(), dateTo: now.endOf("isoWeek").toISOString() };
    case "month":
      return { dateFrom: now.startOf("month").toISOString(), dateTo: now.endOf("month").toISOString() };
    case "year":
      return { dateFrom: now.startOf("year").toISOString(), dateTo: now.endOf("year").toISOString() };
    case "all_time":
      return {};
    default:
      return { dateFrom: now.startOf("isoWeek").toISOString(), dateTo: now.endOf("isoWeek").toISOString() };
  }
}

function buildEntryQuery(period: string, baseUrl: string): string {
  const { dateFrom, dateTo } = getPeriodDateRange(period);
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

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

const PERIOD_LABEL: Record<string, string> = {
  today: "Today", week: "This Week", month: "This Month", year: "This Year", all_time: "All Time",
};

function OverviewTab({
  today, week, month, distribution, trend, comparison, summary, stats, budgets, categories,
  onCreated, viewMetrics, viewDistribution, period, periodLoading,
}: Props & { onCreated: () => void; viewMetrics: DashboardMetrics; viewDistribution: Distribution; period: string; periodLoading: boolean }) {

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TimeAuditQuickAdd categories={categories} onCreated={onCreated} />
        <TimeAuditTimerCard categories={categories} onCreated={onCreated} />
      </SimpleGrid>

      {periodLoading ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : (
        <>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <MetricCard
              label={PERIOD_LABEL[period] ?? "Period"}
              value={`${Math.round(viewMetrics.totalMinutes / 60 * 10) / 10}h`}
              subtitle={`${viewMetrics.sessionCount} sessions`}
              icon={IconClock}
              color="blue"
            />
            <MetricCard label="Avg Session" value={`${viewMetrics.avgDuration}m`} icon={IconClock} color="orange" />
            <MetricCard label="Best Session" value={`${viewMetrics.maxDuration}m`} subtitle={`Shortest: ${viewMetrics.minDuration}m`} icon={IconStar} color="yellow" />
            <MetricCard label="Streak" value={`${stats.consecutiveTrackingDays} days`} subtitle={`Best: ${stats.longestTrackingStreak}`} icon={IconFlame} color="red" />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <MetricCard label="Today" value={`${Math.round(today.totalMinutes / 60 * 10) / 10}h`} subtitle={`${today.sessionCount} sessions`} icon={IconClock} color="blue" />
            <MetricCard label="This Week" value={`${Math.round(week.totalMinutes / 60 * 10) / 10}h`} subtitle={`${week.sessionCount} sessions`} icon={IconCalendar} color="violet" change={comparison.week.change} />
            <MetricCard label="This Month" value={`${Math.round(month.totalMinutes / 60 * 10) / 10}h`} subtitle={`${month.sessionCount} sessions`} icon={IconCalendarMonth} color="teal" change={comparison.month.change} />
            <MetricCard label="Total All-Time" value={`${stats.totalHours}h`} subtitle={`${stats.totalSessions} sessions`} icon={IconStar} color="yellow" />
          </SimpleGrid>
        </>
      )}

      <WeeklySummaryCard summary={summary} />

      {!periodLoading && (
        <OverviewCharts
          byCategory={viewDistribution.byCategory}
          byDay={viewDistribution.byDay}
          trend={trend}
          budgets={budgets}
          categories={categories}
          periodLabel={PERIOD_LABEL[period] ?? period}
        />
      )}
    </Stack>
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
  const isDark = useComputedColorScheme() === "dark";
  return (
    <Paper withBorder p="md" radius="lg" bg={isDark ? "dark.6" : "blue.0"}>
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

function TimelineTab({ categories: _cats, entries, entriesLoading, onEntriesChange }: {
  categories: TimeCategory[]; entries: any[]; entriesLoading: boolean; onEntriesChange: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  return <EntryList entries={entries} entriesLoading={entriesLoading} onEntriesChange={onEntriesChange} />;
}

function EntryList({ entries: externalEntries, entriesLoading, onEntriesChange }: {
  entries: any[]; entriesLoading: boolean; onEntriesChange: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; field: "startTime" | "endTime" } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [overlapError, setOverlapError] = useState<string | null>(null);

  useEffect(() => {
    if (overlapError) {
      const t = setTimeout(() => setOverlapError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [overlapError]);

  const handleComplete = async (entry: any) => {
    if (entry.endTime) return;
    setCompleting(entry.id);
    try {
      const now = new Date();
      const durationMinutes = Math.max(1, Math.round((now.getTime() - new Date(entry.startTime).getTime()) / 60000));
      const res = await fetch(`/api/time-audit/entries/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime: now.toISOString(), durationMinutes }),
      });
      if (res.ok) {
        onEntriesChange((prev: any[]) =>
          prev.map((e: any) => (e.id === entry.id ? { ...e, endTime: now.toISOString(), durationMinutes } : e)),
        );
      }
    } finally {
      setCompleting(null);
    }
  };

  const handleTimeUpdate = async (entry: any, field: "startTime" | "endTime") => {
    if (!editingValue || !/^\d{2}:\d{2}$/.test(editingValue)) {
      setEditing(null);
      return;
    }
    const date = dayjs(entry[field]);
    const [h, m] = editingValue.split(":").map(Number);
    const updated = date.hour(h).minute(m).second(0).millisecond(0);
    const body: Record<string, string | number> = { [field]: updated.toISOString() };
    if (field === "startTime" && entry.endTime) {
      body.durationMinutes = Math.max(1, Math.round((new Date(entry.endTime).getTime() - updated.toDate().getTime()) / 60000));
    } else if (field === "endTime") {
      body.durationMinutes = Math.max(1, Math.round((updated.toDate().getTime() - new Date(entry.startTime).getTime()) / 60000));
    }
    const res = await fetch(`/api/time-audit/entries/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 409) {
      const data = await res.json();
      const conflict = data.conflicts?.[0];
      setOverlapError(conflict
        ? `Conflicts with "${conflict.title}"`
        : "Time overlaps with an existing entry");
      setEditing(null);
      return;
    }
    onEntriesChange((prev: any[]) =>
      prev.map((e: any) => (e.id === entry.id ? { ...e, ...body } : e)),
    );
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(confirmId);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/time-audit/entries/${confirmId}`, { method: "DELETE" });
      if (res.ok) {
        onEntriesChange((prev: any[]) => prev.filter((e: any) => e.id !== confirmId));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (entriesLoading) return <Text size="sm" c="dimmed">Loading...</Text>;

  const grouped = externalEntries.reduce((acc: Record<string, any[]>, e: any) => {
    const date = dayjs(e.startTime).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  return (
    <Stack gap="md">
      {overlapError && (
        <Text size="xs" c="red">
          {overlapError}
        </Text>
      )}
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
                    <Group gap={4} mt={2}>
                      {editing?.id === e.id && editing?.field === "startTime" ? (
                        <TimeInput
                          size="xs"
                          value={editingValue}
                          onChange={(v) => setEditingValue(v.currentTarget.value)}
                          onBlur={() => handleTimeUpdate(e, "startTime")}
                          autoFocus
                        />
                      ) : (
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ cursor: "pointer", textDecoration: "underline dotted" }}
                          onClick={() => {
                            setEditing({ id: e.id, field: "startTime" });
                            setEditingValue(dayjs(e.startTime).format("HH:mm"));
                          }}
                        >
                          {dayjs(e.startTime).format("HH:mm")}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">–</Text>
                      {editing?.id === e.id && editing?.field === "endTime" ? (
                        <TimeInput
                          size="xs"
                          value={editingValue}
                          onChange={(v) => setEditingValue(v.currentTarget.value)}
                          onBlur={() => handleTimeUpdate(e, "endTime")}
                          autoFocus
                        />
                      ) : (
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ cursor: "pointer", textDecoration: "underline dotted" }}
                          onClick={() => {
                            if (e.endTime) {
                              setEditing({ id: e.id, field: "endTime" });
                              setEditingValue(dayjs(e.endTime).format("HH:mm"));
                            }
                          }}
                        >
                          {e.endTime ? dayjs(e.endTime).format("HH:mm") : "running"}
                        </Text>
                      )}
                      {e.durationMinutes && (
                        <Text size="xs" c="dimmed">· {e.durationMinutes}m</Text>
                      )}
                    </Group>
                  </div>
                  <Group gap={6}>
                    {e.isBillable && <Badge size="sm" variant="light" color="green">$</Badge>}
                    {e.tags?.slice(0, 2).map((t: string) => (
                      <Badge key={t} size="sm" variant="light">{t}</Badge>
                    ))}
                    {!e.endTime && (
                      <ActionIcon
                        variant="filled"
                        color="green"
                        size="sm"
                        radius="md"
                        loading={completing === e.id}
                        onClick={() => handleComplete(e)}
                      >
                        <IconPlayerStopFilled size={12} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      loading={deleting === e.id}
                      onClick={() => setConfirmId(e.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      ))}

      <Modal
        opened={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete entry?"
        size="sm"
      >
        <Text size="sm" mb="lg">
          This will permanently delete this time entry. This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={!!deleting}>
            Delete
          </Button>
        </Group>
      </Modal>
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

function ProjectsTab({ projects, entries, entriesLoading }: {
  projects: Project[]; entries: any[]; entriesLoading: boolean;
}) {
  return <ProjectList projects={projects} entries={entries} entriesLoading={entriesLoading} />;
}

function ProjectList({ projects: projectList, entries, entriesLoading }: {
  projects: Project[]; entries: any[]; entriesLoading: boolean;
}) {

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

  if (entriesLoading) return <Text size="sm" c="dimmed">Loading...</Text>;

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

  const [period, setPeriod] = useState("week");
  const [viewMetrics, setViewMetrics] = useState<DashboardMetrics>(props.week);
  const [viewDistribution, setViewDistribution] = useState<Distribution>(props.distribution);
  const [periodLoading, setPeriodLoading] = useState(false);

  // Shared entries fetch — both Timeline and Projects tabs consume this
  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  useEffect(() => {
    setPeriodLoading(true);
    fetch(`/api/time-audit/dashboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setViewMetrics(data.metrics);
        setViewDistribution(data.distribution);
        setPeriodLoading(false);
      })
      .catch(() => setPeriodLoading(false));
  }, [period]);

  // Background refresh when entries are created/stopped or period changes
  useEffect(() => {
    if (refreshKey === 0) return;
    fetch(`/api/time-audit/dashboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setViewMetrics(data.metrics);
        setViewDistribution(data.distribution);
      })
      .catch(() => {});
  }, [refreshKey, period]);

  // Single entries fetch shared between Timeline and Projects tabs
  useEffect(() => {
    setEntriesLoading(true);
    const url = buildEntryQuery(period, "/api/time-audit/entries");
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setEntriesLoading(false); })
      .catch(() => setEntriesLoading(false));
  }, [refreshKey, period]);

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

      <Center mb="xl">
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          data={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
          size="sm"
        />
      </Center>

      <Tabs defaultValue={props.defaultTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconTrendingUp size={16} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconCalendar size={16} />}>Timeline</Tabs.Tab>
          <Tabs.Tab value="categories" leftSection={<IconTargetArrow size={16} />}>Categories</Tabs.Tab>
          <Tabs.Tab value="projects" leftSection={<IconStar size={16} />}>Projects</Tabs.Tab>
          <Tabs.Tab value="budgets" leftSection={<IconTargetArrow size={16} />}>Budgets</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab
            {...props}
            onCreated={handleCreated}
            viewMetrics={viewMetrics}
            viewDistribution={viewDistribution}
            period={period}
            periodLoading={periodLoading}
          />
        </Tabs.Panel>
        <Tabs.Panel value="timeline">
          <TimelineTab
            categories={props.categories}
            entries={entries}
            entriesLoading={entriesLoading}
            onEntriesChange={setEntries}
          />
        </Tabs.Panel>
        <Tabs.Panel value="categories">
          <CategoriesTab categories={props.categories} distribution={viewDistribution} />
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          <ProjectsTab projects={props.projects} entries={entries} entriesLoading={entriesLoading} />
        </Tabs.Panel>
        <Tabs.Panel value="budgets">
          <BudgetsTab budgets={props.budgets} categories={props.categories} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
