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
  ActionIcon,
  Card,
  Menu,
  Badge,
  Notification,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconTrash, IconCopy, IconEye } from "@tabler/icons-react";

interface Resume {
  id: string;
  name: string;
  wordCount: number;
  isDefault: boolean;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesTab() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadResumes = () => {
    setLoading(true);
    fetch("/api/career/resumes")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        const d = await r.json();
        setResumes(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadResumes, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/career/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setNewName("");
      close();
      loadResumes();
    } catch {
      setError("Failed to create resume");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/career/resumes/${id}`, { method: "DELETE" });
      loadResumes();
    } catch {
      setError("Failed to delete resume");
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
        <Title order={3}>Resumes</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          New Resume
        </Button>
      </Group>

      {error && (
        <Notification color="red" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      {resumes.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="lg">
            No resumes yet
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Create your first resume to get started
          </Text>
          <Button leftSection={<IconPlus size={16} />} mt="md" onClick={open}>
            Create Resume
          </Button>
        </Paper>
      ) : (
        <Stack gap="sm">
          {resumes.map((resume) => (
            <Card key={resume.id} withBorder padding="md" radius="md">
              <Group justify="space-between">
                <Stack gap={0}>
                  <Group gap="xs">
                    <Text fw={600}>{resume.name}</Text>
                    {resume.isDefault && <Badge size="sm">Default</Badge>}
                    {resume.atsScore && (
                      <Badge color={resume.atsScore > 80 ? "green" : "orange"} size="sm">
                        ATS {resume.atsScore}
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed">
                    {resume.wordCount} words · Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </Text>
                </Stack>
                <Menu withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconEye size={14} />}>View</Menu.Item>
                    <Menu.Item leftSection={<IconCopy size={14} />}>Duplicate</Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDelete(resume.id)}
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

      <Modal opened={opened} onClose={close} title="New Resume" centered>
        <Stack gap="md">
          <TextInput
            label="Resume Name"
            placeholder="e.g. Software Engineer Resume"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            data-autofocus
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
