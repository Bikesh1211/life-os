"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Title, Button, Badge,
  Skeleton, Center, ActionIcon, Menu, Modal, TextInput, MultiSelect,
} from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconComponents, IconEdit, IconTrash, IconDotsVertical, IconDeviceLaptop } from "@tabler/icons-react";

export default function TechSetupsPage() {
  const [setups, setSetups] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editSetup, setEditSetup] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", itemIds: [] as string[] });

  const fetchData = async () => {
    try {
      const [setupsRes, itemsRes] = await Promise.all([
        fetch("/api/inventory/tech-gear/setups"),
        fetch("/api/inventory/tech-gear/items"),
      ]);
      setSetups(await setupsRes.json());
      setItems(await itemsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (setup: any) => {
    setEditSetup(setup);
    setForm({ name: setup.name || "", description: setup.description || "", itemIds: setup.items?.map((i: any) => i.itemId) || [] });
    open();
  };

  const openCreate = () => { setEditSetup(null); setForm({ name: "", description: "", itemIds: [] }); open(); };

  const handleSave = async () => {
    const body = { name: form.name, description: form.description || undefined, itemIds: form.itemIds };
    if (editSetup) {
      await fetch(`/api/inventory/tech-gear/setups/${editSetup.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/inventory/tech-gear/setups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    close(); fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/tech-gear/setups/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={140} radius="md" />)}</SimpleGrid>;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Setups ({setups.length})</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>Create Setup</Button>
      </Group>

      {setups.length === 0 ? (
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconComponents size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">No setups yet</Text>
            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openCreate}>Create Your First Setup</Button>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {setups.map(setup => (
            <Card key={setup.id} shadow="sm" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap={6}>
                    <IconComponents size={18} color="var(--mantine-color-cyan-6)" />
                    <Text fw={600}>{setup.name}</Text>
                  </Group>
                  <Menu withinPortal position="bottom-end">
                    <Menu.Target><ActionIcon variant="subtle" size="sm"><IconDotsVertical size={14} /></ActionIcon></Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openEdit(setup)}>Edit</Menu.Item>
                      <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(setup.id)}>Delete</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                {setup.description && <Text size="xs" c="dimmed" lineClamp={2}>{setup.description}</Text>}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title={editSetup ? "Edit Setup" : "Create Setup"} size="lg">
        <Stack gap="sm">
          <TextInput label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Text size="sm" fw={500}>Description</Text>
          <Editor
            content={textToEditorContent(form.description)}
            onChange={(_json, _html, text) => setForm({ ...form, description: text })}
            placeholder="Description"
            minHeight="80px"
            showToolbar={false}
          />
          <MultiSelect label="Items" data={items.map(i => ({ value: i.id, label: `${i.name}${i.brand ? ` (${i.brand})` : ""}` }))}
            value={form.itemIds} onChange={v => setForm({ ...form, itemIds: v })} searchable clearable />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={close}>Cancel</Button>
            <Button onClick={handleSave}>{editSetup ? "Save Changes" : "Create Setup"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
