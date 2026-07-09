"use client";

import { Stack, Group, Text, Paper, SimpleGrid, RingProgress, Badge, Button, ThemeIcon, Tooltip, Alert, Box } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconFlame,
  IconTrendingUp,
  IconChartBar,
  IconCalendarDue,
  IconRefresh,
  IconCircleCheck,
  IconCircleDashed,
  IconSparkles,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { PageHeader } from "@/components/ui/page-header";

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string }) {
  return (
    <Paper withBorder p="md" radius="lg" style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <ThemeIcon size="lg" radius="md" color={color} variant="light">
        {icon}
      </ThemeIcon>
      <Box>
        <Text size="xs" c="dimmed">{title}</Text>
        <Text fw={700} size="xl" lh={1}>{value}</Text>
        {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
      </Box>
    </Paper>
  );
}

function ActivityCard({ activity, onComplete }: { activity: any; onComplete: (habitId: string) => void }) {
  const isOverdue = activity.nextDueDate && activity.nextDueDate < dayjs().format("YYYY-MM-DD") && !activity.isCompletedToday;
  const isUpcoming = activity.nextDueDate && activity.nextDueDate === dayjs().format("YYYY-MM-DD") && !activity.isCompletedToday;

  return (
    <Paper withBorder p="sm" radius="md" style={{ display: "flex", alignItems: "center", gap: 12, opacity: activity.isArchived ? 0.5 : 1 }}>
      <ThemeIcon size="md" radius="xl" color={activity.isCompletedToday ? "green" : isOverdue ? "red" : isUpcoming ? "yellow" : "gray"} variant={activity.isCompletedToday ? "filled" : "light"}>
        {activity.isCompletedToday ? <IconCircleCheck size={16} /> : <IconCircleDashed size={16} />}
      </ThemeIcon>
      <Box style={{ flex: 1 }}>
        <Text size="sm" fw={600}>{activity.habit?.title}</Text>
        {activity.preferredTime && <Text size="xs" c="dimmed">{activity.preferredTime}</Text>}
      </Box>
      {isOverdue && <Badge color="red" size="sm">Overdue</Badge>}
      {isUpcoming && <Badge color="yellow" size="sm">Today</Badge>}
      {!activity.isCompletedToday && (
        <Button size="xs" color={isOverdue ? "red" : "green"} onClick={() => onComplete(activity.habitId)}>
          Complete
        </Button>
      )}
      {activity.isCompletedToday && (
        <ThemeIcon color="green" variant="light" radius="xl">
          <IconCheck size={14} />
        </ThemeIcon>
      )}
    </Paper>
  );
}

export function DashboardTab() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["wellness", "grooming", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["wellness", "grooming", "activities"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/activities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch("/api/wellness/grooming/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completedDate: dayjs().format("YYYY-MM-DD") }),
      });
      if (!res.ok) throw new Error("Failed to complete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness", "grooming"] });
      notifications.show({ title: "Completed!", message: "Grooming activity logged", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to complete activity", color: "red" });
    },
  });

  if (isLoading) {
    return (
      <Stack>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper key={i} withBorder p="md" radius="lg">
              <Box style={{ height: 80 }} />
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  const todayActivityList = activities?.filter((a: any) => !a.isArchived) ?? [];
  const overdueActivities = todayActivityList.filter((a: any) => a.nextDueDate && a.nextDueDate < dayjs().format("YYYY-MM-DD") && !a.isCompletedToday);
  const todayDueActivities = todayActivityList.filter((a: any) => {
    if (a.isCompletedToday) return true;
    if (a.habit?.frequencyType === "daily") return true;
    if (a.nextDueDate && a.nextDueDate <= dayjs().format("YYYY-MM-DD")) return true;
    return false;
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <PageHeader title="Grooming Dashboard" subtitle="Track your personal care routine" />
        <Button variant="light" leftSection={<IconSparkles size={16} />} onClick={async () => {
          try {
            const res = await fetch("/api/wellness/grooming/templates", { method: "POST" });
            const result = await res.json();
            notifications.show({ title: "Templates Loaded", message: `${result.count} grooming activities added`, color: "green" });
            queryClient.invalidateQueries({ queryKey: ["wellness", "grooming"] });
          } catch {
            notifications.show({ title: "Error", message: "Failed to load templates", color: "red" });
          }
        }}>
          Load Defaults
        </Button>
      </Group>

      {overdueActivities.length > 0 && (
        <Alert icon={<IconAlertTriangle size={16} />} color="red" title={`${overdueActivities.length} Overdue ${overdueActivities.length === 1 ? "Activity" : "Activities"}`}>
          {overdueActivities.slice(0, 3).map((a: any) => a.habit?.title).join(", ")}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
        <StatCard title="Today" value={stats?.completedToday ?? 0} icon={<IconCheck size={20} />} color="green" subtitle="completed" />
        <StatCard title="This Week" value={stats?.completedThisWeek ?? 0} icon={<IconTrendingUp size={20} />} color="blue" />
        <StatCard title="Overdue" value={stats?.overdueCount ?? 0} icon={<IconAlertTriangle size={20} />} color="red" />
        <StatCard title="Current Streak" value={stats?.currentStreak ?? 0} icon={<IconFlame size={20} />} color="orange" subtitle="days" />
        <StatCard title="Longest Streak" value={stats?.longestStreak ?? 0} icon={<IconChartBar size={20} />} color="violet" subtitle="days" />
        <StatCard title="Grooming Score" value={stats?.groomingScore ?? 0} icon={<IconCalendarDue size={20} />} color="teal" />
      </SimpleGrid>

      <Paper withBorder p="md" radius="lg">
        <Group mb="sm">
          <IconCheck size={18} />
          <Text fw={600}>Today's Grooming</Text>
          <Badge ml="auto">{todayDueActivities.filter((a: any) => a.isCompletedToday).length}/{todayDueActivities.length}</Badge>
        </Group>
        <Stack gap="xs">
          {todayDueActivities.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No grooming activities yet. Click "Load Defaults" to get started.
            </Text>
          )}
          {todayDueActivities.map((activity: any) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onComplete={(habitId) => completeMutation.mutate(habitId)}
            />
          ))}
        </Stack>
      </Paper>

      {stats?.upcomingCount > 0 && (
        <Paper withBorder p="md" radius="lg">
          <Group mb="sm">
            <IconCalendarDue size={18} />
            <Text fw={600}>Upcoming</Text>
            <Badge ml="auto" color="yellow">{stats.upcomingCount}</Badge>
          </Group>
          <Stack gap="xs">
            {stats.upcomingActivities?.map((activity: any) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onComplete={(habitId) => completeMutation.mutate(habitId)}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
