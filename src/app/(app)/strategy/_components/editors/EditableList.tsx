"use client";

import { useState } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Group,
  ActionIcon,
  Text,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTrash, IconGripVertical, IconDeviceFloppy } from "@tabler/icons-react";
import type { StrategySection } from "@/modules/strategy";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  options?: { value: string; label: string }[];
};

type Props = {
  sectionType: string;
  initial: StrategySection[];
  fields: FieldDef[];
  emptyMessage: string;
  addLabel: string;
};

const emptyContent: Record<string, string | number> = {};

export function EditableList({ sectionType, initial, fields, emptyMessage, addLabel }: Props) {
  const [items, setItems] = useState<StrategySection[]>(initial);
  const [newItem, setNewItem] = useState<Record<string, string | number>>({});
  const [adding, setAdding] = useState(false);
  const [opened, { toggle }] = useDisclosure(false);

  const getDefault = () => {
    const obj: Record<string, string | number> = {};
    for (const f of fields) {
      obj[f.key] = f.type === "number" ? 0 : "";
    }
    return obj;
  };

  const handleFieldChange = (key: string, value: string | number) => {
    setNewItem((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const content = { ...getDefault(), ...newItem };
      const res = await fetch(`/api/strategy/sections/${sectionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        setNewItem(getDefault());
        toggle();
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/strategy/sections/${sectionType}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {}
  };

  const renderField = (field: FieldDef, value: string | number | undefined, onChange: (v: string | number) => void) => {
    switch (field.type) {
      case "text":
        return (
          <TextInput
            label={field.label}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.currentTarget.value)}
            size="sm"
          />
        );
      case "textarea":
        return (
          <Textarea
            label={field.label}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.currentTarget.value)}
            size="sm"
            minRows={2}
            autosize
          />
        );
      case "select":
        return (
          <Select
            label={field.label}
            value={String(value ?? "")}
            onChange={(v) => onChange(v ?? "")}
            data={field.options ?? []}
            size="sm"
            clearable
          />
        );
      case "number":
        return (
          <NumberInput
            label={field.label}
            value={Number(value ?? 0)}
            onChange={(v) => onChange(Number(v))}
            size="sm"
            min={0}
            max={10}
          />
        );
    }
  };

  return (
    <Stack gap="sm">
      {items.length === 0 && !opened && (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text c="dimmed" size="sm">{emptyMessage}</Text>
          <Button leftSection={<IconPlus size={16} />} onClick={toggle} variant="light" size="sm" mt="md">
            {addLabel}
          </Button>
        </Paper>
      )}

      {items.length > 0 && (
        <>
          {items.map((item) => {
            const content = item.content as Record<string, string | number>;
            return (
              <Paper key={item.id} p="sm" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconGripVertical size={16} style={{ opacity: 0.3, cursor: "grab" }} />
                    <Text size="sm" fw={500}>
                      {content[fields[0]?.key] ? String(content[fields[0].key]).substring(0, 60) : "Untitled"}
                    </Text>
                  </Group>
                  <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(item.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
                {fields.slice(1).map((f) => (
                  <div key={f.key} style={{ marginBottom: 4 }}>
                    <Text size="xs" c="dimmed">{f.label}</Text>
                    <Text size="sm">{String(content[f.key] ?? "") || "—"}</Text>
                  </div>
                ))}
              </Paper>
            );
          })}
        </>
      )}

      {!opened && items.length > 0 && (
        <Button leftSection={<IconPlus size={16} />} onClick={toggle} variant="light" size="sm">
          {addLabel}
        </Button>
      )}

      <Collapse in={opened}>
        <Paper p="md" radius="md" withBorder>
          <Stack gap="xs">
            {fields.map((f) => renderField(f, newItem[f.key], (v) => handleFieldChange(f.key, v)))}
            <Group mt="sm">
              <Button size="sm" onClick={handleAdd} loading={adding} leftSection={<IconDeviceFloppy size={14} />}>
                Save
              </Button>
              <Button size="sm" variant="subtle" onClick={toggle}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>
    </Stack>
  );
}
