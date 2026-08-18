"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  IconShield,
  IconFlame,
  IconCalendarCheck,
  IconX,
  IconStar,
  IconTrendingUp,
  IconPlus,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Progress,
  RingProgress,
  SimpleGrid,
  Timeline,
  Chip,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { EXCUSE_TAGS } from "@/modules/integrity/constants";
import { apiFetch } from "@/core/api/http";

type Commitment = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  difficulty: string;
  priority: string;
  category: string | null;
  dueDate: string | null;
  createdAt: string;
};

type SubScores = Record<string, number>;

type DisciplineDashboard = {
  disciplineScore: number;
  subScores: SubScores;
  currentStreak: number;
  longestStreak: number;
  daysConsistent: number;
  missedCommitments: number;
  weeklyRating: number;
  monthlyImprovement: number;
  level: number;
  levelTitle: string;
  commitmentRate: number;
  isAllCompleted: boolean;
  todayCheckin: {
    id?: string;
    date?: string;
    accomplishments?: string | null;
    excuses?: string | null;
    distractions?: string | null;
    proudOf?: string | null;
    improvement?: string | null;
    excuseTags?: string[] | null;
  } | null;
  upcomingDeadlines: Commitment[];
  recentEvents: Array<{
    id: string;
    commitmentId: string;
    eventType: string;
    metadata: string | null;
    timestamp: string;
    commitment: Commitment | null;
  }>;
};

function formatMetric(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "0%";
}

function CreateCommitmentModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [priority, setPriority] = useState<string>("medium");
  const [category, setCategory] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch("/api/discipline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        difficulty,
        priority,
        category: category || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });
    queryClient.invalidateQueries({ queryKey: ["discipline"] });
    onClose();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="New Commitment" size="md">
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="What do you commit to?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="Optional details"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group grow>
          <Select
            label="Difficulty"
            data={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
              { value: "extreme", label: "Extreme" },
            ]}
            value={difficulty}
            onChange={(v) => setDifficulty(v ?? "medium")}
          />
          <Select
            label="Priority"
            data={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            value={priority}
            onChange={(v) => setPriority(v ?? "medium")}
          />
        </Group>
        <Group grow>
          <Select
            label="Category"
            placeholder="Optional"
            data={[
              { value: "personal", label: "Personal" },
              { value: "career", label: "Career" },
              { value: "health", label: "Health" },
              { value: "finance", label: "Finance" },
              { value: "relationships", label: "Relationships" },
              { value: "education", label: "Education" },
              { value: "creative", label: "Creative" },
              { value: "other", label: "Other" },
            ]}
            value={category}
            onChange={setCategory}
            clearable
          />
          <TextInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.currentTarget.value)}
          />
        </Group>
        <Button fullWidth onClick={handleSubmit} mt="sm">
          Make Commitment
        </Button>
      </Stack>
    </Modal>
  );
}

