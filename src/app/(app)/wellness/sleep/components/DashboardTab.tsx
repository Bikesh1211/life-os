"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  RingProgress,
  Badge,
  Button,
  ThemeIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBed,
  IconSunrise,
  IconSunset,
  IconTargetArrow,
  IconFlame,
  IconCalendarWeek,
  IconCalendarMonth,
  IconPlus,
  IconRefresh,
  IconMoon,
} from "@tabler/icons-react";

type DashboardData = {
  totalSleepHours: number;
  totalSleepMinutes: number;
  bedTime: string | null;
  wakeTime: string | null;
  sleepQuality: number | null;
  goalPercentage: number;
  remainingHours: number;
  sleepGoalHours: number;
  avgSleepThisWeek: number;
  avgSleepThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  totalNights: number;
  mainSleepId: string | null;
};

function formatTime(dateStr: string | null) {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function SleepLogForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const now = new Date();
  const defaultBed = new Date(now.getTime() - 8 * 3600000).toISOString().slice(0, 16);
  const defaultWake = now.toISOString().slice(0, 16);

  const [bedtime, setBedtime] = useState(defaultBed);
  const [wakeTime, setWakeTime] = useState(defaultWake);
  const [quality, setQuality] = useState<number | "">(7);
  const [interruptions, setInterruptions] = useState<number | "">(0);
  const [sleepLatency, setSleepLatency] = useState<number | "">("");
  const [moodAfterWaking, setMoodAfterWaking] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!bedtime || !wakeTime) return;
    setSaving(true);
    try {
      await fetch("/api/wellness/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: new Date(bedtime).toISOString(),
          wakeTime: new Date(wakeTime).toISOString(),
          quality: quality || undefined,
          interruptions: interruptions || 0,
          sleepLatencyMinutes: sleepLatency || undefined,
          moodAfterWaking: moodAfterWaking || undefined,
          energyLevel: energyLevel || undefined,
          notes: notes || undefined,
        }),
      });
      onClose();
      onSaved();
    } catch {} finally {
      setSaving(false);
    }
  }, [bedtime, wakeTime, quality, interruptions, sleepLatency, moodAfterWaking, energyLevel, notes, onClose, onSaved]);

  return (
    <Stack gap="md">
      <TextInput
        label="Bed Time"
        type="datetime-local"
        value={bedtime}
        onChange={(e) => setBedtime(e.currentTarget.value)}
        required
      />
      <TextInput
        label="Wake Time"
        type="datetime-local"
        value={wakeTime}
        onChange={(e) => setWakeTime(e.currentTarget.value)}
        required
      />
      <SimpleGrid cols={2} spacing="sm">
        <div>
          <Text size="sm" fw={500} mb={4}>Quality (1-10)</Text>
          <NumberInput
            value={quality}
            onChange={(v) => setQuality(v as number)}
            min={1}
            max={10}
          />
        </div>
        <div>
          <Text size="sm" fw={500} mb={4}>Interruptions</Text>
          <NumberInput
            value={interruptions}
            onChange={(v) => setInterruptions(v as number)}
            min={0}
            max={50}
          />
        </div>
      </SimpleGrid>
      <SimpleGrid cols={2} spacing="sm">
        <div>
          <Text size="sm" fw={500} mb={4}>Time to Fall Asleep (min)</Text>
          <NumberInput
            value={sleepLatency}
            onChange={(v) => setSleepLatency(v as number)}
            min={0}
            max={480}
          />
        </div>
        <div>
          <Text size="sm" fw={500} mb={4}>Energy Level (1-5)</Text>
          <NumberInput
            value={energyLevel}
            onChange={(v) => setEnergyLevel(v as number)}
            min={1}
            max={5}
          />
        </div>
      </SimpleGrid>
      <Select
        label="Mood After Waking"
        placeholder="Select mood"
        data={[
          { value: "great", label: "😊 Great" },
          { value: "good", label: "🙂 Good" },
          { value: "okay", label: "😐 Okay" },
          { value: "tired", label: "😴 Tired" },
          { value: "exhausted", label: "😫 Exhausted" },
        ]}
        value={moodAfterWaking}
        onChange={setMoodAfterWaking}
        clearable
      />
      <TextInput
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        placeholder="How did you sleep?"
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Sleep
      </Button>
    </Stack>
  );
}

