"use client";

import {
  SimpleGrid,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Paper,
} from "@mantine/core";
import { NearestCountdownWidget } from "@/app/(app)/countdown/components/NearestCountdownWidget";
import {
  IconChecklist,
  IconTarget,
  IconFlame,
  IconCalendarEvent,
  IconBooks,
  IconNotes,
  IconCoin,
  IconHeart,
  IconBolt,
  IconArrowRight,
  IconBrain,
  IconPlus,
  IconTimelineEvent,
  IconChartBar,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { PremiumCard } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumBadge } from "@/components/ui/badge";
import { cn } from "@/core/utils";
import { APP_NAME } from "@/core/constants";

type DashboardContentProps = {
  userId: string;
  taskSummary: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    cancelled?: number;
    overdue?: number;
  };
  habitSummary: {
    totalHabits: number;
    completedToday: number;
    pendingToday: number;
    currentStreak: number;
    longestStreak: number;
    habits?: any[];
  };
  goalOverview: {
    total: number;
    active: number;
    completed: number;
    cancelled?: number;
    recentGoals?: any[];
    overdueGoals?: any[];
  };
  lifeStats: {
    total: number;
    past: number;
    future: number;
    pinned: number;
    longestRunning?: any;
  };
  upcomingEvents: any[];
  noteStats: {
    totalNotes: number;
    recentNotes?: any[];
  };
  financeSummary: {
    monthlySpending: number;
    monthlyIncome: number;
    savingsRate: number;
    averageDailySpend: number;
    transactionCount: number;
  };
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const motivationalQuotes = [
  "Design the life you want.",
  "Small steps lead to big changes.",
  "Make today matter.",
  "Progress, not perfection.",
  "You're building something great.",
];

function WelcomeWidget({ name }: { name?: string }) {
  const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="col-span-full"
    >
      <Paper
        radius="xl"
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          border: "none",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white" />
        </div>
        <div className="relative z-0 px-8 py-7">
          <Text size="sm" fw={500} className="text-blue-100/80">
            {greeting()} {name ? `, ${name.split(" ")[0]}` : ""}
          </Text>
          <Text
            fw={700}
            className="text-2xl tracking-tight mt-0.5 text-white"
          >
            {quote}
          </Text>
        </div>
      </Paper>
    </motion.div>
  );
}

function TodayFocusWidget() {
  return (
    <PremiumCard variant="gradient" gradient={{ from: "amber", to: "orange" }} className="h-full">
      <Stack gap={8}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="yellow">
            <IconBolt size={16} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            Today&apos;s Focus
          </Text>
        </Group>
        <Text size="xs" c="dimmed" className="leading-relaxed">
          No focus set for today. Click to define your main priority.
        </Text>
      </Stack>
    </PremiumCard>
  );
}

function QuickActionsWidget() {
  const actions = [
    { label: "New Note", icon: IconNotes, href: "/notes", color: "blue" },
    { label: "Add Task", icon: IconChecklist, href: "/tasks", color: "cyan" },
    { label: "Log Event", icon: IconTimelineEvent, href: "/timeline", color: "grape" },
    { label: "Track Habit", icon: IconFlame, href: "/habits", color: "orange" },
  ];
  return (
    <PremiumCard className="h-full">
      <Stack gap={10}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" component="span">
          Quick Actions
        </Text>
        <SimpleGrid cols={2} spacing={6}>
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all no-underline"
            >
              <ThemeIcon size={26} radius="md" variant="light" color={a.color as any}>
                <a.icon size={14} />
              </ThemeIcon>
              <span>{a.label}</span>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </PremiumCard>
  );
}

function TaskStatsWidget({ taskSummary }: { taskSummary: DashboardContentProps["taskSummary"] }) {
  return (
    <StatCard
      label="Tasks"
      value={taskSummary.total}
      subtitle={`${taskSummary.todo} todo · ${taskSummary.inProgress} in progress · ${taskSummary.done} done`}
      icon={IconChecklist}
      color="blue"
      delay={1}
    />
  );
}

