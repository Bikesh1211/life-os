"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Progress,
  NumberInput,
  Button,
  Divider,
} from "@mantine/core";
import {
  IconBulb,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconTargetArrow,
  IconTrophy,
  IconMoon,
} from "@tabler/icons-react";

type Insight = {
  type: "positive" | "negative" | "info";
  message: string;
  category: string;
};

export function InsightsTab() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [goalInput, setGoalInput] = useState<number | "">(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [insightsRes, goalRes] = await Promise.all([
        fetch("/api/wellness/sleep/insights"),
        fetch("/api/wellness/sleep/preferences"),
      ]);
      if (insightsRes.ok) setInsights(await insightsRes.json());
      if (goalRes.ok) {
        const goal = await goalRes.json();
        setSleepGoal(goal.sleepGoalHours);
        setGoalInput(goal.sleepGoalHours);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveGoal = useCallback(async () => {
    if (!goalInput) return;
    setSaving(true);
    try {
      const res = await fetch("/api/wellness/sleep/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sleepGoalHours: goalInput }),
      });
      if (res.ok) {
        setSleepGoal(Number(goalInput));
        fetchData();
      }
    } catch {} finally {
      setSaving(false);
    }
  }, [goalInput, fetchData]);

  const insightColors: Record<string, string> = {
    positive: "teal",
    negative: "red",
    info: "blue",
  };
  const insightIcons: Record<string, React.ComponentType<{ size?: number }>> = {
    positive: IconCheck,
    negative: IconAlertTriangle,
    info: IconInfoCircle,
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="xl" fw={700}>Insights</Text>
        <Text size="sm" c="dimmed">Sleep patterns and recommendations</Text>
      </div>

      {/* Sleep Goal Configuration */}
      <Paper withBorder p="md">
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <ThemeIcon variant="light" color="indigo" size="sm" radius="xl">
              <IconTargetArrow size={14} />
            </ThemeIcon>
            <Text fw={600}>Sleep Goal</Text>
          </Group>
          <Text fw={700} size="lg">{sleepGoal} hours</Text>
        </Group>
        <Group gap="sm">
          <NumberInput
            value={goalInput}
            onChange={(v) => setGoalInput(v as number)}
            min={1}
            max={24}
            style={{ width: 100 }}
            size="sm"
          />
          <Button size="sm" onClick={handleSaveGoal} loading={saving}>
            Save
          </Button>
        </Group>
      </Paper>

      {/* Rule-Based Insights */}
      {insights.length > 0 ? (
        <Stack gap="sm">
          <Group gap="xs">
            <IconBulb size={16} />
            <Text fw={600}>Observations</Text>
          </Group>
          {insights.map((insight, i) => {
            const Icon = insightIcons[insight.type] ?? IconInfoCircle;
            const color = insightColors[insight.type] ?? "blue";
            return (
              <Alert key={i} icon={<Icon size={16} />} color={color} variant="light" py="sm" px="md">
                <Text size="sm">{insight.message}</Text>
              </Alert>
            );
          })}
        </Stack>
      ) : (
        !loading && (
          <Paper withBorder p="xl" className="text-center">
            <ThemeIcon variant="light" color="indigo" size="xl" radius="xl" mx="auto" mb="md">
              <IconBulb size={24} />
            </ThemeIcon>
            <Text size="lg" fw={600} mb={4}>No insights yet</Text>
            <Text size="sm" c="dimmed">
              Log at least a few days of sleep to get personalized insights.
            </Text>
          </Paper>
        )
      )}

      {/* Achievements Placeholder */}
      <Divider label="Achievements" labelPosition="center" />

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        <AchievementCard
          title="First Night"
          description="Log your first sleep session"
          icon={IconMoon}
          unlocked={false}
        />
        <AchievementCard
          title="7-Day Streak"
          description="Meet your sleep goal for 7 days"
          icon={IconTrophy}
          unlocked={false}
        />
        <AchievementCard
          title="30-Day Streak"
          description="Meet your sleep goal for 30 days"
          icon={IconTrophy}
          unlocked={false}
        />
        <AchievementCard
          title="100 Hours"
          description="Sleep 100 hours total"
          icon={IconMoon}
          unlocked={false}
        />
      </SimpleGrid>
      <Text size="xs" c="dimmed" ta="center">
        Achievements will be unlocked as you track your sleep.
      </Text>
    </Stack>
  );
}

function AchievementCard({
  title,
  description,
  icon: Icon,
  unlocked,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  unlocked: boolean;
}) {
  return (
    <Paper
      withBorder
      p="md"
      className="text-center"
      style={{ opacity: unlocked ? 1 : 0.5 }}
    >
      <ThemeIcon
        variant={unlocked ? "filled" : "light"}
        color={unlocked ? "yellow" : "gray"}
        size="lg"
        radius="xl"
        mx="auto"
        mb="xs"
      >
        <Icon size={20} />
      </ThemeIcon>
      <Text size="sm" fw={600}>{title}</Text>
      <Text size="xs" c="dimmed">{description}</Text>
    </Paper>
  );
}