function StatCard({ label, value, subtitle, icon: Icon, color }: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}) {
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" wrap="nowrap" mb={4}>
        <Text size="xs" tt="uppercase" c="dimmed" fw={600}>{label}</Text>
        <ThemeIcon variant="light" color={color} size="sm" radius="xl">
          <Icon size={14} />
        </ThemeIcon>
      </Group>
      <Text size="xl" fw={700}>{value}</Text>
      {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
    </Paper>
  );
}

export function DashboardTab() {
  const [logOpen, { open: openLog, close: closeLog }] = useDisclosure(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wellness/sleep/dashboard");
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={200} radius="md" />
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>Sleep Today</Text>
          <Text size="sm" c="dimmed">Track your sleep patterns</Text>
        </div>
        <Group gap={4}>
          <Button size="sm" leftSection={<IconPlus size={14} />} onClick={openLog}>
            Log Sleep
          </Button>
          <ActionIcon variant="subtle" onClick={fetchDashboard}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {!data || data.totalNights === 0 ? (
        <Paper withBorder p="xl" className="text-center">
          <ThemeIcon variant="light" color="indigo" size="xl" radius="xl" mx="auto" mb="md">
            <IconBed size={24} />
          </ThemeIcon>
          <Text size="lg" fw={600} mb={4}>No sleep data yet</Text>
          <Text size="sm" c="dimmed" mb="md">Log your first sleep session to see your dashboard.</Text>
          <Button onClick={openLog}>Log Sleep</Button>
        </Paper>
      ) : (
        <>
          {/* Key Metrics */}
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
            <StatCard
              label="Total Sleep"
              value={formatDuration(data.totalSleepHours)}
              icon={IconBed}
              color="indigo"
            />
            <StatCard
              label="Bed Time"
              value={formatTime(data.bedTime)}
              icon={IconSunset}
              color="violet"
            />
            <StatCard
              label="Wake Up"
              value={formatTime(data.wakeTime)}
              icon={IconSunrise}
              color="blue"
            />
            <StatCard
              label="Sleep Goal"
              value={`${data.goalPercentage}%`}
              subtitle={`${data.remainingHours}h remaining`}
              icon={IconTargetArrow}
              color="teal"
            />
            <StatCard
              label="Quality"
              value={data.sleepQuality ? `${data.sleepQuality}/100` : "--"}
              icon={IconFlame}
              color="orange"
            />
            <StatCard
              label="Streak"
              value={`${data.currentStreak} days`}
              subtitle={`Best: ${data.longestStreak}`}
              icon={IconMoon}
              color="grape"
            />
            <StatCard
              label="Avg This Week"
              value={formatDuration(data.avgSleepThisWeek)}
              icon={IconCalendarWeek}
              color="cyan"
            />
            <StatCard
              label="Avg This Month"
              value={formatDuration(data.avgSleepThisMonth)}
              icon={IconCalendarMonth}
              color="lime"
            />
          </SimpleGrid>

          {/* Goal Progress Ring */}
          <Paper withBorder p="lg" className="text-center">
            <RingProgress
              size={140}
              thickness={14}
              roundCaps
              sections={[{ value: data.goalPercentage, color: data.goalPercentage >= 100 ? "teal" : "blue" }]}
              label={
                <div>
                  <Text size="2rem" fw={700}>{data.goalPercentage}%</Text>
                  <Text size="xs" c="dimmed">of {data.sleepGoalHours}h goal</Text>
                </div>
              }
            />
            <Text size="sm" c="dimmed" mt="sm">
              {data.remainingHours > 0
                ? `${data.remainingHours}h more to reach your goal`
                : "Sleep goal achieved! 🎉"}
            </Text>
          </Paper>
        </>
      )}

      <Modal opened={logOpen} onClose={closeLog} title="Log Sleep" size="md" centered>
        <SleepLogForm onClose={closeLog} onSaved={fetchDashboard} />
      </Modal>
    </Stack>
  );
}
