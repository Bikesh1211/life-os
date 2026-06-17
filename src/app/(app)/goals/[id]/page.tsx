"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card, Text, Group, Stack, Badge, Title, Button, Skeleton,
  Center, ActionIcon, TextInput, Textarea, Select, Slider,
  Modal, Checkbox, Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft, IconEdit, IconTrash, IconTarget,
  IconPlayerPlay, IconCheck, IconX, IconPlus, IconGripVertical,
} from "@tabler/icons-react";
import dayjs from "dayjs";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: "long-term" | "short-term";
  status: "draft" | "active" | "completed" | "cancelled";
  progress: number;
  deadline: string | null;
  category: string | null;
  reward: string | null;
  startDate: string | null;
  completionDate: string | null;
};

type Milestone = {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  order: number;
  targetDate: string | null;
};

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const fetchGoal = useCallback(async () => {
    try {
      const [goalRes, milestoneRes] = await Promise.all([
        fetch(`/api/goals/${params.id}`),
        fetch(`/api/goals/${params.id}/milestones`),
      ]);
      if (!goalRes.ok) { setGoal(null); return; }
      const goalData = await goalRes.json();
      setGoal(goalData);
      setProgress(goalData.progress);
      if (milestoneRes.ok) {
        setMilestones(await milestoneRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchGoal(); }, [fetchGoal]);

  async function handleSave(data: Partial<Goal>) {
    await fetch(`/api/goals/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    close();
    fetchGoal();
  }

  async function handleProgressChange(value: number) {
    setProgress(value);
    await fetch(`/api/goals/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: value }),
    });
  }

  async function handleStatusChange(status: string) {
    await fetch(`/api/goals/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchGoal();
  }

  async function handleDelete() {
    await fetch(`/api/goals/${params.id}`, { method: "DELETE" });
    router.push("/goals");
  }

  async function handleAddMilestone() {
    if (!newMilestoneTitle.trim()) return;
    const res = await fetch(`/api/goals/${params.id}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newMilestoneTitle.trim(),
        order: milestones.length,
      }),
    });
    if (res.ok) {
      setNewMilestoneTitle("");
      const ms = await res.json();
      setMilestones((prev) => [...prev, ms]);
    }
  }

  async function handleToggleMilestone(milestone: Milestone) {
    const res = await fetch(`/api/goals/${params.id}/milestones/${milestone.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !milestone.completed }),
    });
    if (res.ok) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? { ...m, completed: !m.completed } : m)),
      );
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    const res = await fetch(`/api/goals/${params.id}/milestones/${milestoneId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    }
  }

  if (loading) return <Skeleton height={500} radius="md" />;
  if (!goal) return <Center h={400}><Text c="dimmed">Goal not found</Text></Center>;

  const isOverdue = goal.status === "active" && goal.deadline && new Date(goal.deadline) < new Date();
  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <Stack gap="md">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.back()}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3} style={{ flex: 1 }}>{goal.title}</Title>
        <Group gap="xs">
          <Button variant="light" leftSection={<IconEdit size={16} />} onClick={open}>
            Edit
          </Button>
          <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="xs">
            <Badge
              size="lg"
              variant="light"
              color={goal.status === "active" ? "green" : goal.status === "completed" ? "teal" : goal.status === "cancelled" ? "red" : "gray"}
              tt="capitalize"
            >
              {goal.status}
            </Badge>
            <Badge size="lg" color={goal.type === "long-term" ? "violet" : "blue"} variant="light">
              {goal.type === "long-term" ? "Long-term" : "Short-term"}
            </Badge>
            {goal.category && (
              <Badge size="lg" variant="outline" tt="capitalize">
                {goal.category}
              </Badge>
            )}
            {isOverdue && <Badge color="red" size="lg">Overdue</Badge>}
          </Group>

          {goal.description && (
            <Text size="sm" c="dimmed">{goal.description}</Text>
          )}

          <Divider />

          <Text fw={600} size="sm">Progress: {progress}%</Text>
          <Slider
            value={progress}
            onChange={handleProgressChange}
            min={0}
            max={100}
            step={1}
            marks={[
              { value: 0, label: "0%" },
              { value: 25, label: "25%" },
              { value: 50, label: "50%" },
              { value: 75, label: "75%" },
              { value: 100, label: "100%" },
            ]}
          />

          <Divider />

          <Group gap="lg">
            {goal.deadline && (
              <div>
                <Text size="xs" c="dimmed">Deadline</Text>
                <Text size="sm" c={isOverdue ? "red" : undefined}>
                  {dayjs(goal.deadline).format("MMM D, YYYY")}
                </Text>
              </div>
            )}
            {goal.reward && (
              <div>
                <Text size="xs" c="dimmed">Reward</Text>
                <Text size="sm">{goal.reward}</Text>
              </div>
            )}
            {goal.startDate && (
              <div>
                <Text size="xs" c="dimmed">Started</Text>
                <Text size="sm">{dayjs(goal.startDate).format("MMM D, YYYY")}</Text>
              </div>
            )}
            {goal.completionDate && (
              <div>
                <Text size="xs" c="dimmed">Completed</Text>
                <Text size="sm">{dayjs(goal.completionDate).format("MMM D, YYYY")}</Text>
              </div>
            )}
          </Group>

          {goal.status !== "completed" && goal.status !== "cancelled" && (
            <>
              <Divider />
              <Text fw={600} size="sm">Actions</Text>
              <Group>
                {goal.status === "draft" && (
                  <Button
                    size="xs"
                    leftSection={<IconPlayerPlay size={14} />}
                    onClick={() => handleStatusChange("active")}
                  >
                    Activate
                  </Button>
                )}
                {goal.status === "active" && (
                  <Button
                    size="xs"
                    color="teal"
                    leftSection={<IconCheck size={14} />}
                    onClick={() => handleStatusChange("completed")}
                  >
                    Mark Complete
                  </Button>
                )}
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<IconX size={14} />}
                  onClick={() => handleStatusChange("cancelled")}
                >
                  Cancel Goal
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Milestones {milestones.length > 0 && `(${completedCount}/${milestones.length})`}
            </Text>
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder="Add a milestone..."
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
              style={{ flex: 1 }}
              size="sm"
            />
            <ActionIcon variant="light" color="blue" onClick={handleAddMilestone}>
              <IconPlus size={18} />
            </ActionIcon>
          </Group>

          {milestones.length === 0 && (
            <Text size="sm" c="dimmed" py="sm">
              No milestones yet. Break your goal into smaller steps.
            </Text>
          )}

          {milestones.map((milestone) => (
            <Group key={milestone.id} gap="sm">
              <Checkbox
                checked={milestone.completed}
                onChange={() => handleToggleMilestone(milestone)}
              />
              <Text
                size="sm"
                style={{ flex: 1, textDecoration: milestone.completed ? "line-through" : "none" }}
                c={milestone.completed ? "dimmed" : undefined}
              >
                {milestone.title}
              </Text>
              {milestone.targetDate && (
                <Text size="xs" c="dimmed">
                  {dayjs(milestone.targetDate).format("MMM D")}
                </Text>
              )}
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => handleDeleteMilestone(milestone.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Card>

      <EditGoalModal opened={opened} onClose={close} goal={goal} onSave={handleSave} />
    </Stack>
  );
}

function EditGoalModal({
  opened, onClose, goal, onSave,
}: {
  opened: boolean;
  onClose: () => void;
  goal: Goal;
  onSave: (data: Partial<Goal>) => void;
}) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [type, setType] = useState<"long-term" | "short-term">(goal.type);
  const [category, setCategory] = useState<string | null>(goal.category);
  const [deadline, setDeadline] = useState(goal.deadline ? dayjs(goal.deadline).format("YYYY-MM-DD") : "");
  const [reward, setReward] = useState(goal.reward ?? "");

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setType(goal.type);
    setCategory(goal.category);
    setDeadline(goal.deadline ? dayjs(goal.deadline).format("YYYY-MM-DD") : "");
    setReward(goal.reward ?? "");
  }, [goal]);

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({
      title,
      description: description || undefined,
      type,
      category: category || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      reward: reward || undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Goal" size="md">
      <Stack gap="sm">
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group grow>
          <Select
            label="Type"
            data={[
              { value: "short-term", label: "Short-term" },
              { value: "long-term", label: "Long-term" },
            ]}
            value={type}
            onChange={(v) => setType(v as "long-term" | "short-term")}
          />
          <Select
            label="Category"
            placeholder="Optional"
            data={[
              { value: "career", label: "Career" },
              { value: "education", label: "Education" },
              { value: "health", label: "Health" },
              { value: "finance", label: "Finance" },
              { value: "personal", label: "Personal" },
              { value: "relationships", label: "Relationships" },
              { value: "business", label: "Business" },
              { value: "creative", label: "Creative" },
            ]}
            value={category}
            onChange={setCategory}
            clearable
          />
        </Group>
        <TextInput
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.currentTarget.value)}
        />
        <TextInput
          label="Reward"
          value={reward}
          onChange={(e) => setReward(e.currentTarget.value)}
          placeholder="What do you get when you complete this?"
        />
        <Button fullWidth onClick={handleSubmit} mt="sm">
          Save Changes
        </Button>
      </Stack>
    </Modal>
  );
}
