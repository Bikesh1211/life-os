"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Title,
  SimpleGrid,
  Group,
  Stack,
  Badge,
  Skeleton,
  RingProgress,
  Card,
} from "@mantine/core";
import {
  IconBriefcase,
  IconSend,
  IconCertificate,
  IconStar,
  IconCoin,
  IconMicrophone,
  IconCode,
  IconTrendingUp,
} from "@tabler/icons-react";

interface DashboardData {
  currentPosition: string | null;
  company: string | null;
  yearsOfExperience: number | null;
  careerLevel: string | null;
  targetRole: string | null;
  dreamCompany: string | null;
  totalApplications: number;
  activeApplications: number;
  upcomingInterviews: number;
  interviewSuccessRate: number;
  applicationSuccessRate: number;
  activeCertifications: number;
  skillScore: number;
  totalCompensation: number;
  completedAchievements: number;
  completedPrepItems: number;
  totalPrepItems: number;
  totalProjects: number;
  totalSalaryRecords: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof IconBriefcase;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group align="flex-start">
        <Icon size={24} color={`var(--mantine-color-${color}-6)`} />
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/career")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load dashboard");
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={100} />
        <Skeleton height={200} />
        <Skeleton height={160} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Paper withBorder p="xl" radius="md" ta="center">
        <Text c="dimmed" size="lg">
          Failed to load dashboard
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          {error}
        </Text>
      </Paper>
    );
  }

  if (!data) {
    return <Text c="dimmed">Failed to load dashboard.</Text>;
  }

  return (
    <Stack gap="lg">
      {data.currentPosition && (
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Title order={3}>{data.currentPosition}</Title>
              {data.company && (
                <Text size="lg" c="dimmed">
                  {data.company}
                </Text>
              )}
              <Group gap="xs" mt="xs">
                {data.yearsOfExperience && (
                  <Badge variant="light">{data.yearsOfExperience} years exp</Badge>
                )}
                {data.careerLevel && <Badge variant="light">{data.careerLevel}</Badge>}
              </Group>
            </Stack>
            <Stack gap={0} align="flex-end">
              {data.targetRole && (
                <Text size="sm" c="dimmed">
                  Target: {data.targetRole}
                </Text>
              )}
              {data.dreamCompany && (
                <Text size="sm" c="dimmed">
                  Dream: {data.dreamCompany}
                </Text>
              )}
            </Stack>
          </Group>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        <StatCard icon={IconBriefcase} label="Active Apps" value={data.activeApplications ?? 0} color="blue" />
        <StatCard icon={IconSend} label="Total Apps" value={data.totalApplications ?? 0} color="cyan" />
        <StatCard icon={IconMicrophone} label="Upcoming Interviews" value={data.upcomingInterviews ?? 0} color="violet" />
        <StatCard icon={IconCertificate} label="Certifications" value={data.activeCertifications ?? 0} color="green" />
        <StatCard icon={IconStar} label="Achievements" value={data.completedAchievements ?? 0} color="yellow" />
        <StatCard icon={IconCoin} label="Total Comp" value={`$${(data.totalCompensation ?? 0).toLocaleString()}`} color="teal" />
        <StatCard icon={IconCode} label="Projects" value={data.totalProjects ?? 0} color="orange" />
        <StatCard icon={IconTrendingUp} label="Interview Success" value={`${data.interviewSuccessRate ?? 0}%`} color="pink" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder padding="lg" radius="md">
          <Group mb="md">
            <IconTrendingUp size={20} />
            <Text fw={600}>Skill Score</Text>
          </Group>
          <Group justify="center">
            <RingProgress
              size={140}
              thickness={16}
              sections={[{ value: data.skillScore ?? 0, color: (data.skillScore ?? 0) > 60 ? "green" : "orange" }]}
              label={
                <Text ta="center" fw={700} size="xl">
                  {data.skillScore ?? 0}%
                </Text>
              }
            />
          </Group>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group mb="md">
            <IconMicrophone size={20} />
            <Text fw={600}>Interview Prep Progress</Text>
          </Group>
          <Group justify="center">
            <RingProgress
              size={140}
              thickness={16}
              sections={[
                {
                  value: (data.totalPrepItems ?? 0) > 0 ? ((data.completedPrepItems ?? 0) / (data.totalPrepItems ?? 1)) * 100 : 0,
                  color: "violet",
                },
              ]}
              label={
                <Text ta="center" fw={700} size="xl">
                  {(data.totalPrepItems ?? 0) > 0
                    ? Math.round(((data.completedPrepItems ?? 0) / (data.totalPrepItems ?? 1)) * 100)
                    : 0}
                  %
                </Text>
              }
            />
          </Group>
          <Text ta="center" size="sm" c="dimmed" mt="xs">
            {data.completedPrepItems ?? 0} / {data.totalPrepItems ?? 0} questions
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
