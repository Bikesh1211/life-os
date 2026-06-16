"use client";

import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useCreateTask, useUpdateTask, useProjects } from "../hooks";
import type { Task } from "../repository";

type TaskFormModalProps = {
  task?: Task | null;
  defaultStatus?: string;
  defaultProjectId?: string;
  onClose: () => void;
};

export function TaskFormModal({
  task,
  defaultStatus,
  defaultProjectId,
  onClose,
}: TaskFormModalProps) {
  const [opened, { close }] = useDisclosure(true);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projects } = useProjects();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "p3",
      status: task?.status ?? defaultStatus ?? "todo",
      projectId: task?.projectId ?? defaultProjectId ?? "",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      estimatedMinutes: task?.estimatedMinutes ? String(task.estimatedMinutes) : "",
      recurrence: task?.recurrence ?? "none",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const payload: Record<string, unknown> = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      status: values.status,
      projectId: values.projectId || null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null,
      recurrence: values.recurrence,
    };

    if (task) {
      await updateTask.mutateAsync({ id: task.id, ...payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    handleClose();
  };

  const handleClose = () => {
    close();
    onClose();
  };

  useEffect(() => {
    if (!opened) onClose();
  }, [opened, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={task ? "Edit Task" : "New Task"}
      radius="lg"
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="What needs to be done?"
            required
            key={form.key("title")}
            {...form.getInputProps("title")}
          />

          <Textarea
            label="Description"
            placeholder="Add details..."
            minRows={2}
            key={form.key("description")}
            {...form.getInputProps("description")}
          />

          <Group gap="sm" grow>
            <Select
              label="Priority"
              data={[
                { value: "p1", label: "P1 - Critical" },
                { value: "p2", label: "P2 - High" },
                { value: "p3", label: "P3 - Medium" },
                { value: "p4", label: "P4 - Low" },
                { value: "p5", label: "P5 - Trivial" },
              ]}
              key={form.key("priority")}
              {...form.getInputProps("priority")}
            />
            <Select
              label="Status"
              data={[
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "done", label: "Done" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              key={form.key("status")}
              {...form.getInputProps("status")}
            />
          </Group>

          <Select
            label="Project"
            placeholder="No project"
            data={
              projects?.map((p: any) => ({
                value: p.id,
                label: p.title,
              })) ?? []
            }
            clearable
            key={form.key("projectId")}
            {...form.getInputProps("projectId")}
          />

          <Group gap="sm" grow>
            <TextInput
              label="Due Date"
              type="datetime-local"
              key={form.key("dueDate")}
              {...form.getInputProps("dueDate")}
            />
            <TextInput
              label="Est. Time (minutes)"
              type="number"
              min={0}
              key={form.key("estimatedMinutes")}
              {...form.getInputProps("estimatedMinutes")}
            />
          </Group>

          <Select
            label="Recurrence"
            data={[
              { value: "none", label: "No recurrence" },
              { value: "daily", label: "Daily" },
              { value: "weekdays", label: "Weekdays" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            key={form.key("recurrence")}
            {...form.getInputProps("recurrence")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createTask.isPending || updateTask.isPending}>
              {task ? "Save" : "Create"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
