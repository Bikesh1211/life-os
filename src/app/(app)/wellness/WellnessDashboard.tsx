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
  NumberInput,
  Divider,
  Alert,
  ThemeIcon,
  Card,
  Progress,
  Anchor,
  Menu,
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
  IconWeight,
  IconRun,
  IconWalk,
  IconFlame,
  IconHeartbeat,
  IconActivity,
  IconPill,
  IconTargetArrow,
  IconTrophy,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";
import type {
  WellnessScores,
  WellnessInsight,
  WellnessMoodLog,
  WellnessSleepRecord,
  WellnessConfidenceCheckin,
  WellnessHabitEnrichment,
  WellnessWeightEntry,
  WellnessWorkoutEntry,
  WellnessStepEntry,
  WellnessCalorieEntry,
  WellnessBloodPressureEntry,
  WellnessHeartRateEntry,
  WellnessMedicineReminder,
  WellnessUserGoal,
  WellnessAchievement,
} from "@/modules/wellness";

type WellnessDashboardProps = {
  scores: WellnessScores;
  insights: WellnessInsight[];
  recentMoods: WellnessMoodLog[];
  recentSleep: WellnessSleepRecord[];
  recentConfidence: WellnessConfidenceCheckin[];
  overdueEnrichments: WellnessHabitEnrichment[];
  recentWeight: WellnessWeightEntry[];
  recentWorkouts: WellnessWorkoutEntry[];
  recentSteps: WellnessStepEntry[];
  recentCalories: WellnessCalorieEntry[];
  recentBp: WellnessBloodPressureEntry[];
  recentHr: WellnessHeartRateEntry[];
  medicineReminders: WellnessMedicineReminder[];
  userGoals: WellnessUserGoal[];
  achievements: WellnessAchievement[];
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
        size={80}
        thickness={8}
        roundCaps
        sections={[{ value: score, color }]}
        label={
          <Text size="lg" fw={700} className="text-center">
            {score}
          </Text>
        }
      />
      <Group gap={4} justify="center" mt="xs">
        <Icon size={12} />
        <Text size="xs" fw={500}>{label}</Text>
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
      await apiFetch("/api/wellness/mood", {
        method: "POST",
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
      await apiFetch("/api/wellness/sleep", {
        method: "POST",
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
      await apiFetch("/api/wellness/hydration", {
        method: "POST",
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
      await apiFetch("/api/wellness/confidence", {
        method: "POST",
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

function WeightLogForm({ onClose }: { onClose: () => void }) {
  const [weightKg, setWeightKg] = useState<number | "">(70);
  const [bodyFat, setBodyFat] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!weightKg) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/weight", {
        method: "POST",
        body: JSON.stringify({
          weightKg: Number(weightKg),
          bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [weightKg, bodyFat, onClose]);

  return (
    <Stack gap="md">
      <NumberInput
        label="Weight (kg)"
        value={weightKg}
        onChange={(v) => setWeightKg(v as number)}
        min={20}
        max={500}
        decimalScale={1}
        required
      />
      <NumberInput
        label="Body Fat %"
        value={bodyFat}
        onChange={(v) => setBodyFat(v as number)}
        min={1}
        max={70}
        decimalScale={1}
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Weight
      </Button>
    </Stack>
  );
}

function WorkoutLogForm({ onClose }: { onClose: () => void }) {
  const [workoutType, setWorkoutType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!workoutType || !durationMinutes) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/workouts", {
        method: "POST",
        body: JSON.stringify({
          workoutType,
          durationMinutes: Number(durationMinutes),
          caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [workoutType, durationMinutes, caloriesBurned, onClose]);

  return (
    <Stack gap="md">
      <TextInput
        label="Workout Type"
        placeholder="Running, Cycling, Yoga..."
        value={workoutType}
        onChange={(e) => setWorkoutType(e.currentTarget.value)}
        required
      />
      <NumberInput
        label="Duration (minutes)"
        value={durationMinutes}
        onChange={(v) => setDurationMinutes(v as number)}
        min={1}
        max={1440}
        required
      />
      <NumberInput
        label="Calories Burned"
        value={caloriesBurned}
        onChange={(v) => setCaloriesBurned(v as number)}
        min={0}
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Workout
      </Button>
    </Stack>
  );
}

function StepsLogForm({ onClose }: { onClose: () => void }) {
  const [steps, setSteps] = useState<number | "">(0);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!steps) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/steps", {
        method: "POST",
        body: JSON.stringify({
          steps: Number(steps),
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [steps, onClose]);

  return (
    <Stack gap="md">
      <NumberInput
        label="Steps"
        value={steps}
        onChange={(v) => setSteps(v as number)}
        min={0}
        max={1000000}
        required
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Steps
      </Button>
    </Stack>
  );
}

function CalorieLogForm({ onClose }: { onClose: () => void }) {
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState<number | "">(0);
  const [proteinG, setProteinG] = useState<number | "">("");
  const [carbsG, setCarbsG] = useState<number | "">("");
  const [fatG, setFatG] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!calories) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/calories", {
        method: "POST",
        body: JSON.stringify({
          mealType,
          calories: Number(calories),
          proteinG: proteinG ? Number(proteinG) : undefined,
          carbsG: carbsG ? Number(carbsG) : undefined,
          fatG: fatG ? Number(fatG) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [mealType, calories, proteinG, carbsG, fatG, onClose]);

  return (
    <Stack gap="md">
      <Group gap="xs">
        {["breakfast", "lunch", "dinner", "snacks"].map((type) => (
          <Button
            key={type}
            variant={mealType === type ? "filled" : "light"}
            size="sm"
            onClick={() => setMealType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </Group>
      <NumberInput
        label="Calories"
        value={calories}
        onChange={(v) => setCalories(v as number)}
        min={0}
        max={10000}
        required
      />
      <SimpleGrid cols={3} spacing="sm">
        <NumberInput label="Protein (g)" value={proteinG} onChange={(v) => setProteinG(v as number)} min={0} />
        <NumberInput label="Carbs (g)" value={carbsG} onChange={(v) => setCarbsG(v as number)} min={0} />
        <NumberInput label="Fat (g)" value={fatG} onChange={(v) => setFatG(v as number)} min={0} />
      </SimpleGrid>
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log Meal
      </Button>
    </Stack>
  );
}

function BpLogForm({ onClose }: { onClose: () => void }) {
  const [systolic, setSystolic] = useState<number | "">(120);
  const [diastolic, setDiastolic] = useState<number | "">(80);
  const [pulse, setPulse] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!systolic || !diastolic) return;
    setSaving(true);
    try {
      await apiFetch("/api/wellness/blood-pressure", {
        method: "POST",
        body: JSON.stringify({
          systolic: Number(systolic),
          diastolic: Number(diastolic),
          pulse: pulse ? Number(pulse) : undefined,
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      onClose();
      window.location.reload();
    } catch { } finally {
      setSaving(false);
    }
  }, [systolic, diastolic, pulse, onClose]);

  return (
    <Stack gap="md">
      <SimpleGrid cols={2} spacing="sm">
        <NumberInput
          label="Systolic"
          value={systolic}
          onChange={(v) => setSystolic(v as number)}
          min={60}
          max={300}
          required
        />
        <NumberInput
          label="Diastolic"
          value={diastolic}
          onChange={(v) => setDiastolic(v as number)}
          min={30}
          max={200}
          required
        />
      </SimpleGrid>
      <NumberInput
        label="Pulse"
        value={pulse}
        onChange={(v) => setPulse(v as number)}
        min={20}
        max={300}
      />
      <Button fullWidth onClick={handleSave} loading={saving}>
        Log BP
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

function QuickAddMenu({ onQuickAdd }: { onQuickAdd: (type: string) => void }) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button size="sm" leftSection={<IconPlus size={14} />}>
          Quick Add
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconMoodSmile size={14} />} onClick={() => onQuickAdd("mood")}>
          Mood
        </Menu.Item>
        <Menu.Item leftSection={<IconBed size={14} />} onClick={() => onQuickAdd("sleep")}>
          Sleep
        </Menu.Item>
        <Menu.Item leftSection={<IconDroplet size={14} />} onClick={() => onQuickAdd("hydration")}>
          Water
        </Menu.Item>
        <Menu.Item leftSection={<IconHeart size={14} />} onClick={() => onQuickAdd("confidence")}>
          Confidence
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconWeight size={14} />} onClick={() => onQuickAdd("weight")}>
          Weight
        </Menu.Item>
        <Menu.Item leftSection={<IconRun size={14} />} onClick={() => onQuickAdd("workout")}>
          Workout
        </Menu.Item>
        <Menu.Item leftSection={<IconWalk size={14} />} onClick={() => onQuickAdd("steps")}>
          Steps
        </Menu.Item>
        <Menu.Item leftSection={<IconFlame size={14} />} onClick={() => onQuickAdd("calories")}>
          Calories
        </Menu.Item>
        <Menu.Item leftSection={<IconHeartbeat size={14} />} onClick={() => onQuickAdd("bp")}>
          Blood Pressure
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, color, href }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  href: string;
}) {
  return (
    <Anchor component={Link} href={href} underline="never">
      <Paper withBorder p="md" className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text size="xs" tt="uppercase" c="dimmed" fw={600}>{title}</Text>
            <Text size="xl" fw={700} className="leading-tight">{value}</Text>
            {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
          </div>
          <ThemeIcon variant="light" color={color} size="lg" radius="xl">
            <Icon size={20} />
          </ThemeIcon>
        </Group>
      </Paper>
    </Anchor>
  );
}

export function WellnessDashboard({
  scores,
  insights,
  recentMoods,
  recentSleep,
  recentConfidence,
  overdueEnrichments,
  recentWeight,
  recentWorkouts,
  recentSteps,
  recentCalories,
  recentBp,
  recentHr,
  medicineReminders,
  userGoals,
  achievements,
}: WellnessDashboardProps) {
  const [moodOpen, { open: openMood, close: closeMood }] = useDisclosure(false);
  const [sleepOpen, { open: openSleep, close: closeSleep }] = useDisclosure(false);
  const [hydrationOpen, { open: openHydration, close: closeHydration }] = useDisclosure(false);
  const [confidenceOpen, { open: openConfidence, close: closeConfidence }] = useDisclosure(false);
  const [weightOpen, { open: openWeight, close: closeWeight }] = useDisclosure(false);
  const [workoutOpen, { open: openWorkout, close: closeWorkout }] = useDisclosure(false);
  const [stepsOpen, { open: openSteps, close: closeSteps }] = useDisclosure(false);
  const [caloriesOpen, { open: openCalories, close: closeCalories }] = useDisclosure(false);
  const [bpOpen, { open: openBp, close: closeBp }] = useDisclosure(false);

  const handleQuickAdd = useCallback((type: string) => {
    switch (type) {
      case "mood": openMood(); break;
      case "sleep": openSleep(); break;
      case "hydration": openHydration(); break;
      case "confidence": openConfidence(); break;
      case "weight": openWeight(); break;
      case "workout": openWorkout(); break;
      case "steps": openSteps(); break;
      case "calories": openCalories(); break;
      case "bp": openBp(); break;
    }
  }, [openMood, openSleep, openHydration, openConfidence, openWeight, openWorkout, openSteps, openCalories, openBp]);

  const scoreCards = [
    { label: "Mood", score: scores.mood, icon: IconMoodSmile, color: "violet" },
    { label: "Sleep", score: scores.sleep, icon: IconBed, color: "indigo" },
    { label: "Hydration", score: scores.hydration, icon: IconDroplet, color: "blue" },
    { label: "Grooming", score: scores.grooming, icon: IconScissors, color: "teal" },
    { label: "Hygiene", score: scores.hygiene, icon: IconSparkles, color: "green" },
    { label: "Self-Care", score: scores.selfCare, icon: IconSun, color: "yellow" },
    { label: "Confidence", score: scores.confidence, icon: IconHeart, color: "pink" },
  ];

  const latestWeight = recentWeight.length > 0 ? recentWeight[recentWeight.length - 1] : null;
  const totalWorkoutMinutes = recentWorkouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
  const totalSteps = recentSteps.length > 0 ? recentSteps[recentSteps.length - 1].steps : 0;
  const totalCalories = recentCalories.reduce((s, c) => s + c.calories, 0);
  const latestBp = recentBp.length > 0 ? recentBp[recentBp.length - 1] : null;
  const latestHr = recentHr.length > 0 ? recentHr[recentHr.length - 1] : null;
  const activeGoals = userGoals.filter((g) => g.isActive);
  const activeMedicines = medicineReminders.filter((m) => m.isActive);

  return (
    <Stack gap="md" className="h-full p-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>
            Wellness
          </Text>
          <Text size="sm" c="dimmed">
            Track your health, mood, and wellbeing
          </Text>
        </div>
        <Group gap={4}>
          <QuickAddMenu onQuickAdd={handleQuickAdd} />
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
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: scores.overall, color: "blue" }]}
          label={
            <div>
              <Text size="2rem" fw={700}>
                {scores.overall}
              </Text>
              <Text size="xs" c="dimmed">
                Wellness
              </Text>
            </div>
          }
        />
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

      {/* Summary Cards - New Features */}
      <Text size="sm" fw={600} tt="uppercase" c="dimmed" mt="md">Health Tracking</Text>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        <SummaryCard
          title="Weight"
          value={latestWeight ? `${latestWeight.weightKg} kg` : "—"}
          subtitle={latestWeight ? `${recentWeight.length} entries this week` : "No data"}
          icon={IconWeight}
          color="cyan"
          href="/wellness/weight"
        />
        <SummaryCard
          title="Workouts"
          value={totalWorkoutMinutes > 0 ? `${totalWorkoutMinutes} min` : "—"}
          subtitle={recentWorkouts.length > 0 ? `${recentWorkouts.length} sessions` : "No data"}
          icon={IconRun}
          color="lime"
          href="/wellness/workouts"
        />
        <SummaryCard
          title="Steps"
          value={totalSteps > 0 ? totalSteps.toLocaleString() : "—"}
          subtitle={recentSteps.length > 0 ? "Today's count" : "No data"}
          icon={IconWalk}
          color="orange"
          href="/wellness/steps"
        />
        <SummaryCard
          title="Calories"
          value={totalCalories > 0 ? `${totalCalories}` : "—"}
          subtitle={recentCalories.length > 0 ? `${recentCalories.length} meals` : "No data"}
          icon={IconFlame}
          color="red"
          href="/wellness/calories"
        />
        <SummaryCard
          title="Blood Pressure"
          value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—"}
          subtitle={latestBp ? `Pulse: ${latestBp.pulse ?? "—"}` : "No data"}
          icon={IconHeartbeat}
          color="pink"
          href="/wellness/blood-pressure"
        />
        <SummaryCard
          title="Heart Rate"
          value={latestHr ? `${latestHr.average ?? latestHr.resting ?? "—"} bpm` : "—"}
          subtitle={recentHr.length > 0 ? `${recentHr.length} recordings` : "No data"}
          icon={IconActivity}
          color="grape"
          href="/wellness/heart-rate"
        />
        <SummaryCard
          title="Medicines"
          value={activeMedicines.length > 0 ? `${activeMedicines.length} active` : "None"}
          subtitle={activeMedicines.length > 0 ? `${medicineReminders.length} total` : "No reminders"}
          icon={IconPill}
          color="blue"
          href="/wellness/medicines"
        />
        <SummaryCard
          title="Goals"
          value={activeGoals.length > 0 ? `${activeGoals.length} active` : "None"}
          subtitle={`${achievements.length} achievements`}
          icon={IconTargetArrow}
          color="violet"
          href="/wellness/goals"
        />
        <SummaryCard
          title="Grooming"
          value={`${scores.grooming}%`}
          subtitle="Self-care score"
          icon={IconScissors}
          color="teal"
          href="/wellness/grooming"
        />
      </SimpleGrid>

      {/* Active Goals Progress */}
      {activeGoals.length > 0 && (
        <>
          <Text size="sm" fw={600} tt="uppercase" c="dimmed" mt="md">Active Goals</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {activeGoals.slice(0, 4).map((goal) => {
              const progress = Number(goal.targetValue) > 0
                ? Math.min(100, Math.round((Number(goal.currentValue) / Number(goal.targetValue)) * 100))
                : 0;
              return (
                <Paper key={goal.id} withBorder p="sm">
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={500}>{goal.title}</Text>
                    <Badge size="sm" color={progress >= 100 ? "teal" : "blue"}>
                      {Number(goal.currentValue)}/{Number(goal.targetValue)} {goal.unit}
                    </Badge>
                  </Group>
                  <Progress value={progress} size="sm" color={progress >= 100 ? "teal" : "blue"} />
                </Paper>
              );
            })}
          </SimpleGrid>
          <Anchor component={Link} href="/wellness/goals" size="sm">
            View all goals →
          </Anchor>
        </>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <>
          <Text size="sm" fw={600} tt="uppercase" c="dimmed" mt="md">
            Achievements ({achievements.length})
          </Text>
          <Group gap="xs">
            {achievements.slice(0, 8).map((a) => (
              <Tooltip key={a.id} label={a.title}>
                <ThemeIcon variant="light" color="yellow" size="lg" radius="xl">
                  <IconTrophy size={18} />
                </ThemeIcon>
              </Tooltip>
            ))}
          </Group>
        </>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Stack gap="sm" mt="md">
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">Insights</Text>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </Stack>
      )}

      {/* Recent Activity */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mt="md">
        <Paper withBorder p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Recent Mood{recentMoods.length > 0 && ` (${recentMoods.length})`}</Text>
            <Link href="/wellness/analytics">
              <ActionIcon variant="subtle" size="sm">
                <IconArrowRight size={14} />
              </ActionIcon>
            </Link>
          </Group>
          {recentMoods.length === 0 ? (
            <Text size="xs" c="dimmed">No mood logs this week.</Text>
          ) : (
            <Stack gap="xs">
              {recentMoods.slice(0, 3).map((m) => (
                <Group key={m.id} gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="violet" size="sm" radius="xl">
                    <IconMoodSmile size={12} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" fw={500}>Happiness: {m.happiness}/10</Text>
                    <Text size="xs" c="dimmed">{new Date(m.loggedAt).toLocaleDateString()}</Text>
                  </div>
                </Group>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Recent Sleep{recentSleep.length > 0 && ` (${recentSleep.length})`}</Text>
            <Link href="/wellness/analytics">
              <ActionIcon variant="subtle" size="sm">
                <IconArrowRight size={14} />
              </ActionIcon>
            </Link>
          </Group>
          {recentSleep.length === 0 ? (
            <Text size="xs" c="dimmed">No sleep logged this week.</Text>
          ) : (
            <Stack gap="xs">
              {recentSleep.slice(0, 3).map((s) => {
                const duration = Math.round((s.wakeTime.getTime() - s.bedtime.getTime()) / 3600000 * 10) / 10;
                return (
                  <Group key={s.id} gap="xs" wrap="nowrap">
                    <ThemeIcon variant="light" color="indigo" size="sm" radius="xl">
                      <IconBed size={12} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={500}>{duration}h &middot; Quality: {s.quality}/10</Text>
                      <Text size="xs" c="dimmed">{s.bedtime.toLocaleDateString()}</Text>
                    </div>
                  </Group>
                );
              })}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Recent Confidence{recentConfidence.length > 0 && ` (${recentConfidence.length})`}</Text>
            <Link href="/wellness/analytics">
              <ActionIcon variant="subtle" size="sm">
                <IconArrowRight size={14} />
              </ActionIcon>
            </Link>
          </Group>
          {recentConfidence.length === 0 ? (
            <Text size="xs" c="dimmed">No check-ins this week.</Text>
          ) : (
            <Stack gap="xs">
              {recentConfidence.slice(0, 3).map((c) => (
                <Group key={c.id} gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="pink" size="sm" radius="xl">
                    <IconHeart size={12} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" fw={500}>Score: {c.score}/10</Text>
                    <Text size="xs" c="dimmed">{new Date(c.date).toLocaleDateString()}</Text>
                  </div>
                </Group>
              ))}
            </Stack>
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
      <Modal opened={weightOpen} onClose={closeWeight} title="Log Weight" size="sm" centered>
        <WeightLogForm onClose={closeWeight} />
      </Modal>
      <Modal opened={workoutOpen} onClose={closeWorkout} title="Log Workout" size="sm" centered>
        <WorkoutLogForm onClose={closeWorkout} />
      </Modal>
      <Modal opened={stepsOpen} onClose={closeSteps} title="Log Steps" size="sm" centered>
        <StepsLogForm onClose={closeSteps} />
      </Modal>
      <Modal opened={caloriesOpen} onClose={closeCalories} title="Log Calories" size="sm" centered>
        <CalorieLogForm onClose={closeCalories} />
      </Modal>
      <Modal opened={bpOpen} onClose={closeBp} title="Log Blood Pressure" size="sm" centered>
        <BpLogForm onClose={closeBp} />
      </Modal>
    </Stack>
  );
}