function CalendarWidget({ upcomingEvents }: { upcomingEvents: any[] }) {
  const today = dayjs();
  return (
    <PremiumCard variant="interactive" className="h-full">
      <Stack gap={12}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="violet">
            <IconCalendarEvent size={16} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={600}>
              {today.format("dddd")}
            </Text>
            <Text size="xs" c="dimmed">
              {today.format("MMMM D, YYYY")}
            </Text>
          </div>
        </Group>
        {upcomingEvents.length > 0 ? (
          <Stack gap={6}>
            {upcomingEvents.slice(0, 3).map((event: any) => (
              <Group key={event.id} gap={8} className="text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <Text size="xs" truncate style={{ flex: 1 }}>
                  {event.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {dayjs(event.eventDate).format("MMM D")}
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            No upcoming events
          </Text>
        )}
      </Stack>
    </PremiumCard>
  );
}

function KnowledgeWidget({ lifeStats }: { lifeStats: DashboardContentProps["lifeStats"] }) {
  return (
    <StatCard
      label="Timeline Events"
      value={lifeStats.total}
      subtitle={`${lifeStats.past} past · ${lifeStats.future} upcoming`}
      icon={IconBrain}
      color="grape"
      delay={2}
    />
  );
}

function GoalsWidget({ goalOverview }: { goalOverview: DashboardContentProps["goalOverview"] }) {
  return (
    <StatCard
      label="Goals"
      value={goalOverview.active}
      subtitle={`${goalOverview.completed} completed · ${goalOverview.total} total`}
      icon={IconTarget}
      color="green"
      trend={goalOverview.completed > 0 ? { value: `${goalOverview.completed} done`, direction: "up" } : undefined}
      delay={3}
    />
  );
}

function WellnessWidget() {
  return (
    <PremiumCard variant="interactive" className="h-full">
      <Stack gap={10}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="pink">
            <IconHeart size={16} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            Wellness
          </Text>
        </Group>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <Text size="xs" c="dimmed">
                Overall
              </Text>
              <Text size="xs" fw={600}>
                —
              </Text>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
        <Link
          href="/wellness"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline no-underline"
        >
          Check in <IconArrowRight size={12} />
        </Link>
      </Stack>
    </PremiumCard>
  );
}

function FinanceWidget({ financeSummary }: { financeSummary: DashboardContentProps["financeSummary"] }) {
  return (
    <StatCard
      label="Monthly Finances"
      value={`₹${financeSummary.monthlySpending.toLocaleString()}`}
      subtitle={`Income: ₹${financeSummary.monthlyIncome.toLocaleString()}`}
      icon={IconCoin}
      color="emerald"
      delay={4}
    />
  );
}

function NotesWidget({ noteStats }: { noteStats: DashboardContentProps["noteStats"] }) {
  return (
    <PremiumCard className="h-full">
      <Stack gap={8}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="teal">
            <IconNotes size={16} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={600}>
              Notes
            </Text>
            <Text size="xs" c="dimmed">
              {noteStats.totalNotes} total
            </Text>
          </div>
        </Group>
        {noteStats.recentNotes && noteStats.recentNotes.length > 0 ? (
          <Stack gap={4}>
            {noteStats.recentNotes.slice(0, 3).map((note: any) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="no-underline text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 truncate"
              >
                {note.title}
              </Link>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            No notes yet
          </Text>
        )}
        <Link
          href="/notes"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline no-underline"
        >
          View all <IconArrowRight size={12} />
        </Link>
      </Stack>
    </PremiumCard>
  );
}

function ActivityWidget({ upcomingEvents }: { upcomingEvents: any[] }) {
  return (
    <PremiumCard className="h-full">
      <Stack gap={10}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="blue">
            <IconTimelineEvent size={16} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            Upcoming Timeline
          </Text>
        </Group>
        {upcomingEvents.length > 0 ? (
          <Stack gap={6}>
            {upcomingEvents.slice(0, 4).map((event: any) => (
              <Group key={event.id} gap={10} wrap="nowrap">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                    event.importance === "critical"
                      ? "bg-red-500"
                      : event.importance === "high"
                        ? "bg-amber-500"
                        : "bg-blue-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <Text size="xs" fw={500} truncate>
                    {event.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {dayjs(event.eventDate).format("MMM D, YYYY")}
                    {event.startTime && ` · ${event.startTime}`}
                  </Text>
                </div>
                {event.category && (
                  <PremiumBadge size="xs" color="gray" variant="light">
                    {event.category}
                  </PremiumBadge>
                )}
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            No upcoming events
          </Text>
        )}
      </Stack>
    </PremiumCard>
  );
}

function WeeklyChartWidget({ habitSummary }: { habitSummary: DashboardContentProps["habitSummary"] }) {
  return (
    <PremiumCard className="h-full">
      <Stack gap={10}>
        <Group gap={8}>
          <ThemeIcon size={32} radius="lg" variant="light" color="indigo">
            <IconChartBar size={16} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={600}>
              Habits
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {habitSummary.completedToday} done today
            </Text>
          </div>
        </Group>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFlame size={20} className="text-orange-500" />
            <Stack gap={0}>
              <Text fw={700} className="text-lg leading-none">
                {habitSummary.currentStreak}
              </Text>
              <Text size="xs" c="dimmed">
                day streak
              </Text>
            </Stack>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-white/[0.08]" />
          <Stack gap={0}>
            <Text fw={700} className="text-lg leading-none">
              {habitSummary.totalHabits}
            </Text>
            <Text size="xs" c="dimmed">
              total habits
            </Text>
          </Stack>
          <div className="w-px h-10 bg-gray-200 dark:bg-white/[0.08]" />
          <Stack gap={0}>
            <Text fw={700} className="text-lg leading-none">
              {habitSummary.longestStreak}
            </Text>
            <Text size="xs" c="dimmed">
              best streak
            </Text>
          </Stack>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-white/[0.08] flex-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${habitSummary.totalHabits > 0 ? (habitSummary.completedToday / habitSummary.totalHabits) * 100 : 0}%`,
              }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
            />
          </div>
          <Text size="xs" fw={600} c="dimmed">
            {habitSummary.totalHabits > 0
              ? Math.round((habitSummary.completedToday / habitSummary.totalHabits) * 100)
              : 0}
            %
          </Text>
        </div>
        <Link
          href="/habits"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline no-underline"
        >
          View all habits <IconArrowRight size={12} />
        </Link>
      </Stack>
    </PremiumCard>
  );
}

export function DashboardContent({
  taskSummary,
  habitSummary,
  goalOverview,
  lifeStats,
  upcomingEvents,
  noteStats,
  financeSummary,
}: DashboardContentProps) {
  return (
    <Stack gap="lg" className="pb-8">
      <PageHeader title="Dashboard" subtitle={`Your ${APP_NAME} overview`} />

      <div className="space-y-5">
        {/* Welcome Banner */}
        <WelcomeWidget />

        {/* Countdown widget */}
        <NearestCountdownWidget />

        {/* First row: Focus + Quick Actions */}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TodayFocusWidget />
          <QuickActionsWidget />
        </SimpleGrid>

        {/* Stat cards row */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <TaskStatsWidget taskSummary={taskSummary} />
          <KnowledgeWidget lifeStats={lifeStats} />
          <GoalsWidget goalOverview={goalOverview} />
          <FinanceWidget financeSummary={financeSummary} />
        </SimpleGrid>

        {/* Middle row: Calendar + Habits + Notes + Wellness */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <CalendarWidget upcomingEvents={upcomingEvents} />
          <WeeklyChartWidget habitSummary={habitSummary} />
          <NotesWidget noteStats={noteStats} />
          <WellnessWidget />
        </SimpleGrid>

        {/* Bottom: Activity Timeline (full width) */}
        <ActivityWidget upcomingEvents={upcomingEvents} />
      </div>
    </Stack>
  );
}