function CheckinCard({ checkin }: { checkin: DisciplineDashboard["todayCheckin"] }) {
  const queryClient = useQueryClient();
  const [accomplishments, setAccomplishments] = useState(checkin?.accomplishments ?? "");
  const [excuses, setExcuses] = useState(checkin?.excuses ?? "");
  const [distractions, setDistractions] = useState(checkin?.distractions ?? "");
  const [proudOf, setProudOf] = useState(checkin?.proudOf ?? "");
  const [improvement, setImprovement] = useState(checkin?.improvement ?? "");
  const [selectedExcuses, setSelectedExcuses] = useState<string[]>(checkin?.excuseTags ?? []);
  const [isEditing, setIsEditing] = useState(!checkin?.accomplishments && !checkin?.excuses);

  const today = dayjs().format("YYYY-MM-DD");

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/discipline/checkin", {
        method: "POST",
        body: JSON.stringify({
          date: today,
          accomplishments: accomplishments || undefined,
          excuses: excuses || undefined,
          distractions: distractions || undefined,
          proudOf: proudOf || undefined,
          improvement: improvement || undefined,
          excuseTags: selectedExcuses.length > 0 ? selectedExcuses : undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
      setIsEditing(false);
    },
  });

  if (!isEditing && checkin?.accomplishments) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={600} size="sm">Today's Journal</Text>
          <Button size="xs" variant="light" onClick={() => setIsEditing(true)}>Edit</Button>
        </Group>
        {checkin.accomplishments && (
          <Text size="sm" mb={4}><Text span fw={500}>Accomplished:</Text> {checkin.accomplishments}</Text>
        )}
        {checkin.proudOf && (
          <Text size="sm" mb={4}><Text span fw={500}>Proud of:</Text> {checkin.proudOf}</Text>
        )}
        {checkin.excuses && (
          <Text size="sm" mb={4}><Text span fw={500}>Excuses:</Text> {checkin.excuses}</Text>
        )}
        {checkin.distractions && (
          <Text size="sm" mb={4}><Text span fw={500}>Distractions:</Text> {checkin.distractions}</Text>
        )}
        {checkin.improvement && (
          <Text size="sm" mb={4}><Text span fw={500}>Improve:</Text> {checkin.improvement}</Text>
        )}
        {checkin.excuseTags && checkin.excuseTags.length > 0 && (
          <Group gap="xs" mt="xs">
            {checkin.excuseTags.map((tag) => (
              <Badge key={tag} size="sm" variant="light" color="orange">{tag}</Badge>
            ))}
          </Group>
        )}
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Text fw={600} size="sm" mb="md">Daily Accountability Journal</Text>
      <Stack gap="sm">
        <Textarea
          label="What did I accomplish today?"
          placeholder="List what you got done..."
          value={accomplishments}
          onChange={(e) => setAccomplishments(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Textarea
          label="What excuses did I make?"
          placeholder="Be honest with yourself..."
          value={excuses}
          onChange={(e) => setExcuses(e.currentTarget.value)}
          autosize
          minRows={1}
        />
        <Textarea
          label="What distracted me?"
          placeholder="What pulled your focus away?"
          value={distractions}
          onChange={(e) => setDistractions(e.currentTarget.value)}
          autosize
          minRows={1}
        />
        <Textarea
          label="What am I proud of?"
          placeholder="What went well today?"
          value={proudOf}
          onChange={(e) => setProudOf(e.currentTarget.value)}
          autosize
          minRows={1}
        />
        <Textarea
          label="What will I improve tomorrow?"
          placeholder="One thing you'll do better..."
          value={improvement}
          onChange={(e) => setImprovement(e.currentTarget.value)}
          autosize
          minRows={1}
        />
        <div>
          <Text size="sm" mb="xs">Why did I miss commitments?</Text>
          <Group gap="xs">
            {EXCUSE_TAGS.map((tag) => (
              <Chip
                key={tag}
                checked={selectedExcuses.includes(tag)}
                onChange={() => {
                  setSelectedExcuses((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                  );
                }}
                size="xs"
                variant="light"
              >
                {tag.replace("-", " ")}
              </Chip>
            ))}
          </Group>
        </div>
        <Button
          fullWidth
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          mt="sm"
        >
          Save Journal
        </Button>
      </Stack>
    </Card>
  );
}

function SubScoreBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const color = value >= 80 ? "green" : value >= 50 ? "yellow" : "red";

  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed">{label} ({(weight * 100).toFixed(0)}%)</Text>
        <Text size="xs" fw={600}>{value}/100</Text>
      </Group>
      <Progress value={value} size="sm" color={color} />
    </div>
  );
}

