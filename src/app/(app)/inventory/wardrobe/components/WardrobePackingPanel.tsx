"use client";

import { useEffect, useState } from "react";
import {
  Card, Text, Group, Stack, SimpleGrid, Title, Button, Badge,
  TextInput, Modal, Checkbox, Skeleton, Center, ActionIcon, Menu,
} from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconBackpack, IconEdit, IconTrash, IconDotsVertical, IconCheck, IconPlane } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";
import type { ClothingItem } from "@/modules/wardrobe";

export function WardrobePackingPanel() {
  const [lists, setLists] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [form, setForm] = useState({ name: "", destination: "", startDate: "", endDate: "", notes: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData] = await Promise.all([
        apiFetch<ClothingItem[]>("/api/inventory/wardrobe/items"),
      ]);
      setItems(itemsData);
      setLists([
        { id: "1", name: "Weekend Trip", destination: "Pokhara", startDate: "2026-06-20", endDate: "2026-06-22", items: [{ name: "T-Shirt", isPacked: false }, { name: "Jeans", isPacked: true }] }
      ]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Skeleton height={300} radius="md" />;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Packing Lists</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>New List</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {lists.length === 0 ? (
          <Center h={300} style={{ gridColumn: "1/-1" }}>
            <Stack align="center" gap="md">
              <IconBackpack size={48} color="var(--mantine-color-gray-5)" />
              <Text c="dimmed">No packing lists yet</Text>
              <Button variant="light" leftSection={<IconPlus size={16} />} onClick={open}>Create Packing List</Button>
            </Stack>
          </Center>
        ) : lists.map(list => (
          <Card key={list.id} shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap={6}>
                  <IconBackpack size={18} color="var(--mantine-color-teal-6)" />
                  <Text fw={600}>{list.name}</Text>
                </Group>
                <Menu withinPortal position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm"><IconDotsVertical size={14} /></ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
                    <Menu.Item leftSection={<IconTrash size={14} />} color="red">Delete</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
              {list.destination && <Text size="sm" c="dimmed"><IconPlane size={12} /> {list.destination}</Text>}
              <Text size="xs" c="dimmed">{list.startDate} - {list.endDate}</Text>
              <Group gap={4}>
                {list.items?.map((item: any, i: number) => (
                  <Badge key={i} size="sm" variant={item.isPacked ? "filled" : "outline"} color={item.isPacked ? "green" : "gray"}>
                    {item.isPacked && <IconCheck size={10} />} {item.name}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={opened} onClose={close} title="New Packing List">
        <Stack gap="sm">
          <TextInput label="Trip Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextInput label="Destination" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
          <Group grow>
            <TextInput label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <TextInput label="End Date" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Group>
          <Text size="sm" fw={500}>Notes</Text>
          <Editor
            content={textToEditorContent(form.notes)}
            onChange={(_json, _html, text) => setForm({ ...form, notes: text })}
            placeholder="Notes"
            minHeight="80px"
            showToolbar={false}
          />
          <Button mt="md">Create List</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
