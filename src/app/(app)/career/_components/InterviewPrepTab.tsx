"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Skeleton,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Card,
  Badge,
  Notification,
  Checkbox,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconTrash, IconCheck } from "@tabler/icons-react";

interface PrepItem {
  id: string;
  questionType: string;
  question: string;
  answer: string | null;
  isCompleted: boolean;
  revisionCount: number;
  confidenceLevel: number;
  tags: string[];
}

const questionTypes = [
  { value: "hr", label: "HR" },
  { value: "technical", label: "Technical" },
  { value: "dsa", label: "DSA" },
  { value: "system_design", label: "System Design" },
  { value: "behavioral", label: "Behavioral" },
  { value: "star_story", label: "STAR Story" },
];

export default function InterviewPrepTab() {
  const [items, setItems] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    questionType: "technical",
    question: "",
    answer: "",
    tags: "",
  });

  const loadItems = () => {
    setLoading(true);
    fetch("/api/career/interview-prep")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        const d = await r.json();
        setItems(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadItems, []);

  const handleCreate = async () => {
    if (!form.question.trim()) return;
    try {
      const res = await fetch("/api/career/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setForm({ questionType: "technical", question: "", answer: "", tags: "" });
      close();
      loadItems();
    } catch {
      setError("Failed to create item");
    }
  };

  const handleToggleComplete = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/career/interview-prep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !current }),
      });
      loadItems();
    } catch {
      setError("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/career/interview-prep/${id}`, { method: "DELETE" });
      loadItems();
    } catch {
      setError("Failed to delete");
    }
  };

  const handleConfidenceUp = async (id: string, current: number) => {
    const next = Math.min(current + 1, 5);
    try {
      await fetch(`/api/career/interview-prep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confidenceLevel: next, revisionCount: current >= next ? undefined : current + 1 }),
      });
      loadItems();
    } catch {
      setError("Failed to update");
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Interview Preparation</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          New Question
        </Button>
      </Group>

      {error && (
        <Notification color="red" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      {items.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="lg">
            No questions yet
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Add interview questions to start preparing
          </Text>
          <Button leftSection={<IconPlus size={16} />} mt="md" onClick={open}>
            Add Question
          </Button>
        </Paper>
      ) : (
        <Stack gap="sm">
          {items.map((item) => (
            <Card key={item.id} withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Group align="flex-start" gap="sm">
                  <Checkbox
                    checked={item.isCompleted}
                    onChange={() => handleToggleComplete(item.id, item.isCompleted)}
                    mt={4}
                  />
                  <Stack gap={0}>
                    <Group gap="xs">
                      <Text
                        fw={600}
                        td={item.isCompleted ? "line-through" : undefined}
                        c={item.isCompleted ? "dimmed" : undefined}
                      >
                        {item.question}
                      </Text>
                      <Badge size="sm" variant="light">
                        {questionTypes.find((t) => t.value === item.questionType)?.label ?? item.questionType}
                      </Badge>
                    </Group>
                    <Group gap="xs" mt={4}>
                      <Badge size="xs" color={item.confidenceLevel >= 4 ? "green" : item.confidenceLevel >= 2 ? "yellow" : "red"}>
                        Confidence: {item.confidenceLevel}/5
                      </Badge>
                      <Badge size="xs" variant="outline">
                        Revised {item.revisionCount}x
                      </Badge>
                    </Group>
                    {item.answer && (
                      <Text size="sm" c="dimmed" mt={4} lineClamp={2}>
                        {item.answer}
                      </Text>
                    )}
                    {item.tags.length > 0 && (
                      <Group gap={4} mt={4}>
                        {item.tags.map((tag) => (
                          <Badge key={tag} size="xs" variant="dot">
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Stack>
                </Group>
                <Menu withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => handleConfidenceUp(item.id, item.confidenceLevel)}>
                      Mark Revised (Confidence +1)
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="New Question" centered size="lg">
        <Stack gap="md">
          <Select
            label="Question Type"
            data={questionTypes}
            value={form.questionType}
            onChange={(v) => setForm({ ...form, questionType: v ?? "technical" })}
          />
          <TextInput
            label="Question"
            placeholder="e.g. Explain how React reconciliation works"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            data-autofocus
            required
          />
          <Textarea
            label="Answer"
            placeholder="Your ideal answer..."
            minRows={4}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
          <TextInput
            label="Tags"
            placeholder="react, frontend, javascript (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
