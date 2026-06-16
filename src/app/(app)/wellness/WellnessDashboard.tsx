"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  SimpleGrid,
  RingProgress,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Divider,
  Timeline,
  Alert,
  ScrollArea,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMoodSmile,
  IconBed,
  IconDroplet,
  IconHeart,
  IconScissors,
  IconSparkles,
  IconSun,
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import type {
  WellnessScores,
  WellnessInsight,
  WellnessMoodLog,
  WellnessSleepRecord,
  WellnessConfidenceCheckin,
  WellnessHabitEnrichment,
} from "@/modules/wellness";

type WellnessDashboardProps = {
  scores: WellnessScores;
  insights: WellnessInsight[];
  recentMoods: WellnessMoodLog[];
  recentSleep: WellnessSleepRecord[];
  recentConfidence: WellnessConfidenceCheckin[];
  overdueEnrichments: WellnessHabitEnrichment[];
};

function ScoreCard({ label, score, icon: Icon, color }: {
  label: string;
  score: number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}) {
  return (
    <Paper withBorder p="md" className="text-center">
      <RingProgress
        size={100}
        thickness={10}
        roundCaps
        sections={[{ value: score, color }]}
        label={
          <Text size="xl" fw={700} className="text-center">
            {score}
          </Text>
        }
      />
      <Group gap={4} justify="center" mt="xs">
        <Icon size={14} />
        <Text size="sm" fw={500}>{label}</Text>
      </Group>
    </Paper>
  );
}

function MoodLogForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Record<string, number>>({
    happiness: 7, stress: 4, anxiety: 3, motivation: 6,
    energy: 6, confidence: 6, focus: 6, mentalFatigue: 4,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/wellness/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [form, onClose]);

  const dims = [
    "happiness", "stress", "anxiety", "motivation",
    "energy", "confidence", "focus", "mentalFatigue",
  ];

  return (
    <Stack gap="md">
      <SimpleGrid cols={2} spacing="sm">
        {dims.map((dim) => (
          <div key={dim}>
            <Text size="xs" tt="capitalize" fw={500} mb={2}>{dim}</Text>
            <input
              type="range"
              min={1}
              max={10}
              value={form[dim]}
              onChange={(e) => setForm({ ...form, [dim]: Number(e.target.value) })}
              className="w-full"
            />
            <Text size="xs" c="dimmed" ta="right">{form[dim]}/10</Text>
          </div>
        ))}
      </SimpleGrid>
      <Button fullWidth onClick={handleSave} loading={saving}>
        Save Mood
      </Button>
    </Stack>
  );
}

function SleepLogForm({ onClose }: { onClose: () => void }) {
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState(7);
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
          quality,
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [bedtime, wakeTime, quality, onClose]);

  return (
    <Stack gap="md">
      <TextInput
        label="Bedtime"
        type="datetime-local"
        value={bedtime}
        onChange={(e) => setBedtime(e.currentTarget.value)}
      />
      <TextInput
        label="Wake Time"
        type="datetime-local"
        value={wakeTime}
        onChange={(e) => setWakeTime(e.currentTarget.value)}
      />
      <div>
        <Text size="sm" fw={500} mb={2}>Quality</Text>
        <input
          type="range"
          min={1}
          max={10}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full"
        />
        <Text size="xs" c="dimmed" ta="right">{quality}/10</Text>
      </div>
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Sleep
      </Button>
    </Stack>
  );
}

function HydrationLogForm({ onClose }: { onClose: () => void }) {
  const [amountMl, setAmountMl] = useState(250);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/wellness/hydration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          amountMl,
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [amountMl, onClose]);

  return (
    <Stack gap="md">
      <Group gap="xs">
        {[100, 200, 250, 300, 500].map((ml) => (
          <Button
            key={ml}
            variant={amountMl === ml ? "filled" : "light"}
            size="sm"
            onClick={() => setAmountMl(ml)}
          >
            {ml}ml
          </Button>
        ))}
      </Group>
      <Text size="sm" fw={500}>Custom: {amountMl}ml</Text>
      <input
        type="range"
        min={50}
        max={1000}
        step={50}
        value={amountMl}
        onChange={(e) => setAmountMl(Number(e.target.value))}
        className="w-full"
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Water
      </Button>
    </Stack>
  );
}

