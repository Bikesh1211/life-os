"use client";

import { useState } from "react";
import {
  Stack, Title, Text, Paper, Group, ThemeIcon, Button,
  Modal, TextInput, Select, ActionIcon, Tooltip, Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconTags, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/modules/tasks/hooks";

const labelColors = [
  "blue", "green", "red", "yellow", "purple", "pink",
  "orange", "cyan", "teal", "grape", "lime", "indigo",
];

type LabelsContentProps = {
  hideHeader?: boolean;
};

export function LabelsContent({ hideHeader = false }: LabelsContentProps) {
  const { data: labels, isLoading } = useLabels();
  const deleteLabel = useDeleteLabel();
  const [editLabel, setEditLabel] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack gap="lg">
      {!hideHeader && (
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" size="lg" radius="md" color="violet">
              <IconTags size={20} />
            </ThemeIcon>
            <div>
              <Title order={2}>Labels</Title>
              <Text size="sm" c="dimmed">{labels?.length ?? 0} labels</Text>
            </div>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => { setEditLabel(null); open(); }}
            radius="xl"
          >
            New Label
          </Button>
        </Group>
      )}

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !labels || labels.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No labels yet. Create labels to organize your tasks.
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {labels.map((label: any) => (
            <Paper key={label.id} withBorder p="sm" radius="md">
              <Group justify="space-between">
                <Group>
                  <Badge color={label.color} variant="filled" size="lg">
                    {label.name}
                  </Badge>
                </Group>
                <Group gap={4}>
                  <Tooltip label="Edit">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => { setEditLabel(label); open(); }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => {
                        if (confirm("Delete this label? It will be removed from all tasks.")) {
                          deleteLabel.mutate(label.id);
                        }
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <LabelFormModal
        label={editLabel}
        opened={opened}
        onClose={() => { close(); setEditLabel(null); }}
      />
    </Stack>
  );
}

function LabelFormModal({
  label,
  opened,
  onClose,
}: {
  label: any | null;
  opened: boolean;
  onClose: () => void;
}) {
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: label?.name ?? "",
      color: label?.color ?? "blue",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (label) {
      await updateLabel.mutateAsync({ id: label.id, ...values });
    } else {
      await createLabel.mutateAsync(values);
    }
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={label ? "Edit Label" : "New Label"}
      radius="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. bug, feature, urgent"
            required
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <Select
            label="Color"
            data={labelColors.map((c) => ({ value: c, label: c }))}
            key={form.key("color")}
            {...form.getInputProps("color")}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={createLabel.isPending || updateLabel.isPending}>
              {label ? "Save" : "Create"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}