export default function DisciplineDashboardTab() {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: dashboard, isLoading } = useQuery<DisciplineDashboard>({
    queryKey: ["discipline", "dashboard"],
    queryFn: () => apiFetch<DisciplineDashboard>("/api/discipline?view=dashboard"),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  const scoreColor = dashboard && dashboard.disciplineScore >= 80 ? "green"
    : dashboard && dashboard.disciplineScore >= 50 ? "yellow" : "red";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Group justify="space-between">
          <div>
            <Group gap="sm" mb={4}>
              <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
                Discipline Dashboard
              </h1>
              {dashboard && (
                <Badge size="lg" variant="gradient" gradient={{ from: "violet", to: "indigo" }}>
                  {dashboard.levelTitle}
                </Badge>
              )}
            </Group>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              Build consistency through accountability
            </p>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            New Commitment
          </Button>
        </Group>
      </motion.div>

      <CreateCommitmentModal opened={opened} onClose={close} />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="xs" mb={4}>
            <IconShield size={20} style={{ color: `var(--mantine-color-${scoreColor}-6)` }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Score</Text>
          </Group>
          <Text size="xl" fw={700}>{dashboard?.disciplineScore ?? 0}</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="xs" mb={4}>
            <IconFlame size={20} style={{ color: "var(--mantine-color-orange-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Streak</Text>
          </Group>
          <Text size="xl" fw={700}>{dashboard?.currentStreak ?? 0}d</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="xs" mb={4}>
            <IconCalendarCheck size={20} style={{ color: "var(--mantine-color-teal-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Consistent</Text>
          </Group>
          <Text size="xl" fw={700}>{dashboard?.daysConsistent ?? 0}d</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="xs" mb={4}>
            <IconX size={20} style={{ color: "var(--mantine-color-red-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Missed</Text>
          </Group>
          <Text size="xl" fw={700}>{dashboard?.missedCommitments ?? 0}</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="xs" mb={4}>
            <IconFlame size={20} style={{ color: "var(--mantine-color-violet-6)" }} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Rate</Text>
          </Group>
          <Text size="xl" fw={700}>{dashboard?.commitmentRate ?? 0}%</Text>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {dashboard && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">Discipline Score</Text>
              <Badge size="lg" variant="light" color={scoreColor}>
                Lvl {dashboard.level} &middot; {dashboard.levelTitle}
              </Badge>
            </Group>
            <div className="flex items-center justify-center mb-4">
              <RingProgress
                size={180}
                thickness={18}
                sections={[
                  {
                    value: dashboard.disciplineScore,
                    color: scoreColor,
                  },
                ]}
                label={
                  <div className="text-center">
                    <Text ta="center" fw={700} size="xl">
                      {dashboard.disciplineScore}
                    </Text>
                    <Text ta="center" size="xs" c="dimmed">/ 100</Text>
                  </div>
                }
              />
            </div>
            <Stack gap="xs">
              <SubScoreBar label="Commitments" value={dashboard.subScores.commitments ?? 0} weight={0.30} />
              <SubScoreBar label="Habits" value={dashboard.subScores.habits ?? 0} weight={0.15} />
              <SubScoreBar label="Tasks" value={dashboard.subScores.tasks ?? 0} weight={0.15} />
              <SubScoreBar label="Sleep" value={dashboard.subScores.sleep ?? 0} weight={0.10} />
              <SubScoreBar label="Exercise" value={dashboard.subScores.exercise ?? 0} weight={0.10} />
              <SubScoreBar label="Journaling" value={dashboard.subScores.journaling ?? 0} weight={0.10} />
              <SubScoreBar label="Goals" value={dashboard.subScores.goals ?? 0} weight={0.10} />
            </Stack>
          </Card>
        )}

        <Stack gap="md">
          <CheckinCard checkin={dashboard?.todayCheckin ?? null} />

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text fw={600} size="sm" mb="sm">Weekly Overview</Text>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Weekly Rating</Text>
                <Group gap="xs">
                  <IconStar size={16} style={{ color: dashboard && dashboard.weeklyRating >= 80 ? "var(--mantine-color-yellow-6)" : "var(--mantine-color-dimmed)" }} />
                  <Text size="sm" fw={600}>{dashboard?.weeklyRating ?? 0}%</Text>
                </Group>
              </Group>
              <Progress value={dashboard?.weeklyRating ?? 0} size="sm" color={dashboard && dashboard.weeklyRating >= 80 ? "green" : "yellow"} />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Monthly Improvement</Text>
                <Group gap="xs">
                  <IconTrendingUp size={16} style={{ color: dashboard && (dashboard.monthlyImprovement ?? 0) >= 0 ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)" }} />
                  <Text size="sm" fw={600} c={dashboard && (dashboard.monthlyImprovement ?? 0) >= 0 ? "green" : "red"}>
                    {formatMetric(dashboard?.monthlyImprovement ?? 0)}
                  </Text>
                </Group>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Longest Streak</Text>
                <Text size="sm" fw={600}>{dashboard?.longestStreak ?? 0} days</Text>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </div>

      {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 && (
        <div className="mb-8">
          <Text fw={600} size="sm" mb="sm">
            Upcoming Deadlines
          </Text>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.upcomingDeadlines.slice(0, 6).map((commitment) => (
              <Card key={commitment.id} shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm" lineClamp={1}>
                    {commitment.title}
                  </Text>
                  <Badge
                    color={
                      commitment.status === "pending" ? "yellow"
                      : commitment.status === "in_progress" ? "blue"
                      : "gray"
                    }
                    size="sm"
                    variant="light"
                  >
                    {commitment.status.replace("_", " ")}
                  </Badge>
                </Group>
                {commitment.dueDate && (
                  <Text size="xs" c="dimmed">
                    Due: {dayjs(commitment.dueDate).format("MMM D, YYYY")}
                  </Text>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
