"use client";

import { useState } from "react";
import {
  Stack, Title, Text, Paper, Group, ThemeIcon, SimpleGrid,
  Button, Progress, Modal, TextInput, Select,
} from "@mantine/core";
import { IconFolder, IconPlus } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useProjects, useCreateProject } from "@/modules/tasks/hooks";

const projectColors = [
  "blue", "green", "red", "yellow", "purple", "pink",
  "orange", "cyan", "teal", "grape",
];

export function ProjectsContent() {
  const { data: projects, isLoading } = useProjects();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md" color="yellow">
            <IconFolder size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Projects</Title>
            <Text size="sm" c="dimmed">
              {projects?.length ?? 0} projects
            </Text>
          </div>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={open} radius="xl">
          New Project
        </Button>
      </Group>

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !projects || projects.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No projects yet. Create your first project to organize tasks.
          </Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {projects.map((project: any) => (
            <Paper
              key={project.id}
              withBorder
              p="md"
              radius="md"
              component={Link}
              href={`/tasks/projects/${project.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Group mb="xs">
                <ThemeIcon variant="light" color={project.color} size="md" radius="md">
                  <IconFolder size={16} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">{project.title}</Text>
                  <Text size="xs" c="dimmed">
                    {project.taskCount ?? 0} tasks
                  </Text>
                </div>
              </Group>
              {(project.taskCount ?? 0) > 0 && (
                <Progress
                  value={((project.doneCount ?? 0) / (project.taskCount || 1)) * 100}
                  size="sm"
                  color={project.color}
                />
              )}
            </Paper>
          ))}
        </SimpleGrid>
      )}

      <CreateProjectModal opened={opened} onClose={close} />
    </Stack>
  );
}

function CreateProjectModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const createProject = useCreateProject();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      color: "blue",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await createProject.mutateAsync(values);
    form.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="New Project" radius="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Project name"
            placeholder="e.g. Website Redesign"
            required
            key={form.key("title")}
            {...form.getInputProps("title")}
          />
          <Select
            label="Color"
            data={projectColors.map((c) => ({ value: c, label: c }))}
            key={form.key("color")}
            {...form.getInputProps("color")}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={createProject.isPending}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