function ConfidenceLogForm({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(7);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/wellness/confidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          score,
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [score, onClose]);

  return (
    <Stack gap="md" align="center">
      <Text size="lg" fw={600}>How confident do you feel today?</Text>
      <Group gap={4}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <ActionIcon
            key={n}
            variant={score === n ? "filled" : "light"}
            size="lg"
            onClick={() => setScore(n)}
          >
            {n}
          </ActionIcon>
        ))}
      </Group>
      <Button fullWidth onClick={handleSave} loading={saving}>
        Check In
      </Button>
    </Stack>
  );
}

function InsightCard({ insight }: { insight: WellnessInsight }) {
  const colors: Record<string, string> = {
    positive: "teal",
    negative: "red",
    info: "blue",
  };
  const icons: Record<string, React.ComponentType<{ size?: number }>> = {
    positive: IconCheck,
    negative: IconAlertTriangle,
    info: IconInfoCircle,
  };
  const Icon = icons[insight.type] ?? IconInfoCircle;
  const color = colors[insight.type] ?? "blue";

  return (
    <Alert icon={<Icon size={16} />} color={color} variant="light" py="sm" px="md">
      <Text size="sm">{insight.message}</Text>
    </Alert>
  );
}

export function WellnessDashboard({
  scores,
  insights,
  recentMoods,
  recentSleep,
  recentConfidence,
  overdueEnrichments,
}: WellnessDashboardProps) {
  const [moodOpen, { open: openMood, close: closeMood }] = useDisclosure(false);
  const [sleepOpen, { open: openSleep, close: closeSleep }] = useDisclosure(false);
  const [hydrationOpen, { open: openHydration, close: closeHydration }] = useDisclosure(false);
  const [confidenceOpen, { open: openConfidence, close: closeConfidence }] = useDisclosure(false);

  const scoreCards = [
    { label: "Mood", score: scores.mood, icon: IconMoodSmile, color: "violet" },
    { label: "Sleep", score: scores.sleep, icon: IconBed, color: "indigo" },
    { label: "Hydration", score: scores.hydration, icon: IconDroplet, color: "blue" },
    { label: "Grooming", score: scores.grooming, icon: IconScissors, color: "teal" },
    { label: "Hygiene", score: scores.hygiene, icon: IconSparkles, color: "green" },
    { label: "Self-Care", score: scores.selfCare, icon: IconSun, color: "yellow" },
    { label: "Confidence", score: scores.confidence, icon: IconHeart, color: "pink" },
  ];

  return (
    <Stack gap="md" className="h-full p-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>
            Wellness
          </Text>
          <Text size="sm" c="dimmed">
            Track your mood, sleep, hydration, grooming & self-care
          </Text>
        </div>
        <Group gap={4}>
          <Tooltip label="Refresh">
            <ActionIcon variant="subtle" onClick={() => window.location.reload()}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Overall Score */}
      <Paper withBorder p="lg" className="text-center">
        <RingProgress
          size={160}
          thickness={16}
          roundCaps
          sections={[{ value: scores.overall, color: "blue" }]}
          label={
            <div>
              <Text size="3rem" fw={700}>
                {scores.overall}
              </Text>
              <Text size="xs" c="dimmed">
                Wellness Score
              </Text>
            </div>
          }
        />
        <Group gap={4} justify="center" mt="md">
          <Button size="sm" variant="light" leftSection={<IconMoodSmile size={14} />} onClick={openMood}>
            Log Mood
          </Button>
          <Button size="sm" variant="light" leftSection={<IconBed size={14} />} onClick={openSleep}>
            Log Sleep
          </Button>
          <Button size="sm" variant="light" leftSection={<IconDroplet size={14} />} onClick={openHydration}>
            Log Water
          </Button>
          <Button size="sm" variant="light" leftSection={<IconHeart size={14} />} onClick={openConfidence}>
            Check In
          </Button>
        </Group>
      </Paper>

      {/* Overdue Enrichments */}
      {overdueEnrichments.length > 0 && (
        <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
          <Text size="sm" fw={500}>
            {overdueEnrichments.length} wellness {overdueEnrichments.length === 1 ? "activity is" : "activities are"} overdue:
          </Text>
          {overdueEnrichments.map((e) => (
            <Text key={e.id} size="sm">
              • {(e.subcategory || e.wellnessType)}
              {e.nextDueDate && ` (due ${e.nextDueDate})`}
            </Text>
          ))}
        </Alert>
      )}

      {/* Sub-Scores */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing="md">
        {scoreCards.map((card) => (
          <ScoreCard key={card.label} {...card} />
        ))}
      </SimpleGrid>

      {/* Insights */}
      {insights.length > 0 && (
        <Stack gap="sm">
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">Insights</Text>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </Stack>
      )}

      {/* Recent Activity */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Recent Mood {recentMoods.length > 0 && `(${recentMoods.length})`}</Text>
          {recentMoods.length === 0 ? (
            <Text size="xs" c="dimmed">No mood logs this week.</Text>
          ) : (
            <Timeline active={recentMoods.length - 1} bulletSize={20} lineWidth={2}>
              {recentMoods.slice(0, 5).map((m) => (
                <Timeline.Item key={m.id} title={`Happiness: ${m.happiness}/10`}>
                  <Text size="xs" c="dimmed">{new Date(m.loggedAt).toLocaleString()}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Paper>

        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Recent Sleep {recentSleep.length > 0 && `(${recentSleep.length})`}</Text>
          {recentSleep.length === 0 ? (
            <Text size="xs" c="dimmed">No sleep logged this week.</Text>
          ) : (
            <Timeline active={recentSleep.length - 1} bulletSize={20} lineWidth={2}>
              {recentSleep.slice(0, 5).map((s) => {
                const duration = Math.round((s.wakeTime.getTime() - s.bedtime.getTime()) / 3600000 * 10) / 10;
                return (
                  <Timeline.Item key={s.id} title={`${duration}h`}>
                    <Text size="xs" c="dimmed">
                      Quality: {s.quality}/10 &middot; {s.bedtime.toLocaleDateString()}
                    </Text>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          )}
        </Paper>

        <Paper withBorder p="md">
          <Text size="sm" fw={600} mb="sm">Recent Confidence {recentConfidence.length > 0 && `(${recentConfidence.length})`}</Text>
          {recentConfidence.length === 0 ? (
            <Text size="xs" c="dimmed">No check-ins this week.</Text>
          ) : (
            <Timeline active={recentConfidence.length - 1} bulletSize={20} lineWidth={2}>
              {recentConfidence.slice(0, 5).map((c) => (
                <Timeline.Item key={c.id} title={`Score: ${c.score}/10`}>
                  <Text size="xs" c="dimmed">{new Date(c.date).toLocaleDateString()}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Paper>
      </SimpleGrid>

      {/* Quick Log Modals */}
      <Modal opened={moodOpen} onClose={closeMood} title="Log Mood" size="md" centered>
        <MoodLogForm onClose={closeMood} />
      </Modal>
      <Modal opened={sleepOpen} onClose={closeSleep} title="Log Sleep" size="sm" centered>
        <SleepLogForm onClose={closeSleep} />
      </Modal>
      <Modal opened={hydrationOpen} onClose={closeHydration} title="Log Water" size="sm" centered>
        <HydrationLogForm onClose={closeHydration} />
      </Modal>
      <Modal opened={confidenceOpen} onClose={closeConfidence} title="Confidence Check-In" size="sm" centered>
        <ConfidenceLogForm onClose={closeConfidence} />
      </Modal>
    </Stack>
  );
}
