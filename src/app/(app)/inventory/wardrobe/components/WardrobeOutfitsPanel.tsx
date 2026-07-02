"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Title, Button, Badge,
  Skeleton, Center, ActionIcon, Menu, Modal, TextInput, Select, MultiSelect,
} from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus, IconPalette, IconEdit, IconTrash, IconHeart, IconHeartFilled,
  IconDotsVertical, IconCalendar, IconClock,
} from "@tabler/icons-react";
import { OCCASIONS, MOODS, SEASONS } from "@/modules/wardrobe/constants";

function OutfitCard({ outfit, onEdit, onDelete }: { outfit: any; onEdit: () => void; onDelete: () => void }) {
  const itemCount = outfit.items?.length || 0;

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
      styles={{ root: { "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } } }}>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap={6}>
            <IconPalette size={18} color="var(--mantine-color-violet-6)" />
            <Text fw={600} size="sm" lineClamp={1}>{outfit.name}</Text>
          </Group>
          <Menu withinPortal position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm"><IconDotsVertical size={14} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>Edit</Menu.Item>
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap={4}>
          {outfit.occasion && <Badge size="sm" variant="light" tt="capitalize">{outfit.occasion}</Badge>}
          {outfit.mood && <Badge size="sm" variant="outline" tt="capitalize">{outfit.mood}</Badge>}
          {outfit.season && <Badge size="sm" color="gray" tt="capitalize">{outfit.season}</Badge>}
        </Group>

        <Group gap="xs">
          <IconCalendar size={14} />
          <Text size="xs" c="dimmed">{itemCount} items · {outfit.wearCount || 0} wears</Text>
        </Group>

        {outfit.description && <Text size="xs" c="dimmed" lineClamp={2}>{outfit.description}</Text>}
      </Stack>
    </Card>
  );
}

export function WardrobeOutfitsPanel() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editOutfit, setEditOutfit] = useState<any>(null);
  const [form, setForm] = useState<{ name: string; description: string; occasion: string | null; season: string | null; mood: string | null; itemIds: string[] }>({ name: "", description: "", occasion: null, season: null, mood: null, itemIds: [] });

  const fetchData = async () => {
    try {
      const [outfitsRes, itemsRes] = await Promise.all([
        fetch("/api/inventory/wardrobe/outfits"),
        fetch("/api/inventory/wardrobe/items"),
      ]);
      setOutfits(await outfitsRes.json());
      setItems(await itemsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (outfit: any) => {
    setEditOutfit(outfit);
    setForm({
      name: outfit.name || "",
      description: outfit.description || "",
      occasion: outfit.occasion || null,
      season: outfit.season || null,
      mood: outfit.mood || null,
      itemIds: outfit.items?.map((i: any) => i.itemId) || [],
    });
    open();
  };

  const openCreate = () => {
    setEditOutfit(null);
    setForm({ name: "", description: "", occasion: null, season: null, mood: null, itemIds: [] });
    open();
  };

  const handleSave = async () => {
    const body = {
      name: form.name,
      description: form.description || undefined,
      occasion: form.occasion || undefined,
      season: form.season || undefined,
      mood: form.mood || undefined,
      itemIds: form.itemIds,
    };

    if (editOutfit) {
      await fetch(`/api/inventory/wardrobe/outfits/${editOutfit.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/inventory/wardrobe/outfits", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    close();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/wardrobe/outfits/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={160} radius="md" />)}</SimpleGrid>;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Outfits ({outfits.length})</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>Create Outfit</Button>
      </Group>

      {outfits.length === 0 ? (
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconPalette size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">No outfits yet</Text>
            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openCreate}>Create Your First Outfit</Button>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit}
              onEdit={() => openEdit(outfit)}
              onDelete={() => handleDelete(outfit.id)} />
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title={editOutfit ? "Edit Outfit" : "Create Outfit"} size="lg">
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
          <Group grow>
            <Select label="Occasion" data={OCCASIONS.map(o => ({ value: o, label: o.charAt(0).toUpperCase() + o.slice(1) }))}
              value={form.occasion} onChange={v => setForm({ ...form, occasion: v })} clearable searchable />
            <Select label="Season" data={SEASONS.map(s => ({ value: s, label: s === "all-season" ? "All Season" : s.charAt(0).toUpperCase() + s.slice(1) }))}
              value={form.season} onChange={v => setForm({ ...form, season: v })} clearable />
            <Select label="Mood" data={MOODS.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
              value={form.mood} onChange={v => setForm({ ...form, mood: v })} clearable searchable />
          </Group>
          <MultiSelect label="Items" data={items.map(i => ({ value: i.id, label: `${i.name} (${i.category})` }))}
            value={form.itemIds} onChange={v => setForm({ ...form, itemIds: v })} searchable clearable />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={close}>Cancel</Button>
            <Button onClick={handleSave}>{editOutfit ? "Save Changes" : "Create Outfit"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
